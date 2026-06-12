# 当前任务

## 目标

- 解决 GitHub issues #3、#20、#23，并完成 #19 的 Homebrew Cask 发布路径。
- 发布新的桌面版本 `v1.1.19`，推送到 GitHub，并验证 Release assets。
- 在验证通过后同步 issue 状态，避免已完成事项继续悬挂。

## 非目标

- 不重做 Markdown 引擎，不引入新的大型渲染依赖。
- 不调整主题选择器、CLI `--edit` / `--print` 等其他 open issues。
- 不改变移动端 App Store / Google Play 分发策略。

## 验收场景

- [x] `> [!IMPORTANT]` 渲染为 `markdown-alert-important`，并且 `[!IMPORTANT]` 标记本身不显示在正文里。
- [x] `==高亮 & tag==` 渲染为 `<mark class="mdp-mark">`，内部文本仍然安全转义。
- [x] inline code / fenced code 中的 `==literal==` 不会被误转成高亮。
- [x] Linux + NVIDIA 且用户没有手动设置 WebKit workaround 时，启动前自动设置 `WEBKIT_DISABLE_DMABUF_RENDERER=1`。
- [x] 用户已显式设置 `WEBKIT_DISABLE_DMABUF_RENDERER` 或 `WEBKIT_DISABLE_COMPOSITING_MODE` 时，程序不覆盖用户选择。
- [x] 移动端共享预览层同样支持 GitHub Alerts 和 `==highlight==`。
- [x] README / README_zh 记录新 Markdown 支持和 Linux NVIDIA 空白窗口 workaround。
- [ ] 新版 `v1.1.19` GitHub Release 包含 macOS DMG、Windows EXE、Linux tarball、`appcast.xml`。
- [ ] Homebrew Cask 使用新版 macOS DMG 的真实 sha256，并通过 `brew audit --cask` 或记录明确 blocker。

## 执行记录

- [x] 桌面 Markdown 解析启用 `Options::ENABLE_GFM`，使用 `pulldown-cmark` 原生 GitHub Alert 支持。
- [x] 桌面 Markdown event 层增加 `==highlight==` 到 `<mark class="mdp-mark">` 的转换。
- [x] 桌面和移动端补充 GitHub Alert / mark CSS。
- [x] Linux 启动阶段增加 NVIDIA/WebKitGTK DMABUF fallback。
- [x] 移动端共享增强脚本增加 GitHub Alert 和 mark DOM 增强。
- [x] 移动端 Playwright renderer fixture 覆盖 alert、mark、code literal。
- [x] 版本号更新到 `1.1.19`，CHANGELOG / README / README_zh 更新。

## 验证记录

```text
命令：cargo test -- --nocapture
结果：通过。17 个 Rust 单测全部通过，覆盖 GitHub Alerts、mark 渲染、code 不误伤、Linux NVIDIA fallback、既有锚点/搜索/更新逻辑。

命令：NODE_PATH=/Users/longjiewu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules /Users/longjiewu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node mobile/scripts/verify-mobile-renderer.mjs
结果：通过。移动端 fixture 渲染 KaTeX、Mermaid、GitHub Alert、mark、搜索、打印样式和 javascript: 链接拦截。

命令：./scripts/verify.sh
结果：通过。guard、cargo test、anchor navigation、Sparkle update、Windows self-update、iOS xcodegen/build/parse、Android debug/release、mobile renderer、release readiness 全部通过。

命令：cargo build --release
结果：通过。确认非 Linux release build 不再出现 `linux_webkit_compat_env` dead_code warning。
```

## 风险和假设

- 本机不是 Linux/NVIDIA 环境，#3 的自动 fallback 通过确定性单元测试和文档验证；真实 GPU/WebKitGTK 渲染仍需用户环境回归。
- Homebrew/homebrew-cask PR 需要新 release asset 的最终 sha256，因此必须在 `v1.1.19` 发布完成后处理。
