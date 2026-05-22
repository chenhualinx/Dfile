<div align="center">

# DFile

**一款通过 MTP 协议在 Android 设备和电脑之间传输文件的跨平台桌面工具。**

![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=flat&logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

</div>

> **English version**: [README.md](README.md)

---

## 截图

<div align="center">

**文件浏览器 - 列表视图**

<img src="docs/images/截屏2026-05-21%2001.10.12.png" alt="文件浏览器列表视图" width="800"/>

**文件浏览器 - 网格视图**

<img src="docs/images/截屏2026-05-21%2001.10.20.png" alt="文件浏览器网格视图" width="800"/>

</div>

---

## 功能特性

- **设备连接** — 通过 MTP 协议连接 Android 设备
- **文件浏览** — 分页浏览设备存储，支持目录缓存
- **文件传输** — 从设备下载文件、上传文件到设备，支持批量下载
- **存储管理** — 查看存储用量、可用空间和存储分类
- **双语界面** — 内置中文和英文界面，支持运行时切换语言
- **跨平台** — 基于 Tauri 2 构建，支持 macOS、Windows 和 Linux

---

## 环境要求

构建 DFile 前，请确保已安装以下工具：

- **Rust 工具链**（1.75+）：[rustup.rs](https://rustup.rs)
- **Bun**（或 Node.js 18+）：[bun.sh](https://bun.sh)
- **Tauri 系统依赖**：请参考 [Tauri 环境配置指南](https://v2.tauri.app/start/prerequisites/) 了解各平台的要求

---

## 构建与运行

```bash
# 克隆仓库
git clone https://github.com/your-username/dfile.git
cd dfile

# 安装前端依赖
bun install

# 启动开发模式
bun run tauri dev

# 构建发布版本
bun run build
bun run tauri build
```

---

## 国际化（i18n）

DFile 支持中文（`zh-CN`）和英文（`en-US`），使用基于 YAML 的翻译系统。

翻译源文件位于 `src/i18n/translations/`：

| 文件 | 内容 |
|------|------|
| `common.yaml` | 通用界面标签（保存、取消、搜索等） |
| `device.yaml` | 设备和存储相关术语 |
| `transfer.yaml` | 传输队列、下载/上传状态 |
| `error.yaml` | 错误提示信息 |

添加或修改翻译：

1. 编辑 `src/i18n/translations/` 中对应的 YAML 文件
2. 运行构建脚本重新生成语言包 JSON 文件：

```bash
bun run i18n:build
```

该命令会生成 `src/i18n/locales/{lang}.json` 文件，供应用运行时使用。

---

## 使用说明

1. 通过 USB 将 Android 设备连接到电脑
2. 启动 DFile — 已连接的设备会显示在侧边栏中
3. 选择设备和存储分区以浏览文件
4. 使用文件浏览器导航目录
5. 将文件下载到电脑，或上传文件到设备
6. 在底部的传输队列面板中监控正在进行的传输任务

---

## 贡献指南

欢迎贡献代码！如有问题或建议，请提交 Issue 或 Pull Request。

---

## 许可证

本项目基于 [GNU General Public License v3.0](LICENSE) 许可协议发布。
