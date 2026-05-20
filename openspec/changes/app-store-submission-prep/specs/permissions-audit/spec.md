## ADDED Requirements

### Requirement: Entitlements audit
The system SHALL audit the current `entitlements.plist` and remove any entitlements that are incompatible with macOS App Store distribution.

#### Scenario: Incompatible entitlement removed
- **WHEN** the entitlements audit runs
- **THEN** `com.apple.security.cs.disable-library-validation` is removed from `entitlements.plist`

#### Scenario: Required entitlements verified
- **WHEN** the entitlements audit runs
- **THEN** all required entitlements (`com.apple.security.app-sandbox`, `com.apple.security.device.usb`, `com.apple.security.files.user-selected.read-write`, `com.apple.security.network.client`) are present and correctly configured

### Requirement: macOSPrivateApi audit
The system SHALL audit the `tauri.conf.json` for `macOSPrivateApi` usage and ensure the app does not use private macOS APIs.

#### Scenario: Private API disabled
- **WHEN** the app is built for App Store distribution
- **THEN** `macOSPrivateApi` is set to `false` in `tauri.conf.json`

#### Scenario: Window behavior verified
- **WHEN** `macOSPrivateApi` is disabled
- **THEN** all window behaviors (title bar, transparency, shadows) continue to work as expected

### Requirement: Tauri capability audit
The system SHALL audit the Tauri capabilities configuration (`capabilities/default.json`) to ensure permissions are appropriate for App Store sandbox environment.

#### Scenario: Capabilities reviewed
- **WHEN** the capability audit runs
- **THEN** each permission in `capabilities/default.json` is verified to work within App Sandbox constraints

### Requirement: Third-party dependency audit
The system SHALL audit all Rust and JavaScript dependencies to ensure no dependency uses private APIs or is incompatible with App Store distribution.

#### Scenario: Dependencies scanned
- **WHEN** the dependency audit runs
- **THEN** all direct and transitive dependencies are checked for App Store compatibility issues
