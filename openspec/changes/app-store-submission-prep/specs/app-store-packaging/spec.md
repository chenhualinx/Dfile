## ADDED Requirements

### Requirement: Privacy manifest
The system SHALL include a `PrivacyInfo.xcprivacy` file declaring all required reason APIs and data access categories.

#### Scenario: Privacy manifest created
- **WHEN** the app is built for App Store distribution
- **THEN** a `PrivacyInfo.xcprivacy` file is included in the bundle with all required privacy declarations

#### Scenario: Required reason APIs declared
- **WHEN** the app uses macOS APIs that require declared reasons
- **THEN** those API usages are documented in the privacy manifest with appropriate reason codes

### Requirement: Privacy policy accessibility
The system SHALL provide an accessible privacy policy within the app, linking to the policy used for App Store submission.

#### Scenario: Privacy policy accessible in app
- **WHEN** user navigates to app settings
- **THEN** there is a link to the privacy policy

## MODIFIED Requirements

### Requirement: Sandbox compliance
The system SHALL conform to macOS App Sandbox requirements with appropriate entitlements for file access and USB communication.

#### Scenario: Sandbox entitlements configured
- **WHEN** the app is built for App Store distribution
- **THEN** it includes only App Store-compatible entitlements: `com.apple.security.app-sandbox`, `com.apple.security.device.usb`, `com.apple.security.files.user-selected.read-write`, `com.apple.security.network.client`
- **AND** it does NOT include App Store-incompatible entitlements such as `com.apple.security.cs.disable-library-validation`

#### Scenario: File access limited
- **WHEN** user downloads a file
- **THEN** the system prompts for save location via NSSavePanel (sandbox-compliant file access)

#### Scenario: USB access limited
- **WHEN** user connects an Android device
- **THEN** the system requests USB access permission if not already granted

### Requirement: App Store metadata
The system SHALL include proper App Store metadata including privacy policy, supported languages, and category classification.

#### Scenario: Privacy manifest included
- **WHEN** the app is submitted to App Store
- **THEN** it includes a `PrivacyInfo.xcprivacy` file declaring all required reason APIs

#### Scenario: Privacy policy
- **WHEN** the app is submitted to App Store
- **THEN** it includes a privacy policy stating no data collection (files never leave user's machine)
