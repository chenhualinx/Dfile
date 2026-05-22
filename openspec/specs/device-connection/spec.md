## ADDED Requirements

### Requirement: Device detection
The system SHALL automatically detect Android devices when connected via USB and display them in the sidebar.

#### Scenario: Device appears on connect
- **WHEN** an Android device is connected via USB
- **THEN** the system shows the device in the sidebar within 3 seconds

#### Scenario: Device disappears on disconnect
- **WHEN** a connected Android device is unplugged
- **THEN** the system removes the device from the sidebar within 2 seconds

### Requirement: Device information display
The system SHALL display device metadata including manufacturer, model, serial number, total storage, and available storage.

#### Scenario: View device info
- **WHEN** user selects a connected device
- **THEN** the system shows device name, manufacturer, model, storage capacity, and free space

### Requirement: Multiple device support
The system SHALL support multiple Android devices connected simultaneously, each shown as separate entries in the sidebar.

#### Scenario: Two devices connected
- **WHEN** two Android devices are connected
- **THEN** both devices appear in the sidebar with distinct identifiers

### Requirement: Connection error handling
The system SHALL handle connection errors gracefully, showing user-friendly messages for permission issues, incompatible devices, or USB failures.

#### Scenario: USB permission not granted
- **WHEN** macOS USB access permission is denied
- **THEN** the system shows a prompt directing user to System Settings > Privacy & Security > USB

#### Scenario: Incompatible device
- **WHEN** a connected device does not support MTP
- **THEN** the system shows an error message indicating the device is not MTP-compatible
