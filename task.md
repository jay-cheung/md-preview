# 当前任务

## 目标

- 优化桌面发版流程，减少 `push tag -> GitHub Actions -> macOS 签名公证 -> appcast -> 验收` 之间的人工等待和状态猜测。
- 修复 Markdown 目录/锚点链接无法跳转的问题，例如 `[需求概述](#需求概述)` 应跳到 `## 需求概述`。
- 发布 `1.1.15`，并确认 GitHub Release、macOS 签名公证、Sparkle appcast 更新链路正常。
- 保留现有签名、公证、staple、Sparkle appcast 和 Release asset 验收强度。

## 非目标

- 不改变 GitHub Actions 产物格式和 Release asset 命名。
- 不减少 Apple notary 或 Gatekeeper 验收步骤。
- 不自动修改版本号、changelog 或生成 release note；这些仍由发版前提交负责。

## 验收场景

- [x] 正式发版可用 `scripts/release.sh vX.Y.Z` 前台串起验证、push、Actions watch、签名和最终验收。
- [x] 正式脚本推 tag 时不会触发 pre-push 后台签名，避免同一 tag 双跑。
- [x] pre-push hook 仍保留为手动推 tag 的兜底，但使用 tag 专属日志，避免历史日志混杂。
- [x] `release-sign.sh` 失败通知和临时目录清理不再互相覆盖。
- [x] 没有显式 `{#id}` 的 Markdown 标题会自动生成可跳转 id。
- [x] 中文标题锚点可用，`[需求概述](#需求概述)` 能匹配 `id="需求概述"`。
- [x] 重复标题自动生成唯一 id，显式 `{#id}` 仍优先。
- [x] 脚本语法校验通过。
- [x] release 脚本 help dry-run 通过。
- [x] 锚点相关单测通过。
- [x] `v1.1.15` GitHub Release 完成，Release asset 包含 macOS DMG、Windows EXE、Linux tarball、`appcast.xml`。
- [x] `scripts/release.sh v1.1.15` 完成，macOS DMG 和内层 app 已签名、公证、staple。

## 执行记录

- [x] 新增 `scripts/release.sh`：检查版本/tag、要求 tracked tree 干净、可选运行 `./scripts/verify.sh`、推送 master/tag、等待 Release workflow、前台运行签名脚本并执行最终验收。
- [x] 更新 `hooks/pre-push`：支持 `MD_PREVIEW_RELEASE_FOREGROUND=1` 跳过后台签名；后台兜底日志改为 `target/release-sign-<tag>.log`。
- [x] 修复 `release-sign.sh` 的 EXIT trap 覆盖问题，确保失败通知和 `WORK` 临时目录清理都执行。
- [x] README / README_zh 补充维护者发版命令。
- [x] 在 Markdown 事件流中为 heading 自动补 id，slug 保留 Unicode 字母数字、空白转 `-`，并处理重复 id。
- [x] 新增中文锚点、重复标题和显式 id 的单元测试。
- [x] 已将版本号更新为 `1.1.15` 并记录 changelog。

## 验证记录

```text
命令：bash -n scripts/release.sh release-sign.sh hooks/pre-push scripts/generate-appcast.sh
结果：通过。

命令：scripts/release.sh --help
结果：通过，正确输出 usage，不触发真实发布。

命令：cargo test generated_heading_ids -- --nocapture
结果：通过。2/2 tests passed。

命令：cargo test
结果：通过。14/14 tests passed。

命令：./scripts/verify.sh
结果：通过。guard、cargo test、macOS Sparkle 验证、Windows self-update 验证、iOS build/parse、Android debug/release、mobile renderer/release readiness 均通过。

命令：scripts/release.sh v1.1.15
结果：通过。脚本完成版本验证、tag 创建、master/tag 推送、GitHub Release workflow 等待、macOS 签名公证、DMG staple、GitHub Release asset 覆盖上传、appcast 上传和最终验收。

命令：gh release view v1.1.15 -R vorojar/md-preview --json url,assets
结果：通过。Release asset 包含 appcast.xml、MD-Preview-linux-x64.tar.gz、MD-Preview-macOS-universal.dmg、MD-Preview-windows-x64.exe。

命令：xcrun stapler validate target/MD-Preview-macOS-universal.dmg；codesign --verify --deep --strict --verbose=2 target/MD\ Preview.app；spctl -a -t open --context context:primary-signature target/MD-Preview-macOS-universal.dmg
结果：通过。DMG staple 验证成功，内层 app codesign 验证成功，Gatekeeper primary-signature 验收通过。

命令：curl -fsSL https://github.com/vorojar/md-preview/releases/download/v1.1.15/appcast.xml
结果：通过。线上 appcast 指向 MD Preview 1.1.15、v1.1.15 macOS DMG，并包含 sparkle:edSignature。
```

## 风险和假设

- 这次已经用 `v1.1.15` 完成真实发版演练；GitHub Actions、签名、公证、staple、appcast 上传和最终资产验收均通过。
- 预计后续节省主要来自去掉后台 hook 状态确认和人工切换，约 1-2 分钟；Apple notary 本身仍是主要不可控耗时。
- GitHub Actions 当前有 Node.js 20 deprecation annotation，不影响本次 release，但需要在 2026-09-16 前升级相关 action。
