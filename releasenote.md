## 发布日志

### 在此版本中

#### 新功能

自动注入构建信息，方便快速定位版本。

字体系统升级：当选择非默认字号时，条件性地添加 fontSize 参数，并新增字体优化选项。

编辑器改进：在浏览器重新获得焦点时自动重新加载场景文件（图形编辑器与文本编辑器）。

场景管理：新增 fetchScene 方法，支持按需拉取场景数据。

滚轮交互优化：仅当编辑器聚焦时才响应滚轮缩放，并采用 activeElement 提升焦点检测性能。

Say 组件支持在 IME 组合输入期间实时提交文本变化。

图像处理：新增调整滤镜（Adjustment Filter）功能。

体验改进：新增默认语言选择和窗口关闭事件支持。

性能优化：将自定义防抖实现替换为 lodash，提高编辑流畅度。

#### 修复

修复游戏创建过程中名称未更新、目录异常等问题。

修复在发送同步消息前未正确检查 WebSocket 连接的问题。

修复 issue #388 相关的异常。

修复 macOS 下因系统完整性保护（SIP）导致的编译问题。

修复 EffectEditor 布局与输入分组异常。

修复 release 脚本中多余权限指令导致的构建失败。

<!-- English Translation -->
## Release Notes

### In this version

#### New Features

Auto-inject build information to quickly identify versions.

Font system enhancements: conditionally add the `fontSize` parameter when a non‑default size is chosen and introduce font optimization options.

Editors now automatically reload the scene file when the browser regains focus (Graphical Editor & Text Editor).

Scene management: added `fetchScene` to retrieve scene data on demand.

Wheel interaction improvements: zoom/scroll only when the editor is focused, with more accurate focus detection via `activeElement`.

The Say component now supports real‑time text change submission during IME composition.

Image processing: added an Adjustment Filter feature.

UX improvements: added default language selection and a close‑event hook.

Performance optimization: replaced the custom debounce with a lodash implementation for smoother editing.

#### Fixes

Fixed game‑creation issues where the name wasn’t updated and directories were mishandled.

Fixed missing WebSocket connection check before sending sync messages.

Fixed the exception described in issue #388.

Fixed macOS build failures caused by SIP restrictions.

Fixed layout and input‑grouping issues in EffectEditor.

Fixed build failures caused by redundant permission commands in the release script.

<!-- Japanese Translation -->
## リリースノート

### このバージョンでは

#### 新機能

ビルド情報を自動挿入し、バージョンの特定を容易にしました。

フォントシステムを強化：既定外のフォントサイズが選択された場合に `fontSize` パラメータを条件付きで追加し、フォント最適化オプションを提供します。

ブラウザがフォーカスを取り戻した際、エディターがシーンファイルを自動的に再読込するようになりました（グラフィカルエディターとテキストエディター）。

シーン管理：オンデマンドでシーンを取得できる `fetchScene` 関数を追加しました。

ホイール操作の改良：エディターがフォーカスされている場合のみズーム／スクロールを行い、`activeElement` を利用して焦点検出を最適化しました。

Say コンポーネントで IME 変換中でもリアルタイムでテキスト変更を送信できるようになりました。

画像処理：調整フィルター（Adjustment Filter）機能を追加しました。

UX 改善：既定言語の選択とウィンドウクローズイベントを追加しました。

パフォーマンス最適化：独自のデバウンスを lodash 実装に置き換え、編集をよりスムーズにしました。

#### 修正

ゲーム作成時に名前が更新されずディレクトリが適切に処理されない問題を修正しました。

同期メッセージ送信前に WebSocket 接続を確認しない問題を修正しました。

issue #388 に関連する例外を修正しました。

macOS で SIP により発生するビルドエラーを修正しました。

EffectEditor のレイアウトと入力グループ化の問題を修正しました。

リリーススクリプトの不要な権限コマンドによりビルドが失敗する問題を修正しました。

[//]: # (<!-- French Translation -->)

[//]: # (## Notes de version)

[//]: # ()
[//]: # (### Dans cette version)

[//]: # ()
[//]: # (#### Nouveaux Fonctionnalités)

[//]: # ()
[//]: # (Utilisation d'un nouveau sélecteur de fichiers)

[//]: # ()
[//]: # (Ajout de la prise en charge de la personnalisation de l'interface utilisateur de la branche de sélection du moteur)

[//]: # ()
[//]: # (#### Corrections)

[//]: # ()
[//]: # (Style de l'éditeur optimisé)

[//]: # ()
[//]: # (Correction d'un problème où l'ouverture d'un fichier sans suffixe renvoyait une erreur)

[//]: # ()
[//]: # (Correction d'un certain nombre d'erreurs dans le moteur)
