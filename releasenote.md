## 发布日志

### 在此版本中

#### 新功能

新增实验性流程图功能，可在游戏配置中启用，创建主线和支线流程图，并为节点关联场景文件。

流程图编辑器支持新增、重命名、删除流程图和节点，支持拖拽连接节点，并可自动保存。

新增回收站设置，删除游戏、模板或素材文件时可选择移动到系统回收站，降低误删风险。

优化 Android 版运行方式，启动时会自动准备运行环境，提供更明确的启动、停止和文件入口。

优化预览窗口拖拽调整体验，立绘和变换目标的定位、缩放和旋转结果更贴近实时预览中的实际显示。

#### 修复

修复预览窗口拖拽调整在部分素材、预设目标或特殊 ID 下可能取得错误尺寸或位置的问题。

修复拖拽调整时继承的变换参数可能被写入为默认值，导致效果配置被意外改变的问题。

修复启用实验性快速同步时，实时预览可能未按预期同步的问题。

修复默认模板文字在部分环境下可能出现颜色显示异常的问题。

修复 Android 版在准备内置资源时可能启动失败的问题。

<!-- English Translation -->
## Release Notes

### In this version

#### New Features

Added an experimental flowchart feature that can be enabled in game settings, with support for main and branch flowcharts linked to scene files.

The flowchart editor now supports creating, renaming, and deleting flowcharts and nodes, connecting nodes by dragging, and auto-saving changes.

Added a Recycle Bin setting so deleted games, templates, and asset files can be moved to the system recycle bin instead of being removed permanently.

Improved the Android runtime flow. The app now prepares its runtime environment automatically on startup and provides clearer start, stop, and file entry points.

Improved preview drag adjustments so figure and transform target position, scale, and rotation better match the actual live preview display.

#### Fixes

Fixed preview drag adjustment boxes possibly using the wrong size or position for some assets, preset targets, or special IDs.

Fixed inherited transform values possibly being written as default values during drag adjustment and unexpectedly changing effect settings.

Fixed live preview possibly not using the expected sync mode when experimental fast sync was enabled.

Fixed default template text color possibly displaying incorrectly in some environments.

Fixed Android startup possibly failing while preparing bundled resources.

<!-- Japanese Translation -->
## リリースノート

### このバージョンでは

#### 新機能

実験的なフローチャート機能を追加し、ゲーム設定から有効化して、メインとサブのフローチャートを作成し、ノードにシーンファイルを関連付けられるようにしました。

フローチャートエディターでは、フローチャートとノードの追加、名前変更、削除、ドラッグによるノード接続、自動保存に対応しました。

ごみ箱設定を追加し、ゲーム、テンプレート、素材ファイルの削除時にシステムのごみ箱へ移動できるようにしました。

Android 版の実行フローを改善し、起動時に実行環境を自動で準備し、開始、停止、ファイル操作の入口を分かりやすくしました。

プレビュー画面でのドラッグ調整を改善し、立ち絵や変形対象の位置、拡大率、回転がリアルタイムプレビューの表示により近くなるようにしました。

#### 修正

一部の素材、プリセットターゲット、特殊 ID で、ドラッグ調整枠のサイズや位置が誤って取得されることがある問題を修正しました。

ドラッグ調整時に継承された変形値がデフォルト値として書き込まれ、エフェクト設定が意図せず変わることがある問題を修正しました。

実験的な高速同期を使用している場合に、リアルタイムプレビューが期待した同期方式で動作しないことがある問題を修正しました。

一部の環境でデフォルトテンプレートの文字色が正しく表示されないことがある問題を修正しました。

Android 版で同梱リソースの準備中に起動が失敗することがある問題を修正しました。
