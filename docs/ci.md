# PR 与 CI 合并规则

本仓库默认主分支为 `main`。日常开发从最新主分支创建功能分支，将功能分支推送到组织仓库，再通过 PR 合并。

```sh
git fetch origin
git switch -c feature/your-change origin/main
git push -u origin feature/your-change
```

主分支由仓库规则集保护：必须通过 PR，必须通过 `CI` 检查，合并前必须同步最新主分支，禁止强制推送和删除。规则没有管理员绕过名单；目前不额外要求他人批准，PR 上的审查讨论必须解决。

`CI` 是固定名称的汇总检查。它在所有 PR 上运行，任一必需任务失败、取消或意外跳过都会失败，避免工作流名称或矩阵版本变化导致保护规则失效。检查来源限定为 GitHub Actions。

## 自动检查范围

每个 PR 执行 Go vet、race 测试、后端编译、React 生产构建，并用真实后端和新建 SQLite 数据库完成界面初始化、重载与持久化 E2E。测试不调用外部模型或发布内容。

工作流也支持主分支 push 和手动运行。手动运行使用 Actions 页面的 Run workflow，选择待检查的分支；功能分支首次引入新工作流时，先创建 PR 触发检查。

每次 v* 版本标签先通过同一提交的源码 CI，再在 Windows amd64、macOS arm64 和 macOS amd64 原生 Runner 上构建对应的后端和安装包，执行实际打包的 Electron 应用，验证初始化与数据库持久化；macOS 同时验证 DMG。Tag 必须与应用版本一致，三个原生平台全部通过 Release CI 后才由唯一发布 job 上传同一批候选安装包。任一失败、取消或跳过均阻止发布，避免部分平台先产生公开发行。手动 release 工作流只验收和保存 Actions 制品，不创建公开发行。没有定时任务。

打包器固定为 electron-builder 26.0.12，使用上游统一的 hdiutil 有限重试处理 macOS 磁盘镜像卸载时的短暂占用。原来的 23.6.0 在 Intel Runner 上重复遇到 resource busy；升级同时作用于本地与 CI 打包命令，仍要求实际 DMG 生成、校验和应用运行通过。

CI 失败会阻止合并。修复失败后在同一个功能分支继续提交，重新运行检查；不要通过删除必需检查或设置管理员绕过来把失败当作通过。
