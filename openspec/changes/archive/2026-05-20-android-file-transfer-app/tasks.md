## 1. Project Scaffolding

- [x] 1.1 Initialize Tauri v2 project with Bun (`bun create tauri-app`)
- [x] 1.2 Set up React + TypeScript + Vite toolchain
- [x] 1.3 Install and configure `shadcn/ui` with custom theme
- [x] 1.4 Set up Rust crate structure: `src-tauri/src/` with `mtp-core/`, `usb-transport/`, `commands/` modules
- [x] 1.5 Add Rust dependencies: `rusb`, `serde`, `tokio`, `tauri`, `thiserror`
- [ ] 1.6 Set up project ESLint, Prettier, and Rust fmt/clippy configs
- [x] 1.7 Create basic app shell: sidebar + main content area + transfer queue panel

## 2. USB Transport Layer

- [x] 2.1 Implement `rusb`-based device enumeration filtering by MTP class code (0x06)
- [x] 2.2 Implement USB interface claim/release with proper timeout handling
- [x] 2.3 Implement bulk IN/OUT endpoint discovery from USB interface descriptors
- [x] 2.4 Implement USB bulk read/write with interrupt pipe reset on timeout
- [ ] 2.5 Add macOS IOKit integration for device arrival/removal events via IOKit notification
- [x] 2.6 Implement USB error recovery: pipe reset, interface re-claim, device re-enumeration
- [ ] 2.7 Unit tests for USB transport with mock device handles

## 3. MTP Protocol Core (Rust)

- [x] 3.1 Implement MTP container serialization/deserialization (PTP/MTP header + payload)
- [x] 3.2 Implement MTP command phase: send command block (0x1000 range), await response (0x2000 range)
- [x] 3.3 Implement MTP data phase: send/receive data with transaction tracking
- [x] 3.4 Implement session management: OpenSession (0x1002), CloseSession (0x1003)
- [x] 3.5 Implement device info: GetDeviceInfo (0x1001), GetDevicePropDesc
- [x] 3.6 Implement storage enumeration: GetStorageIDs (0x1004), GetStorageInfo (0x1005)
- [x] 3.7 Implement object enumeration: GetNumObjects (0x1006), GetObjectHandles (0x1007), GetObjectInfo (0x1008)
- [x] 3.8 Implement object transfer: GetObject (0x1009), SendObjectInfo (0x100C), SendObject (0x100D)
- [x] 3.9 Implement object management: DeleteObject (0x100B), MoveObject (0x100A)
- [x] 3.10 Implement object creation: SendObjectPropList for directory creation
- [x] 3.11 Implement GetPartialObject (0x101B) for transfer resume support
- [x] 3.12 Add error handling: MTP response codes, device disconnection, USB errors
- [ ] 3.13 Unit tests for MTP protocol parser/serializer with known good packet data

## 4. Device Connection (Backend + Frontend)

- [x] 4.1 Create Tauri commands: `list_devices`, `connect_device`, `disconnect_device`
- [x] 4.2 Implement device state management in Rust (session pool per device)
- [ ] 4.3 Implement Tauri events for device `connected`/`disconnected` push events
- [x] 4.4 Build DeviceSidebar component showing connected devices with storage info
- [x] 4.5 Build device info panel (manufacturer, model, storage capacity, free space)
- [ ] 4.6 Add USB permission prompt UI directing to System Settings
- [x] 4.7 Implement polling fallback when IOKit events are unavailable in sandbox

## 5. File Browsing (Backend + Frontend)

- [x] 5.1 Create Tauri command: `list_objects(storage_id, parent_handle, offset, count)` with paginated object handles
- [x] 5.2 Create Tauri command: `get_object_info(handle)` for single file metadata
- [x] 5.3 Create Tauri command: `count_objects(storage_id, parent_handle)` via GetNumObjects
- [x] 5.4 Implement frontend `useQuery` with directory fetching, page size 200
- [x] 5.5 Build FileBrowser component with `@tanstack/react-virtual`
- [x] 5.6 Build BreadcrumbNav component showing current path with clickable segments
- [x] 5.7 Build Lucide-based `FileIcon` component mapping MIME types to icons
- [x] 5.8 Build human-readable size formatting (KB/MB/GB auto)
- [x] 5.9 Implement filename search with 300ms debounce
- [ ] 5.10 Implement thumbnail fetching via GetThumb when supported
- [x] 5.11 Add keyboard navigation: arrow keys, Enter to open, Backspace to go up
- [x] 5.12 Fallback: devices without paginated handles — full fetch + client-side virtual scroll

## 6. File Transfer (Backend + Frontend)

- [x] 6.1 Create Tauri command: `download_file(device_id, object_handle, dest_path)` with streaming
- [x] 6.2 Create Tauri command: `upload_file(device_id, parent_handle, source_path)` with streaming
- [x] 6.3 Emit progress events (`transfer:progress`) during active transfers
- [x] 6.4 Build TransferQueuePanel showing all transfers (active, queued, completed, failed)
- [x] 6.5 Build progress indicators: percentage, speed, ETA, bytes transferred/total
- [x] 6.6 Implement transfer cancellation with `Abort` event handling
- [x] 6.7 Implement retry for failed transfers
- [x] 6.8 Build drag-and-drop support (Finder → app folder for upload)
- [x] 6.9 Implement conflict resolution dialog: skip, overwrite, rename, apply to all
- [x] 6.11 Add transfer queue persistence (survives app restart)

## 7. Batch Operations

- [x] 7.1 Implement multi-select in FileBrowser (Cmd+click, Shift+click, Cmd+A)
- [x] 7.2 Create Tauri command: `batch_download(items)` with concurrent transfers
- [x] 7.3 Build batch download UI with selection toolbar (Download N items button)
- [ ] 7.4 Implement recursive folder download preserving directory structure
- [x] 7.5 Create Tauri command: `batch_delete(handles)` with confirmation
- [x] 7.6 Build delete confirmation dialog showing file count and total size
- [ ] 7.7 Implement one-way folder sync: compare timestamps/sizes, transfer diffs only
- [ ] 7.8 Build folder sync UI with source/destination selection and dry-run preview

## 8. Storage Management

- [x] 8.1 Create Tauri commands: `get_storage_info`, `get_storage_usage_by_type`
- [x] 8.2 Build StorageOverview component with visual usage bars per partition
- [x] 8.3 Implement storage categorization by file type (images, video, audio, docs, other)
- [x] 8.4 Build "Free Up Space" panel listing largest files (100MB+) with delete option
- [x] 8.5 Display SD card as separate storage entry with distinct styling
- [x] 8.6 Show total reclaimable space when user selects files for cleanup

## 9. Mac App Store Packaging

- [x] 9.1 Configure Tauri for macOS bundle: bundle identifier, category, minimum system version
- [x] 9.2 Add sandbox entitlements: `com.apple.security.device.usb`, `com.apple.security.files.user-selected.read-write`, `com.apple.security.network.client`
- [ ] 9.3 Implement sandbox-compliant file save dialogs for downloads via `tauri::dialog`
- [x] 9.4 Set up universal binary build (arm64 + x86_64 via `--target universal-apple-darwin`)
- [x] 9.5 Create CI pipeline for codesigning and notarization (GitHub Actions + `xcrun notarytool`)
- [ ] 9.6 Prepare App Store listing: screenshots, description, privacy policy, categories
- [ ] 9.7 Test sandbox behavior: USB access approval flow, file dialog scoping
- [ ] 9.8 Submit for App Store review with test account and documentation

## 10. Error Handling & Polish

- [x] 10.1 Implement global error boundary in React with retry actions
- [x] 10.2 Handle device disconnection mid-transfer with graceful cleanup
- [ ] 10.3 Add transfer history log (last 30 days) with success/failure details
- [x] 10.4 Implement auto-refresh on device reconnection
- [x] 10.6 Build empty state illustrations for no-device, empty-directory scenarios
- [x] 10.7 Add keyboard shortcuts help dialog (Cmd+/)
- [x] 10.8 Implement app menu bar entries: File, Edit, View, Transfer, Help
- [x] 10.9 Add `i18next` + `react-i18next` + `i18next-browser-languagedetector` dependencies
- [x] 10.10 Create `src/i18n/translations/` YAML source files (common, menu, transfer, device, error) with zh-CN/en-US
- [x] 10.11 Create `scripts/build-translations.ts` to convert YAML → per-language JSON files
- [x] 10.12 Add `bun run i18n:build` script and wire into build pipeline
- [x] 10.13 Set up i18n instance with static JSON imports, `localStorage` + `navigator` detection, zh-CN fallback
- [x] 10.14 Wire language switcher into Settings UI, persist to Tauri backend config
- [x] 10.15 Add `<html dir>` RTL support via `languageChanged` event
- [x] 10.16 Embed same JSON in Rust backend via `include_str!()` for native dialog translations
- [x] 10.17 Add scroll-triggered loading indicator at bottom of file list when fetching next page
