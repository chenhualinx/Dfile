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
	@echo "构建:"
	@echo "  make build        - 构建 Universal Binary"
	@echo "  make build-debug  - 构建调试版本"
	@echo ""
	@echo "打包:"
	@echo "  make pkg          - 创建 PKG 安装包 (Mac App Store)"
	@echo "  make dmg          - 创建 DMG 安装包"
	@echo ""
	@echo "签名与公证:"
	@echo "  make universal    - 构建 + 签名 + 创建 PKG（完整流程）"
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

.PHONY: build-debug
build-debug:
	$(TAURI_CMD) build --target $(TARGET) --debug

.PHONY: pkg
pkg: build
	productbuild \
		--component $(MACOS_APP) \
		/Applications \
		--sign "3rd Party Mac Developer Installer: simin he (7LAVM7DP77)" \
		$(PKG_OUTPUT)
	@echo "PKG: $(PKG_OUTPUT)"

.PHONY: dmg
dmg: build
	$(TAURI_CMD) bundle --bundles dmg

.PHONY: universal
universal: build
	@if [ -f "src-tauri/embedded.provisionprofile" ]; then \
		cp src-tauri/embedded.provisionprofile "$(MACOS_APP)/Contents/embedded.provisionprofile"; \
		codesign --force --deep --entitlements src-tauri/entitlements.plist \
			--identifier "com.dfile.app" --options runtime \
			--sign "3rd Party Mac Developer Application: simin he (7LAVM7DP77)" \
			"$(MACOS_APP)"; \
		codesign --verify --deep --strict --verbose=2 "$(MACOS_APP)"; \
		productbuild --component "$(MACOS_APP)" /Applications \
			--identifier "com.dfile.app" --version "$(VERSION)" \
			--sign "3rd Party Mac Developer Installer: simin he (7LAVM7DP77)" \
			$(PKG_OUTPUT); \
		@echo "✅ PKG: $(PKG_OUTPUT)"; \
	else \
		@echo "⚠️  缺少 src-tauri/embedded.provisionprofile"; \
		@echo "请从 Apple Developer Portal 下载并放入 src-tauri/"; \
	fi

.PHONY: clean
clean:
	rm -rf dist
	rm -rf src-tauri/target

.PHONY: check
check:
	$(PKG_MANAGER) run tsc --noEmit
	cd src-tauri && cargo check
