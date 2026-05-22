APP_NAME := DFile
PKG_MANAGER := bun
TAURI_CMD := $(PKG_MANAGER) tauri
TARGET := universal-apple-darwin
BUILD_MODE := release
VERSION := $(shell cat package.json | grep '"version"' | head -1 | awk -F: '{ print $$2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

ifeq ($(BUILD_MODE),release)
    BUNDLE_DIR := src-tauri/target/$(TARGET)/release/bundle
else
    BUNDLE_DIR := src-tauri/target/$(TARGET)/debug/bundle
endif

MACOS_APP := $(BUNDLE_DIR)/macos/$(APP_NAME).app
PKG_OUTPUT := $(APP_NAME)-$(VERSION).pkg

.PHONY: default
default: help

.PHONY: help
help:
	@echo "DFile 构建命令"
	@echo ""
	@echo "开发:"
	@echo "  make dev          - 启动开发服务器"
	@echo ""
	@echo "构建 (本地测试):"
	@echo "  make build        - 构建 Universal Binary (ad-hoc 签名)"
	@echo "  make build-debug  - 构建调试版本"
	@echo "  make dmg          - 创建 DMG 安装包"
	@echo ""
	@echo "打包 (App Store):"
	@echo "  make appstore     - 构建 App Store 版本 PKG"
	@echo "  make pkg          - 创建 PKG (需要 embedded.provisionprofile)"
	@echo ""
	@echo "完整流程:"
	@echo "  make universal    - 构建 + DMG + PKG (如可能)"
	@echo ""
	@echo "清理:"
	@echo "  make clean        - 清理构建产物"
	@echo "  make check        - 运行代码检查"

.PHONY: dev
dev:
	$(TAURI_CMD) dev

.PHONY: build
build:
	$(TAURI_CMD) build --target $(TARGET)
	codesign --force --deep --sign "-" "$(MACOS_APP)"
	@echo "✅ 已使用 ad-hoc 签名: $(MACOS_APP)"

.PHONY: build-debug
build-debug:
	$(TAURI_CMD) build --target $(TARGET) --debug

.PHONY: pkg
pkg: build
	@if [ -f "src-tauri/embedded.provisionprofile" ]; then \
		cp src-tauri/embedded.provisionprofile "$(MACOS_APP)/Contents/embedded.provisionprofile"; \
		codesign --force --deep --entitlements src-tauri/entitlements.plist \
			--identifier "com.texto.dfile" --options runtime \
			--sign "3rd Party Mac Developer Application: simin he (7LAVM7DP77)" \
			"$(MACOS_APP)"; \
		productbuild --component "$(MACOS_APP)" /Applications \
			--identifier "com.texto.dfile" --version "$(VERSION)" \
			--sign "3rd Party Mac Developer Installer: simin he (7LAVM7DP77)" \
			$(PKG_OUTPUT); \
		echo "✅ PKG: $(PKG_OUTPUT)"; \
	else \
		echo "❌ 错误: 缺少 src-tauri/embedded.provisionprofile"; \
		echo "   请从 Apple Developer Portal 下载 Mac App Store 的 Provisioning Profile"; \
		exit 1; \
	fi

.PHONY: appstore
appstore:
	@echo "检查 App Store 构建环境..."
	@if ! security find-identity -v -p codesigning | grep -q "Apple Distribution"; then \
		echo "❌ 错误: 没有找到 Apple Distribution 证书"; \
		echo "   请在 Apple Developer Portal 创建并下载 Apple Distribution 证书"; \
		exit 1; \
	fi
	@if [ ! -f "src-tauri/embedded.provisionprofile" ]; then \
		echo "❌ 错误: 缺少 src-tauri/embedded.provisionprofile"; \
		echo "   请在 Apple Developer Portal 创建 Mac App Store Provisioning Profile"; \
		exit 1; \
	fi
	@echo "✅ 环境检查通过，开始构建..."
	$(TAURI_CMD) build --target $(TARGET)
	cp src-tauri/embedded.provisionprofile "$(MACOS_APP)/Contents/embedded.provisionprofile"
	codesign --force --deep --entitlements src-tauri/entitlements.plist \
		--identifier "com.texto.dfile" --options runtime \
		--sign "Apple Distribution" \
		"$(MACOS_APP)"
	codesign --verify --deep --strict --verbose=2 "$(MACOS_APP)"
	productbuild --component "$(MACOS_APP)" /Applications \
		--identifier "com.texto.dfile" --version "$(VERSION)" \
		--sign "Apple Distribution" \
		$(PKG_OUTPUT)
	@echo "✅ App Store PKG: $(PKG_OUTPUT)"

.PHONY: dmg
dmg:
	$(TAURI_CMD) build --target $(TARGET)
	codesign --force --deep --sign "-" "$(MACOS_APP)"
	$(TAURI_CMD) bundle --bundles dmg
	@echo "✅ DMG: $(BUNDLE_DIR)/dmg/$(APP_NAME)_$(VERSION)_universal.dmg"

.PHONY: universal
universal:
	$(TAURI_CMD) build --target $(TARGET)
	codesign --force --deep --sign "-" "$(MACOS_APP)"
	$(TAURI_CMD) bundle --bundles dmg
	@echo "✅ 构建完成:"
	@echo "   应用: $(MACOS_APP)"
	@echo "   DMG:  $(BUNDLE_DIR)/dmg/$(APP_NAME)_$(VERSION)_universal.dmg"
	@if [ -f "src-tauri/embedded.provisionprofile" ]; then \
		cp src-tauri/embedded.provisionprofile "$(MACOS_APP)/Contents/embedded.provisionprofile"; \
		codesign --force --deep --entitlements src-tauri/entitlements.plist \
			--identifier "com.texto.dfile" --options runtime \
			--sign "3rd Party Mac Developer Application: simin he (7LAVM7DP77)" \
			"$(MACOS_APP)"; \
		codesign --verify --deep --strict --verbose=2 "$(MACOS_APP)"; \
		productbuild --component "$(MACOS_APP)" /Applications \
			--identifier "com.texto.dfile" --version "$(VERSION)" \
			--sign "3rd Party Mac Developer Installer: simin he (7LAVM7DP77)" \
			$(PKG_OUTPUT); \
		echo "✅ PKG (App Store): $(PKG_OUTPUT)"; \
	else \
		echo "⚠️  跳过 PKG 打包 (缺少 embedded.provisionprofile)"; \
	fi

.PHONY: clean
clean:
	rm -rf dist
	rm -rf src-tauri/target

.PHONY: check
check:
	$(PKG_MANAGER) run tsc --noEmit
	cd src-tauri && cargo check
