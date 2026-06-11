# 当前任务

## 目标

- 发布 `1.1.14`：修复中文 IME 搜索失焦，并降低 macOS 从 DMG/非 Applications 路径触发 Sparkle 更新时报错的概率。
- 完成验证、commit、tag、GitHub Release、macOS DMG 签名/公证/staple，并更新 Sparkle `appcast.xml`。

## 非目标

- 不改 Markdown 渲染、移动端功能或 Windows/Linux 更新模型。
- 不发布未签名、未公证、未 staple 的 macOS DMG。
- 不处理用户未提供具体日志的其他 Sparkle 失败类型。

## 验收场景

- [x] 中文输入法组词期间，搜索框不会因首字母触发 `window.find` 而失焦。
- [x] 组词结束后自动执行一次搜索，Enter/Escape 在组合态期间不打断输入法。
- [x] macOS 只有 app 位于 `/Applications` 或 `~/Applications` 且 Sparkle framework 存在时才启用内置更新。
- [x] 从 DMG、Downloads 或其他非安装路径运行时，更新按钮回退到 GitHub Release 下载页。
- [x] `cargo test` 通过。
- [x] `./scripts/verify.sh` 通过。
- [x] `v1.1.14` GitHub Release 完成，Release asset 包含 macOS DMG、Windows EXE、Linux tarball、`appcast.xml`。
- [x] `./release-sign.sh v1.1.14` 完成，macOS DMG 和内层 app 已签名、公证、staple。

## 执行记录

- [x] 已增加搜索框 `compositionstart` / `compositionend` / `e.isComposing` 保护，并在 native find 后恢复输入焦点。
- [x] 已增加 macOS Sparkle 安装位置判断，只允许 `/Applications` 和 `~/Applications` 走内置更新。
- [x] 已将版本号更新为 `1.1.14` 并记录 changelog。

## 验证记录

```text
命令：cargo fmt --check
结果：通过。

命令：cargo test
结果：通过。12/12 tests passed。

命令：./scripts/verify.sh
结果：通过。guard、cargo test、macOS Sparkle 验证、Windows self-update 验证、iOS build/parse、Android debug/release、mobile renderer/release readiness 均通过。

命令：GitHub Actions / Release v1.1.14
结果：通过。Release workflow success；Release assets 包含 `MD-Preview-macOS-universal.dmg`、`MD-Preview-windows-x64.exe`、`MD-Preview-linux-x64.tar.gz`。

命令：./release-sign.sh v1.1.14
结果：通过。macOS DMG 和内层 app 已签名、公证、staple；签名后的 DMG 已上传覆盖 Release asset；`appcast.xml` 已生成并上传；本地 `target/MD Preview.app` 和 `/Applications/MD Preview.app` 已替换。

命令：xcrun stapler validate target/MD-Preview-macOS-universal.dmg；codesign --verify --deep --strict --verbose=2 'target/MD Preview.app'；spctl -a -t open --context context:primary-signature target/MD-Preview-macOS-universal.dmg
结果：通过。DMG staple 有效，app 签名有效，Gatekeeper primary-signature 评估通过。

命令：curl https://github.com/vorojar/md-preview/releases/latest/download/appcast.xml
结果：通过。Sparkle appcast 指向 `MD Preview 1.1.14` 和 `v1.1.14/MD-Preview-macOS-universal.dmg`。
```

## 风险和假设

- macOS 更新问题来自用户口述，暂无具体 Sparkle 错误弹窗或日志；本次按最常见的 DMG/非安装路径运行导致安装失败处理。
- GitHub Actions 当前有 Node.js 20 deprecation annotation，未影响本次发布；后续需要在 2026-09-16 前处理 action runtime 升级。
