## ADDED Requirements

### Requirement: USB permission guidance
The system SHALL detect USB access permission status and provide clear guidance to the user when permission is not granted.

#### Scenario: USB permission not granted
- **WHEN** the app starts and USB access permission is not granted
- **THEN** the system displays a dialog explaining that USB access is required for MTP device connection, with a button to open System Settings > Privacy & Security > USB

#### Scenario: USB permission granted
- **WHEN** the user grants USB permission in System Settings and returns to the app
- **THEN** the app automatically detects the permission change and enables device connection

### Requirement: File access permission guidance
The system SHALL request file access permission appropriately and handle denial gracefully.

#### Scenario: File download triggers save dialog
- **WHEN** user initiates a file download
- **THEN** the system opens NSSavePanel for the user to select a save location (sandbox-compliant)

#### Scenario: File upload triggers open dialog
- **WHEN** user initiates a file upload
- **THEN** the system opens NSOpenPanel for the user to select files to upload (sandbox-compliant)

### Requirement: Network permission handling
The system SHALL handle network access within App Sandbox constraints.

#### Scenario: Network client permission enabled
- **WHEN** the app needs to make network requests
- **THEN** the app uses `com.apple.security.network.client` entitlement for outbound connections

### Requirement: Permission denied user experience
The system SHALL provide a user-friendly interface when permissions are denied, guiding users to resolve the issue.

#### Scenario: Permission denied UI
- **WHEN** a required permission is denied
- **THEN** the app shows a clear, localized error message explaining why the permission is needed and how to grant it

#### Scenario: Multiple permissions check
- **WHEN** the app starts
- **THEN** the system checks USB and file access permissions and presents a combined status if multiple permissions are missing
