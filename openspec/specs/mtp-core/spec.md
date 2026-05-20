## ADDED Requirements

### Requirement: USB device enumeration
The system SHALL enumerate USB devices to find MTP-capable Android devices by matching USB class code 0x06 (PTP/MTP) for the interface.

#### Scenario: Find connected Android device
- **WHEN** an Android device is connected via USB with MTP enabled
- **THEN** the system detects the device by its USB interface class code 0x06

#### Scenario: No device connected
- **WHEN** no MTP-capable USB device is connected
- **THEN** the system returns an empty device list

### Requirement: MTP session management
The system SHALL manage MTP session lifecycle: open session (0x1002), maintain heartbeat, and close session (0x1003) on disconnect.

#### Scenario: Open session on connect
- **WHEN** a device is detected and user selects it
- **THEN** the system sends OpenSession command and stores the session ID

#### Scenario: Clean close session
- **WHEN** device is disconnected or user clicks eject
- **THEN** the system sends CloseSession and releases USB interface

### Requirement: MTP command dispatch
The system SHALL serialize and dispatch MTP operations as USB bulk transactions with proper command/response/data phase handling per MTP spec.

#### Scenario: Successful command execution
- **WHEN** an MTP command is dispatched (e.g., GetDeviceInfo)
- **THEN** the system receives a valid response container with the expected payload

#### Scenario: Command timeout
- **WHEN** a command does not receive a response within 5 seconds
- **THEN** the system returns a timeout error and resets the USB pipe

### Requirement: Object handle management
The system SHALL manage MTP object handles including retrieval of object info (0x1008) and hierarchical organization via ParentObject.

#### Scenario: List directory contents
- **WHEN** requesting objects under a given storage/parent handle
- **THEN** the system returns object info for all entries (files and folders)

### Requirement: Data phase handling
The system SHALL handle MTP data phase for send/receive operations with configurable chunk sizes (default 64KB).

#### Scenario: Receive object data
- **WHEN** downloading an object via GetObject (0x1009)
- **THEN** the system receives data packets until the transaction completes

#### Scenario: Send object data
- **WHEN** uploading an object via SendObject (0x100D)
- **THEN** the system sends data packets in chunks with proper transaction ID tracking
