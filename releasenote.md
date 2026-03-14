## 发布日志

### 在此版本中

#### 新功能

新增 `callSteam` 命令，并提供图形化参数编辑支持

`changeFigure` 和 `changeBg` 新增动画选择，并支持自动构建 animationTable

新增角色混合模式（blend mode）参数支持

文本编辑器支持保留行内注释

资源管理新增创建文件复制按钮，提升素材整理效率

#### 修复

修复 Windows 下路径与文件名校验逻辑，创建空文件更稳定

修复安全上下文下 UUID 生成问题

修复文本编辑器拖拽处理与文本更新逻辑，避免异常后缀与重复更新

修复文本编辑器快速建议缺失问题

修复 `changeFigure` 的 `setEffect` 与 spine 类型处理问题

修复发布脚本并更新打包图标

<!-- English Translation -->
## Release Notes

### In this version

#### New Features

Added the `callSteam` command with graphical argument editing support

Added animation selection to `changeFigure` and `changeBg`, with automatic animationTable generation

Added blend mode argument support for figures

Text editor now preserves inline comments

Added a file-copy button in assets management to speed up resource organization

#### Fixes

Fixed path and filename validation on Windows for more reliable empty-file creation

Fixed UUID generation issues in secure contexts

Fixed text editor drag/drop handling and text update logic to avoid suffix pollution and redundant updates

Fixed missing quick suggestions in the text editor

Fixed `setEffect` handling and spine type processing in `changeFigure`

Updated incremental copy naming to a 3-digit suffix format (for example `_001`)

Optimized animationTable auto-update triggers to reduce unnecessary refreshes

Fixed release scripts and updated packaging icon

<!-- Japanese Translation -->
## リリースノート

### このバージョンでは

#### 新機能

`callSteam` コマンドを追加し、引数のグラフィカル編集に対応しました

`changeFigure` と `changeBg` にアニメーション選択を追加し、animationTable の自動構築に対応しました

キャラクターのブレンドモード（blend mode）引数に対応しました

テキストエディターでインラインコメントを保持できるようにしました

アセット管理にファイル複製ボタンを追加し、素材整理の効率を向上しました

#### 修正

Windows 環境でのパス／ファイル名バリデーションを修正し、空ファイル作成の安定性を向上しました

セキュアコンテキストでの UUID 生成問題を修正しました

テキストエディターのドラッグ＆ドロップ処理とテキスト更新ロジックを修正し、不要な接尾辞や重複更新を防止しました

テキストエディターのクイックサジェストが表示されない問題を修正しました

`changeFigure` の `setEffect` と spine タイプ処理の問題を修正しました

ファイル複製時の連番ルールを 3 桁（例 `_001`）に統一しました

animationTable の自動更新トリガーを最適化し、不要なリフレッシュを削減しました

リリーススクリプトを修正し、パッケージアイコンを更新しました
