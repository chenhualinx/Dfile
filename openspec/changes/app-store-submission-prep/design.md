## Context

DFile 是一个基于 Tauri 2 的跨平台桌面应用，通过 MTP 协议在 Android 设备和电脑之间传输文件。当前项目已包含部分 Mac App Store 配置（sandbox entitlements、代码签名、notarization），但存在以下问题：

- `entitlements.plist` 中包含 `com.apple.security.cs.disable-library-validation`，该 entitlement **不允许**用于 Mac App Store 分发
- `tauri.conf.json` 中启用了 `macOSPrivateApi: true`，App Store 不允许使用私有 API
- 缺少 `PrivacyInfo.xcprivacy` 隐私清单文件（iOS/macOS 14+ 要求）
- 缺少运行时权限提示 UI，用户不清楚为何需要 USB/文件访问权限
- 部分 Tauri capability 权限声明可能不足或过多
- 现有 `app-store-packaging` spec 已覆盖基本打包需求，但未深入处理权限细节

## Goals / Non-Goals

**Goals:**

- 修复所有 App Store 不合规的 entitlement 配置
- 移除或替代私有 API 使用
- 添加 PrivacyInfo.xcprivacy 隐私清单
- 添加运行时权限申请和用户引导 UI
- 审查 Rust/Tauri 侧权限相关代码
- 确保 sandbox 环境下的文件读写、USB 访问、网络请求正常工作

**Non-Goals:**

- App Store 元数据（描述、截图、关键词等）— 属于运营范畴
- 代码签名和 notarization CI 配置 — 已有独立 spec 覆盖
- Universal binary 构建配置 — 已有独立 spec 覆盖
- Auto-update 机制 — 已有独立 spec 覆盖

## Decisions

### Decision 1: 移除 `macOSPrivateApi` 并替换为原生替代方案

- **选项 A**：保留 `macOSPrivateApi: true` 并尝试向 Apple 说明理由 → 风险高，App Store 明确禁止私有 API
- **选项 B**：移除 `macOSPrivateApi`，不使用替代方案 → 可能丢失窗口行为细节
- **选项 C（选择）**：移除 `macOSPrivateApi`，通过 Tauri 原生窗口配置实现相同效果（`titleBarStyle`, `hiddenTitle`, `decorations` 等已正确配置）

**理由**：`macOSPrivateApi` 启用 `NSApplicationSupportsMultipleWindows` 等私有 API。在 Tauri 2 中，可以通过公开 API 实现类似效果。移除是 App Store 上架的必要条件。

### Decision 2: 移除 `disable-library-validation` entitlement

- **选项 A**：保留并申请 Apple 例外 → 几乎不可能获批
- **选项 B（选择）**：移除该 entitlement，确保所有库已正确签名

**理由**：Mac App Store 要求所有加载的库必须经过签名。`disable-library-validation` 仅用于开发/调试场景，生产构建不应需要。

### Decision 3: 权限提示 UI 策略

- **选项 A**：使用 macOS 系统原生权限提示对话框 → 对 USB 权限支持有限
- **选项 B（选择）**：应用启动时检测权限状态，缺少权限时显示引导 UI，引导用户前往 System Settings 手动授权

**理由**：macOS 的 USB 权限需要用户手动在 System Settings 中授权，应用无法通过对话框自动申请。最好的做法是检测权限状态 + 引导用户操作。

## Risks / Trade-offs

- [移除 `macOSPrivateApi`] → 移除后某些窗口行为可能变化，需在开发环境中充分测试确认无功能退化
- [USB 权限需用户手动开启] → 用户体验不如自动弹窗流畅，需设计清晰的引导流程和错误提示
- [Sandbox 环境下文件访问受限] → 必须通过 `NSOpenPanel`/`NSSavePanel` 访问用户选择的文件，需确保所有文件读写路径符合要求
- [Tauri 插件权限冲突] → `dialog` 和 `opener` 插件在 sandbox 下可能有额外限制，需逐一验证
