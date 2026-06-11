# 当前任务

## 目标

- 修复桌面预览中带 `<base href>` 的 Markdown 内部锚点点击不跳转的问题。
- 覆盖用户提供的真实场景：`[需求概述](#需求概述)` 应跳到 `## 需求概述`。
- 发布 `1.1.16`，并确认 GitHub Release、macOS 签名公证、Sparkle appcast 更新链路正常。
- 为用户准备可肉眼验证的旧版更新流程，不覆盖用户当前 `/Applications` 中的最新版。

## 非目标

- 不改变相对图片、相对链接和本地资源解析方式。
- 不改变 GitHub Actions 产物格式和 Release asset 命名。
- 不减少 Apple notary、Gatekeeper 或 Sparkle appcast 验收步骤。

## 验收场景

- [x] 标题仍会生成稳定 id，中文标题 `## 需求概述` 生成可匹配的 `id="需求概述"`。
- [x] 在页面存在 `<base href="file://...">` 时，点击 `#%E9%9C%80...` 这类编码后的中文锚点不会跳成 file URL，而是在当前预览内滚动。
- [x] 点击锚点逻辑使用真实 preview 增强脚本验证，不只检查字符串。
- [x] 现有搜索、更新按钮、表格增强、数学公式和 Mermaid 增强入口不受影响。
- [x] `scripts/verify.sh` 全量通过。
- [ ] `v1.1.16` GitHub Release 完成，Release asset 包含 macOS DMG、Windows EXE、Linux tarball、`appcast.xml`。
- [ ] `scripts/release.sh v1.1.16` 完成，macOS DMG 和内层 app 已签名、公证、staple。
- [ ] 准备旧版 `1.1.15` 临时副本，用于肉眼点击更新到 `1.1.16`。

## 执行记录

- [x] 在 `assets/enhance/preview-enhance.js` 中拦截 `#preview a[href^="#"]` 点击，解码 fragment 后用 `document.getElementById()` 定位并 `scrollIntoView()`。
- [x] 保留 `<base href>`，避免破坏本地相对资源。
- [x] 新增 `scripts/verify-anchor-navigation.mjs`，用 Playwright 验证带 `file://` base URL 的中文锚点点击。
- [x] 将锚点点击验证接入 `scripts/verify.sh`。
- [x] 版本号更新到 `1.1.16` 并记录 changelog。

## 验证记录

```text
命令：cargo test generated_heading_ids -- --nocapture
结果：通过。2/2 tests passed。

命令：cargo test page_blocks_native_preview_reload_paths -- --nocapture
结果：通过。1/1 tests passed。

命令：NODE_PATH=... node scripts/verify-anchor-navigation.mjs
结果：通过。[anchor-verify] OK。

命令：cargo fmt --check
结果：通过。

命令：./scripts/verify.sh
结果：通过。guard、cargo test、anchor navigation、Sparkle update、Windows self-update、iOS build/parse、Android debug/release、mobile renderer/release readiness 均通过。
```

## 风险和假设

- 这次修复只拦截当前文档内部 `#fragment`，普通外部 URL 和相对资源继续按原逻辑处理。
- 肉眼更新测试会使用 `1.1.15` 的临时副本和 `MD_PREVIEW_ALLOW_NON_APPLICATIONS_UPDATER=1`，避免覆盖当前正式安装的最新版。
