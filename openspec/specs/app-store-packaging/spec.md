## ADDED Requirements

### Requirement: Sandbox compliance
The system SHALL conform to macOS App Sandbox requirements with appropriate entitlements for file access and USB communication.

#### Scenario: Sandbox entitlements configured
- **WHEN** the app is built for App Store distribution
- **THEN** it includes entitlements: com.apple.security.device.usb, com.apple.security.files.user-selected.read-write, com.apple.security.network.client

#### Scenario: File access limited
- **WHEN** user downloads a file
- **THEN** the system prompts for save location via NSSavePanel (sandbox-compliant file access)

### Requirement: Code signing and notarization
The system SHALL be code-signed with Apple Developer ID and notarized for macOS Gatekeeper compatibility.

#### Scenario: Developer ID signing
- **WHEN** the release binary is built
- **THEN** it is signed with Apple Developer ID Application certificate

#### Scenario: Notarization
- **WHEN** the signed binary is submitted for distribution
- **THEN** it passes Apple notarization checks

### Requirement: Universal binary
The system SHALL ship as a universal binary supporting both Apple Silicon (arm64) and Intel (x86_64) architectures.

#### Scenario: Build universal binary
- **WHEN** the release build runs
- **THEN** it produces a universal binary with both arm64 and x86_64 slices

### Requirement: App Store metadata
The system SHALL include proper App Store metadata including privacy policy, supported languages, and category classification.

#### Scenario: Privacy policy
- **WHEN** the app is submitted to App Store
- **THEN** it includes a privacy policy stating no data collection (files never leave user's machine)

### Requirement: Auto-update
The system SHALL use Mac App Store's built-in auto-update mechanism for app updates.

#### Scenario: App Store update
- **WHEN** a new version is available on App Store
- **THEN** the Mac App Store handles download and installation of the update
