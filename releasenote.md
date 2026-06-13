## 发布日志

### 在此版本中

#### 新功能

新增韩语界面，并支持根据系统语言自动选择韩语。

新增调试变量面板，可在实时预览开始时注入变量、查看当前预览变量，并调整调试区域高度。

优化图形化编辑器在长场景中的滚动与编辑性能，减少大量语句时的卡顿。

优化图形化语句编辑体验，新增背景和立绘素材预览，并更清晰地展示连续执行关系、条件选项和开关状态。

优化编辑器与实时预览的同步流程，场景切换、语句修改和手动同步时更加稳定。

创建游戏时可以不使用模板。

补充对鉴赏排序、继续游戏按钮是否启用、是否忽略默认变换效果的编辑器选项。

#### 修复

修复快速编辑或切换场景时，文本编辑器最后一次修改可能未及时保存的问题。

修复 4.6 用户数据目录下游戏自带扩展库可能无法正确覆盖内置资源的问题。

修复预览窗口拖拽调整可能反复提交文件并影响效果编辑器性能的问题。

修复同一立绘 ID 更换素材后，或使用部分预设目标和特殊 ID 时，拖拽调整框可能无法取得正确素材尺寸的问题。

修复使用定制引擎时，返回错误的兜底模板文件的问题。

<!-- English Translation -->
## Release Notes

### In this version

#### New Features

Added a Korean interface with automatic selection based on the system language.

Added a debug variables panel for injecting variables when live preview starts, viewing current preview variables, and resizing the debugger area.

Improved scrolling and editing performance for long scenes in the graphical editor, reducing lag in scenes with many statements.

Improved graphical statement editing with background and figure previews, plus clearer displays for continuous execution, conditional options, and toggle states.

Improved synchronization between the editor and live preview, making scene switching, statement editing, and manual resynchronization more stable.

Games can now be created without using a template.

Added editor options for gallery ordering, whether the Continue button is enabled, and whether default transform effects are ignored.

#### Fixes

Fixed the last text edit possibly not being saved in time when editing quickly or switching scenes.

Fixed game extension libraries possibly failing to override built-in resources under the 4.6 user data directory.

Fixed preview drag adjustments possibly submitting files repeatedly and reducing effect editor performance.

Fixed an issue where the wrong fallback template file could be returned when using a custom engine.

<!-- Japanese Translation -->
## リリースノート

### このバージョンでは

#### 新機能

韓国語 UI を追加し、システム言語に応じた自動選択にも対応しました。

デバッグ変数パネルを追加し、リアルタイムプレビュー開始時の変数注入、現在のプレビュー変数の確認、デバッグ領域の高さ調整に対応しました。

長いシーンでのグラフィカルエディターのスクロールと編集性能を改善し、多数の文を含むシーンでの動作の重さを軽減しました。

背景と立ち絵の素材プレビューを追加し、連続実行の関係、条件オプション、切り替え状態をより分かりやすく表示するようにしました。

エディターとリアルタイムプレビューの同期処理を改善し、シーン切り替え、文の編集、手動での再同期をより安定させました。

テンプレートを使用せずにゲームを作成できるようになりました。

鑑賞の並び順、「続きから」ボタンを有効にするかどうか、デフォルトの変形効果を無視するかどうかに関するエディターオプションを追加しました。

#### 修正

素早く編集した場合やシーンを切り替えた場合に、テキストエディターの最後の変更がすぐに保存されないことがある問題を修正しました。

4.6 のユーザーデータディレクトリ環境で、ゲーム付属の拡張ライブラリが組み込みリソースを正しく上書きできないことがある問題を修正しました。

プレビュー画面でのドラッグ調整によってファイルが繰り返し保存され、エフェクトエディターの性能が低下することがある問題を修正しました。

同じ立ち絵 ID の素材を変更した場合や、一部のプリセットターゲットと特殊 ID を使用した場合に、ドラッグ調整枠が正しい素材サイズを取得できないことがある問題を修正しました。

カスタムエンジンを使用している場合に、誤ったフォールバック用テンプレートファイルが返される問題を修正しました。