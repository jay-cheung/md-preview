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
- [ ] `v1.1.14` GitHub Release 完成，Release asset 包含 macOS DMG、Windows EXE、Linux tarball、`appcast.xml`。
- [ ] `./release-sign.sh v1.1.14` 完成，macOS DMG 和内层 app 已签名、公证、staple。

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
```

## 风险和假设

- macOS 更新问题来自用户口述，暂无具体 Sparkle 错误弹窗或日志；本次按最常见的 DMG/非安装路径运行导致安装失败处理。
- 签名和 GitHub Release 结果将在 tag push 后由 release workflow 与 `release-sign.sh` 继续补充。
