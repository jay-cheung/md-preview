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
- [x] 新版 `v1.1.19` GitHub Release 包含 macOS DMG、Windows EXE、Linux tarball、`appcast.xml`。
- [x] Homebrew Cask 使用新版 macOS DMG 的真实 sha256，并通过 `brew audit --cask`，PR 已提交到 Homebrew/homebrew-cask。

## 执行记录

- [x] 桌面 Markdown 解析启用 `Options::ENABLE_GFM`，使用 `pulldown-cmark` 原生 GitHub Alert 支持。
- [x] 桌面 Markdown event 层增加 `==highlight==` 到 `<mark class="mdp-mark">` 的转换。
- [x] 桌面和移动端补充 GitHub Alert / mark CSS。
- [x] Linux 启动阶段增加 NVIDIA/WebKitGTK DMABUF fallback。
- [x] 移动端共享增强脚本增加 GitHub Alert 和 mark DOM 增强。
- [x] 移动端 Playwright renderer fixture 覆盖 alert、mark、code literal。
- [x] 版本号更新到 `1.1.19`，CHANGELOG / README / README_zh 更新。
- [x] `v1.1.19` tag、GitHub Release、签名 DMG、Sparkle appcast 完成。
- [x] Homebrew Cask PR 创建：https://github.com/Homebrew/homebrew-cask/pull/269252

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

命令：scripts/release.sh v1.1.19
结果：GitHub Actions 三平台 release build 和 GitHub Release 创建通过；第一次远程签名阶段 Apple notary `NSURLErrorDomain Code=-1001` 超时。

命令：本地优先 remote-mac-sign 恢复签名并上传
结果：第一次本地 app.zip submission `94eb27f7-ac99-48fc-9c49-fc5ca17b04ec` 长时间停留 `In Progress`；清理临时挂载后第二次本地签名成功，inner app submission `391e4f1a-ae09-4484-90df-0b7b1a34882a` Accepted，DMG submission `7f990dd7-c963-402d-9b17-56ce7f42fd08` Accepted，DMG 和内层 app 均完成 staple。

命令：gh release view v1.1.19 -R vorojar/md-preview --json assets
结果：通过。Release asset 为 `appcast.xml`、`MD-Preview-linux-x64.tar.gz`、`MD-Preview-macOS-universal.dmg`、`MD-Preview-windows-x64.exe`。

命令：xcrun stapler validate target/MD-Preview-macOS-universal.dmg
结果：通过。The validate action worked。

命令：codesign --verify --deep --strict --verbose=2 target/MD\ Preview.app
结果：通过。app valid on disk，satisfies Designated Requirement。

命令：spctl -a -t open --context context:primary-signature target/MD-Preview-macOS-universal.dmg
结果：通过。

命令：curl -fsSL https://github.com/vorojar/md-preview/releases/download/v1.1.19/appcast.xml
结果：通过。appcast 指向 `v1.1.19/MD-Preview-macOS-universal.dmg`，并包含 `sparkle:edSignature`。

命令：brew audit --cask --new md-preview
结果：通过。

命令：brew style --cask md-preview
结果：通过。1 file inspected, no offenses detected。

命令：brew livecheck --cask md-preview --json
结果：通过。current/latest 均为 `1.1.19`。

命令：brew install --cask --appdir=$(mktemp -d) ./Casks/m/md-preview.rb && brew uninstall --cask md-preview
结果：通过。`MD Preview.app` 安装到临时 appdir，`/opt/homebrew/bin/md-preview` 正常 link/unlink。
```

## 风险和假设

- 本机不是 Linux/NVIDIA 环境，#3 的自动 fallback 通过确定性单元测试和文档验证；真实 GPU/WebKitGTK 渲染仍需用户环境回归。
- Homebrew Cask 已提交 PR，最终是否 merge 取决于 Homebrew 维护者审核。
- Apple notary 第一次远程提交和第一次本地 app.zip 等待都出现服务侧超时/长时间 In Progress；最终通过第二次本地提交完成签名、公证和 staple。
