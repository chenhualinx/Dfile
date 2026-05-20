## Why

macOS lacks a first-class, modern Android file transfer tool. Existing solutions (Android File Transfer, OpenMTP) are outdated, unreliable, or not Mac App Store compliant. A Tauri-based app delivers a native-feeling experience with a modern UI while leveraging Rust for performant MTP operations.

## What Changes

- Build a macOS-native Android file transfer application from scratch
- Implement MTP protocol support for file browsing and transfer between Mac and Android devices
- Package for Mac App Store distribution with proper sandboxing and entitlements
- Provide a clean, modern UI using React + shadcn/ui design system
- Ship as a universal binary (arm64 + x86_64)

## Capabilities

### New Capabilities

- `device-connection`: Android device discovery, MTP connection management, and device information display
- `file-browsing`: Navigate Android device filesystem with directory listing, thumbnails, and search
- `file-transfer`: Upload/download files and directories with progress tracking, resume support, and conflict resolution
- `batch-operations`: Multi-select file operations including bulk transfer, delete, and folder sync
- `mtp-core`: Low-level MTP protocol implementation in Rust with libusb transport, object/data handlers, and storage enumeration
- `app-store-packaging`: Mac App Store compliance with sandbox entitlements, code signing, and notarization
- `storage-management`: View device storage usage, format SD cards, and free up space analysis

### Modified Capabilities

<!-- No existing capabilities to modify. -->

## Impact

- **Stack**: Tauri v2 (Rust backend) + React (TypeScript) + shadcn/ui + Bun
- **Dependencies**: `rusb` (USB transport), custom MTP protocol layer in Rust, `tauri` v2, `react-router`, `tanstack-query`
- **Targets**: macOS 13+ (Ventura minimum), universal binary
- **Distribution**: Mac App Store via private listing
