<div align="center">

# DFile

**A cross-platform desktop tool for transferring files between Android devices and computers via MTP.**

![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=flat&logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

</div>

> **中文版本**：[README.zh-CN.md](README.zh-CN.md)

---

## Screenshots

<div align="center">

**File Browser - List View**

<img src="docs/images/截屏2026-05-21%2001.10.12.png" alt="File Browser List View" width="800"/>

**File Browser - Grid View**

<img src="docs/images/截屏2026-05-21%2001.10.20.png" alt="File Browser Grid View" width="800"/>

</div>

---

## Features

- **Device Connection** — Connect to Android devices via MTP protocol
- **File Browsing** — Navigate device storage with paginated file listing and directory caching
- **File Transfer** — Download files from device to computer, upload files from computer to device, batch download support
- **Storage Management** — View storage usage, available space, and storage categories
- **Bilingual UI** — Built-in Chinese and English interface with runtime language switching
- **Cross-Platform** — Built with Tauri 2, runs on macOS, Windows, and Linux

---

## Prerequisites

Before building DFile, ensure you have the following installed:

- **Rust toolchain** (1.75+): [rustup.rs](https://rustup.rs)
- **Bun** (or Node.js 18+): [bun.sh](https://bun.sh)
- **Tauri system dependencies**: See the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/) for your platform

---

## Build & Run

```bash
# Clone the repository
git clone https://github.com/your-username/dfile.git
cd dfile

# Install frontend dependencies
bun install

# Run in development mode
bun run tauri dev

# Build for production
bun run build
bun run tauri build
```

---

## Internationalization (i18n)

DFile supports Chinese (`zh-CN`) and English (`en-US`) with a YAML-based translation system.

Translation source files are located at `src/i18n/translations/`:

| File | Contents |
|------|----------|
| `common.yaml` | Shared UI labels (Save, Cancel, Search, etc.) |
| `device.yaml` | Device and storage related terms |
| `transfer.yaml` | Transfer queue, download/upload status |
| `error.yaml` | Error messages |

To add or modify translations:

1. Edit the corresponding YAML file in `src/i18n/translations/`
2. Run the build script to regenerate locale JSON files:

```bash
bun run i18n:build
```

This produces `src/i18n/locales/{lang}.json` files used by the app at runtime.

---

## Usage

1. Connect your Android device to your computer via USB
2. Launch DFile — connected devices appear in the sidebar
3. Select a device and storage to browse files
4. Use the file browser to navigate directories
5. Download files to your computer or upload files to the device
6. Monitor active transfers in the transfer queue panel at the bottom

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
