## ADDED Requirements

### Requirement: Multi-select files
The system SHALL allow users to select multiple files and folders for batch operations using standard macOS selection patterns.

#### Scenario: Click to select multiple
- **WHEN** user clicks with Cmd (⌘) held
- **THEN** the system toggles individual item selection

#### Scenario: Range select
- **WHEN** user clicks with Shift held
- **THEN** the system selects a contiguous range of items

#### Scenario: Select all
- **WHEN** user presses Cmd+A
- **THEN** the system selects all items in the current directory

### Requirement: Batch download
The system SHALL allow downloading multiple selected files/directories simultaneously with aggregate progress.

#### Scenario: Download multiple files
- **WHEN** user selects multiple files and clicks download
- **THEN** the system queues all files for download and shows aggregate progress (current: X of Y files)

#### Scenario: Download folder
- **WHEN** user selects a folder and clicks download
- **THEN** the system recursively downloads the folder contents preserving directory structure

### Requirement: Batch delete
The system SHALL allow deleting multiple files with confirmation dialog.

#### Scenario: Delete multiple files
- **WHEN** user selects multiple files and presses Delete key
- **THEN** the system shows a confirmation dialog with count of items to delete

#### Scenario: Confirm deletion
- **WHEN** user confirms deletion
- **THEN** the system deletes all selected items and shows result summary

### Requirement: Folder sync
The system SHALL support one-way folder sync (Mac → Device) with smart comparison.

#### Scenario: Sync Mac folder to device
- **WHEN** user initiates folder sync
- **THEN** the system compares source and destination, transfers only new and modified files

#### Scenario: Sync progress
- **WHEN** syncing a folder
- **THEN** the system shows files scanned, files to transfer, current file progress, and overall progress
