## ADDED Requirements

### Requirement: Directory navigation
The system SHALL allow users to navigate the Android device filesystem with a folder tree and breadcrumb navigation.

#### Scenario: Navigate into folder
- **WHEN** user double-clicks a folder entry
- **THEN** the system lists the contents of that folder with loading indicator

#### Scenario: Navigate back
- **WHEN** user clicks the back button or parent folder entry
- **THEN** the system navigates to the parent directory

#### Scenario: Breadcrumb navigation
- **WHEN** user clicks a breadcrumb segment
- **THEN** the system navigates directly to that directory level

### Requirement: File/folder listing
The system SHALL display directory contents with file name, size, type, modification date, and file icon.

#### Scenario: Display directory contents
- **WHEN** user opens a directory
- **THEN** the system shows files and subdirectories with name, size (human-readable), date, and Lucide file type icon

#### Scenario: Paginated loading
- **WHEN** a directory contains more than 200 objects
- **THEN** the system fetches objects in pages of 200 via MTP GetObjectHandles(offset, count) and shows a scroll-triggered loading indicator

#### Scenario: Virtual scrolling
- **WHEN** the file list is scrolled
- **THEN** only visible rows + 5 overscan rows are rendered in the DOM

#### Scenario: Icon mapped by MIME type
- **WHEN** rendering a file entry
- **THEN** the system maps MIME type to Lucide icon: `Folder` for directories, `FileImage` for images, `FileVideo` for video, `FileAudio` for audio, `FileArchive` for zip/tar, `FileText` for documents, `File` as fallback

#### Scenario: Directories first
- **WHEN** listing directory contents
- **THEN** directories appear before files, sorted alphabetically within each group

### Requirement: File search
The system SHALL support searching for files by name within the current directory and its subdirectories.

#### Scenario: Search by filename
- **WHEN** user types in the search field
- **THEN** the system filters visible files matching the search term after 300ms debounce

### Requirement: Thumbnail preview
The system SHALL fetch and display thumbnails for image files (JPEG, PNG, GIF, WebP) when supported by the device.

#### Scenario: Thumbnail for image files
- **WHEN** user browses a directory containing image files
- **THEN** the system displays thumbnail previews for image file entries

#### Scenario: Thumbnail unavailable
- **WHEN** the device does not support thumbnail generation
- **THEN** the system shows a generic file type icon instead
