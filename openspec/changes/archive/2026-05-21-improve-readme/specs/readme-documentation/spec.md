# Readme Documentation

## ADDED Requirements

### Requirement: README shall include project overview
The README SHALL include a project name, short description, and key technology badges at the top.

#### Scenario: User views README header
- **WHEN** a user opens README.md on GitHub
- **THEN** they SHALL see the project name "DFile", a one-sentence description, and technology badges

### Requirement: README shall be bilingual
The README SHALL present content in both English and Chinese (zh-CN). Each section SHALL have an English block followed by a Chinese block.

#### Scenario: Bilingual content
- **WHEN** a Chinese-speaking user reads the README
- **THEN** they SHALL find Chinese translations immediately following each English section

### Requirement: README shall list features
The README SHALL include a features section describing key capabilities: device connection, file browsing, file transfer (download/upload), and storage management.

#### Scenario: Features section
- **WHEN** a user reads the features section
- **THEN** they SHALL see a bullet list of DFile's capabilities aligned with the i18n translation glossary

### Requirement: README shall document build prerequisites
The README SHALL list required tools: Rust toolchain, Bun/Node.js, and Tauri system dependencies for each platform (macOS, Windows, Linux).

#### Scenario: Prerequisites check
- **WHEN** a developer reads the prerequisites section
- **THEN** they SHALL find the required Rust version, Bun/Node.js version, and platform-specific system dependencies

### Requirement: README shall provide build and run instructions
The README SHALL document how to clone, install dependencies, and run the app in development mode.

#### Scenario: Build from source
- **WHEN** a developer follows the build instructions
- **THEN** they SHALL be able to run `bun install`, then `bun run tauri dev` to start the application

### Requirement: README shall document i18n workflow
The README SHALL explain how translations are structured (YAML sources in `src/i18n/translations/`), how to add new translations, and how to rebuild locale JSON files.

#### Scenario: Translation contribution
- **WHEN** a contributor wants to add or modify translations
- **THEN** they SHALL find instructions about editing YAML files and running `bun run i18n:build`

### Requirement: README shall include a license section
The README SHALL reference the project's LICENSE file.

#### Scenario: License information
- **WHEN** a user scrolls to the bottom of the README
- **THEN** they SHALL see a license section pointing to the LICENSE file

### Requirement: README shall include contributing guidelines
The README SHALL include basic contributing guidelines or a link to CONTRIBUTING.md (if the file exists).

#### Scenario: Contribution guidance
- **WHEN** a potential contributor reads the README
- **THEN** they SHALL find guidance on how to report issues or submit changes
