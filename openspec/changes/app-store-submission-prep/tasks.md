## 1. Entitlements & Configuration Audit

- [x] 1.1 Remove `com.apple.security.cs.disable-library-validation` from `entitlements.plist`
- [x] 1.2 Set `macOSPrivateApi` to `false` in `tauri.conf.json`
- [x] 1.3 Verify remaining entitlements are correct and sufficient for App Store distribution
- [x] 1.4 Review `capabilities/default.json` for sandbox compatibility

## 2. Privacy Manifest

- [x] 2.1 Create `src-tauri/PrivacyInfo.xcprivacy` with required privacy declarations
- [x] 2.2 Declare required reason API usage (if any) with appropriate reason codes
- [x] 2.3 Reference `PrivacyInfo.xcprivacy` in `tauri.conf.json` bundle configuration

## 3. Runtime Permission UI

- [x] 3.1 Create permission check utility to detect USB access status on macOS
- [x] 3.2 Create PermissionGate component for displaying permission status and guidance
- [x] 3.3 Add "Open System Settings" button that deep-links to Privacy & Security > USB
- [x] 3.4 Create permission denied error states in file download/upload flows
- [x] 3.5 Add permission status polling or event listener for permission changes

## 4. Privacy Policy in App

- [x] 4.1 Add a Settings/About page or section with privacy policy link
- [x] 4.2 Add i18n translations for permission-related UI text (zh-CN + en-US)

## 5. Build & Verify

- [x] 5.1 Build the app with updated entitlements — TypeScript & Rust compile successfully
- [ ] 5.2 Test USB device connection with App Sandbox enabled (manual)
- [ ] 5.3 Test file download/upload with NSOpenPanel/NSSavePanel (manual)
- [ ] 5.4 Test window behavior after macOSPrivateApi removal (manual)
- [ ] 5.5 Verify PrivacyInfo.xcprivacy is included in the built bundle (manual)
