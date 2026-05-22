## ADDED Requirements

### Requirement: Download files
The system SHALL allow users to download files from the Android device to the Mac, with real-time progress indication.

#### Scenario: Download single file
- **WHEN** user clicks download on a file
- **THEN** the system transfers the file from device to the user's Downloads folder with progress bar

#### Scenario: Download progress tracking
- **WHEN** a file is being downloaded
- **THEN** the system shows percentage complete, transfer speed (MB/s), estimated time remaining, and bytes transferred/total

#### Scenario: Transfer cancellation
- **WHEN** user clicks cancel during a transfer
- **THEN** the system aborts the transfer and cleans up any partial file

### Requirement: Upload files
The system SHALL allow users to upload files from Mac to the Android device.

#### Scenario: Upload single file
- **WHEN** user clicks upload and selects a macOS file
- **THEN** the system transfers the file to the current directory on the device

#### Scenario: Upload via drag-and-drop
- **WHEN** user drags a file from Finder onto the current directory
- **THEN** the system uploads the file with progress indication

### Requirement: Conflict resolution
The system SHALL detect filename conflicts and prompt the user to skip, overwrite, or rename.

#### Scenario: Filename conflict
- **WHEN** uploading a file that already exists in the destination
- **THEN** the system prompts: Skip, Overwrite, Rename, or Apply to all

#### Scenario: Apply to all selected
- **WHEN** user selects "Apply to all"
- **THEN** the chosen action applies to all subsequent conflicts in the current batch

### Requirement: Transfer queue
The system SHALL maintain a transfer queue showing current, pending, completed, and failed transfers.

#### Scenario: View transfer queue
- **WHEN** transfers are active or have completed
- **THEN** the system shows a transfer panel with status, progress, source, destination, and result for each item

#### Scenario: Retry failed transfer
- **WHEN** a transfer fails
- **THEN** the system shows a retry button, and user can retry individual failed transfers

### Requirement: Transfer resume
The system SHALL support resuming interrupted large file transfers when the device supports the MTP GetPartialObject (0x101B) operation.

#### Scenario: Resume interrupted download
- **WHEN** a download is interrupted and user retries
- **THEN** the system checks for existing partial file and resumes from the last complete chunk if the device supports partial reads
