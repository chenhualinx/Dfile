## Why

DFile 即将提交到 Mac App Store。当前项目的 entitlements、权限配置和运行时权限处理尚未经过 App Store 合规性审查，存在被拒风险（如使用 `disable-library-validation` entitlement、开启 `macOSPrivateApi`、缺少必要的隐私权限声明等）。需要系统性地审查和修复所有权限相关配置，确保顺利通过 App Store 审核。

## What Changes

- 审查并修复 `entitlements.plist`，移除 App Store 不允许的 entitlement（`com.apple.security.cs.disable-library-validation`）
- 评估 `tauri.conf.json` 中的 `macOSPrivateApi` 选项，确定是否需要移除或替代
- 审查并补充 Tauri capability 权限声明（`capabilities/default.json`）
- 添加运行时权限提示 UI（USB 访问权限、文件访问权限、网络权限）
- 添加 Privacy Manifest（`PrivacyInfo.xcprivacy`）声明所需权限及用途
- 审查 Rust 侧代码中与系统权限交互的部分，确保符合 App Store 要求
- 确认 App Sandbox 相关 entitlement 完整且正确
- 添加权限被拒绝时的用户引导流程

## Capabilities

### New Capabilities

- `permissions-audit`: 审计所有现有权限配置，识别不合规项并修复
- `permissions-runtime`: 运行时权限申请和用户引导 UI

### Modified Capabilities

- `app-store-packaging`: 补充权限相关的打包配置（entitlements、privacy manifest），更新现有需求以符合最新的 App Store 审核要求

## Impact

- `src-tauri/entitlements.plist` — 修改 entitlement 配置
- `src-tauri/tauri.conf.json` — 可能移除 `macOSPrivateApi`
- `src-tauri/capabilities/default.json` — 补充需要的权限声明
- `src-tauri/` — 新增 `PrivacyInfo.xcprivacy` 文件
- `src/` — 新增权限提示和引导 UI 组件
- `src-tauri/src/` — 可能修改 Rust 侧权限处理逻辑
