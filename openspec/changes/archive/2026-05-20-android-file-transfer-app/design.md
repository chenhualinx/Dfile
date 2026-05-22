## Context

macOS has no reliable, modern Android file transfer tool. The official Google "Android File Transfer" is Java-based, buggy, and deprecated. OpenMTP relies on libmtp which has poor macOS support. This project builds a native macOS solution using Tauri v2 with a pure Rust MTP implementation, targeting Mac App Store distribution.

The app bridges a macOS desktop frontend (React/shadcn/ui) with Android's MTP protocol over USB, requiring low-level USB device communication, MTP command/response handling, and macOS sandbox-compatible architecture.

## Goals / Non-Goals

**Goals:**
- Reliable MTP file transfer between macOS and Android devices
- Modern, native-feeling UI with progress tracking
- Mac App Store distribution with proper sandboxing
- Universal binary (arm64 + x86_64)
- Support for multiple Android devices connected simultaneously
- File operations: browse, upload, download, delete, rename, mkdir

**Non-Goals:**
- Android app or companion service (MTP is device-initiated)
- Windows/Linux support (future consideration)
- Wireless/ADB-based transfer (USB MTP only)
- Media sync/playlist management
- Device backup/restore
- File preview/editing within the app

### Decision 0: Icon System

**Chosen:** Lucide icons via `lucide-react` (shadcn/ui's default icon library).

**Rationale:**
- shadcn/ui 所有组件默认使用 Lucide，保持视觉一致性
- Lucide 提供完整的文件类型图标集：`Folder`, `FileImage`, `FileVideo`, `FileAudio`, `FileText`, `FileArchive`, `File` 等
- 用 `<FileIcon mimeType="image/jpeg" />` 组件做自动映射，无需手动维护
- 体积小、tree-shakable，图标不拖慢冷启动

## Decisions

### Decision 1: Pure Rust MTP Implementation over libmtp Bindings

**Chosen:** Custom MTP protocol implementation in Rust using `rusb` for USB transport.

**Rationale:**
- `libmtp` uses autotools, has fragile macOS support, and requires Homebrew or manual build
- Pure Rust avoids C dependency headaches for App Store sandboxing and code signing
- Full control over the MTP protocol means we can optimize for macOS-specific USB behavior
- The MTP protocol (PTP/MTP over USB) is well-documented (USB-IF MTP spec v1.1)

**Alternatives considered:**
- `libmtp` via FFI: Mature but Linux-focused, macOS patching required, complicates build
- `mtp-rs` crate: Incomplete, unmaintained, doesn't support all MTP operations
- NIO-based IOKit: Only works on macOS but more complex for future cross-platform support

### Decision 2: Tauri v2 with Sidecar vs In-Process MTP

**Chosen:** In-process MTP via Tauri commands in Rust backend.

**Rationale:**
- Tauri v2's async commands handle non-blocking USB I/O well
- No IPC overhead from sidecar process
- Simplified error handling and state management
- Direct access to macOS APIs through Tauri's plugin system

### Decision 3: TanStack Query for Server State

**Chosen:** TanStack Query for all device/file state management.

**Rationale:**
- Caching device listings and directory contents reduces USB round-trips
- Automatic refetch on device connect/disconnect
- Built-in optimistic updates for file operations
- Pairs well with Tauri's async command pattern

### Decision 4: USB Access via System Extensions

**Chosen:** Use Tauri's `usb` plugin + `com.apple.security.device.usb` entitlement.

**Rationale:**
- Mac App Store requires explicit entitlements for USB access
- Tauri v2 USB plugin abstracts the IOKit/IOUSBFamily interface
- On macOS 11+, USB access needs user approval - handled via system prompt
- No need for kernel extension (kext) which Apple is deprecating

### Decision 5: File Transfer Strategy

**Chosen:** Streaming transfers with chunked read/write, progress events via Tauri emit.

**Rationale:**
- MTP objects are transferred in 16KB-128KB data packets over USB
- Streaming avoids loading entire files into memory
- Tauri events emit real-time progress to frontend
- Pause/resume via stored transfer state + MTP object handles

## Architecture Overview

```
┌────────────────────────────────────────────────┐
│  React Frontend (TypeScript)                    │
│  ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ shadcn/ui│ │ TanStack │ │ React Router   │  │
│  │ components│ │  Query   │ │   + Layout     │  │
│  └──────────┘ └──────────┘ └───────────────┘  │
│        │            │              │            │
│  ┌─────┴────────────┴──────────────┴──────┐   │
│  │     Tauri IPC (invoke + events)          │   │
│  └────────────────┬────────────────────────┘   │
├───────────────────┼────────────────────────────┤
│  Rust Backend     │                            │
│  ┌────────────────┴────────────────────────┐  │
│  │  Tauri Commands Layer                     │  │
│  │  (list_devices, list_dir, get_object,     │  │
│  │   send_object, delete_object, ...)        │  │
│  └────────────────┬────────────────────────┘  │
│  ┌────────────────┴────────────────────────┐  │
│  │  MTP Core Library                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │Session   │ │Object    │ │Storage │  │  │
│  │  │Layer     │ │Handler   │ │Manager │  │  │
│  │  └────┬─────┘ └────┬─────┘ └───┬────┘  │  │
│  │  ┌────┴────────────┴────────────┴───┐  │  │
│  │  │  MTP Protocol Parser/Serializer   │  │  │
│  │  │  (PTP/MTP operations over USB)    │  │  │
│  │  └────────────────┬──────────────────┘  │  │
│  │  ┌────────────────┴──────────────────┐  │  │
│  │  │  USB Transport (rusb)              │  │  │
│  │  │  (libusb → IOKit on macOS)         │  │  │
│  │  └────────────────┬──────────────────┘  │  │
│  └───────────────────┼─────────────────────┘  │
│                      │                         │
│  macOS System Calls  │                         │
│  ┌───────────────────┴────────────────────┐  │
│  │  IOKit (USB)  │  App Sandbox           │  │
│  │  IOUSBFamily  │  com.apple.security.   │  │
│  │               │  device.usb            │  │
│  └────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### MTP Protocol Flow

```
USB Enumeration → Device Descriptor → Interface (MTP Class)
  → Open Session → Get Device Info → Storage Enumeration
  → Object Handling (List/Get/Send/Delete)
  → Close Session → Disconnect
```

### Key MTP Operations

| Operation | OpCode | Description |
|-----------|--------|-------------|
| OpenSession | 0x1002 | Start MTP session |
| CloseSession | 0x1003 | End MTP session |
| GetDeviceInfo | 0x1001 | Device capabilities |
| GetStorageIDs | 0x1004 | List storage IDs |
| GetStorageInfo | 0x1005 | Storage details |
| GetNumObjects | 0x1006 | Object count in folder |
| GetObjectHandles | 0x1007 | List objects |
| GetObjectInfo | 0x1008 | Object metadata |
| GetObject | 0x1009 | Download object |
| SendObjectInfo | 0x100C | Send metadata |
| SendObject | 0x100D | Upload object |
| DeleteObject | 0x100B | Delete object |
| MoveObject | 0x100A | Move/rename |

### Decision 6: Large Directory Handling

**Chosen:** MTP-side paginated object handles + frontend virtual scrolling.

**Rationale:**
- MTP `GetObjectHandles` 支持 `offset` + `count` 参数，可分批拉取，避免一次拉取数万个对象导致 USB 超时
- 前端用 `@tanstack/react-virtual` 只渲染可视区域行（+ overscan 5 行），无论目录多大 DOM 节点数恒定
- TanStack Query 的 `useInfiniteQuery` 天然适配分页场景
- 设备若不支持分页（部分旧设备），降级为全量拉取 + 虚拟滚动，前端依然不卡

**Data flow:**
```
scroll position change
  → useInfiniteQuery calculates next page
  → invoke('list_objects', { storageId, parentHandle, offset, count })
  → Rust: GetObjectHandles(offset, count) + GetObjectInfo for each handle
  → return page of entries
  → @tanstack/react-virtual adjusts visible rows
```

**Alternatives considered:**
- 全量拉取 + 客户端虚拟滚动：设备文件量大时 USB 耗时过长，首次加载体验差
- 全量拉取 + 分页器 (page 1/100)：不符合 macOS Finder 的滚动浏览习惯

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| MTP spec edge cases - devices implement MTP inconsistently | Extensive device compatibility testing; fallback to safe defaults; error recovery in protocol layer |
| macOS USB sandboxing prevents MTP access without user approval | Prompt for system USB permission on first launch; guidance UI for System Settings |
| App Store rejection due to USB entitlement | Use Apple's documented "com.apple.security.device.usb" for file transfer apps; prepare appeal documentation |
| Tauri v2 instability (newer framework) | Pin to stable Tauri releases; isolate MTP core from framework dependencies |
| MTP transfer speeds (USB 2.0 bottleneck, MTP overhead) | Use concurrent transfers for multiple small files; chunked large file streaming |
| Device disconnection during transfer | Graceful error handling; partial transfer cleanup; resume capability |
