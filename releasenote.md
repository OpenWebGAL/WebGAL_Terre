## 发布日志

### 在此版本中

#### 新功能

较长的语句会自动分成多行显示，脚本编辑中的高亮和补全同样支持。

新增场景调用传值。可以为调用的场景传入数据，并指定把返回的结果保存到哪个变量，新增用于提前结束被调用场景的返回语句。

设置变量时可以选择只在当前场景内有效，场景结束后自动消失。

立绘位置新增左侧 1/4、左侧 1/3、右侧 1/3 和右侧 1/4，立绘、对话和预览调整框均已支持。

新增回收站设置，删除游戏、模板或素材文件时可选择移动到系统回收站，降低误删风险。

支持 opus 格式的音频。

脚本编辑新增检查提示，调用场景时使用了引擎已占用的名称会给出提醒。

优化图形编辑块的排版，连续执行和条件判断不再单独占一行。

优化对话编辑器的选项说明。

精简流程图编辑器的界面，移除侧边栏中多余的说明文字。

#### 修复

修复流程图编辑器中重复添加根节点或连出循环时没有提示的问题。

<!-- English Translation -->
## Release Notes

### In this version

#### New Features

Longer statements are now split across several lines automatically, and script editing highlights and completes them as well.

Added value passing for scene calls. Data can be passed into a called scene, the returned result can be stored in a chosen variable, and a new return statement ends a called scene early.

Variables can now be set to be valid only inside the current scene and disappear when the scene ends.

Added four figure positions: left 1/4, left 1/3, right 1/3, and right 1/4, supported by figures, dialogue, and the preview adjustment box.

Added a Recycle Bin setting so deleted games, templates, and asset files can be moved to the system recycle bin instead of being removed permanently.

Added support for opus audio.

Script editing now warns when a scene call uses a name already taken by the engine.

Improved the layout of graphical editing blocks so continuous execution and conditions no longer take up a line of their own.

Improved the option descriptions in the dialogue editor.

Simplified the flowchart editor by removing the extra explanatory text from the sidebar.

#### Fixes

Fixed adding a duplicate root node or drawing a loop in the flowchart editor giving no feedback.

<!-- Japanese Translation -->
## リリースノート

### このバージョンでは

#### 新機能

長い文が自動的に複数行に分かれて表示されるようになりました。スクリプト編集でのハイライトと補完にも対応しています。

シーン呼び出しの値の受け渡しを追加しました。呼び出すシーンにデータを渡し、返ってきた結果を保存する変数を指定できます。呼び出したシーンを途中で終了する戻り文も追加しました。

変数を設定するときに、現在のシーンの中だけで有効にする選択肢を追加しました。シーンが終わると自動的に消えます。

立ち絵の位置に左 1/4、左 1/3、右 1/3、右 1/4 を追加しました。立ち絵、会話、プレビューの調整枠のいずれも対応しています。

ごみ箱設定を追加し、ゲーム、テンプレート、素材ファイルの削除時にシステムのごみ箱へ移動できるようにしました。

opus 形式の音声に対応しました。

スクリプト編集にチェック機能を追加し、シーンの呼び出しでエンジンが使用済みの名前を使っている場合に知らせるようにしました。

グラフィカル編集ブロックのレイアウトを改善し、連続実行と条件判断が単独で 1 行を占めないようにしました。

会話エディターの選択肢の説明を改善しました。

フローチャートエディターの画面を整理し、サイドバーの余分な説明文を削除しました。

#### 修正

フローチャートエディターでルートノードを重ねて追加したり、循環する接続を作ろうとしても何も反応がない問題を修正しました。
