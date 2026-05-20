## ADDED Requirements

### Requirement: Storage overview
The system SHALL display storage usage breakdown for each device storage partition (internal, SD card).

#### Scenario: View storage usage
- **WHEN** user selects a device
- **THEN** the system shows a storage overview with used, free, and total space for each storage partition

#### Scenario: Visual storage bar
- **WHEN** viewing storage info
- **THEN** the system shows a visual progress bar indicating used vs available space

### Requirement: Storage categorization
The system SHALL categorize storage usage by file type (documents, images, video, audio, other).

#### Scenario: Usage by category
- **WHEN** user views storage analysis
- **THEN** the system shows storage consumed by each file type category with percentages

### Requirement: SD card management
The system SHALL detect and display SD card storage separately from internal storage.

#### Scenario: SD card detected
- **WHEN** the device has an SD card inserted
- **THEN** the system shows SD card as a separate storage entry with its own capacity

### Requirement: Free up space suggestions
The system SHALL identify large files and suggest candidates for cleanup.

#### Scenario: Large file scan
- **WHEN** user clicks "Free Up Space"
- **THEN** the system lists files larger than 100MB sorted by size descending

#### Scenario: Select files to remove
- **WHEN** viewing large files
- **THEN** user can select files for deletion and see total reclaimable space
