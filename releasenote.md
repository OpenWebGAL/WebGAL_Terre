## 发布日志

### 在此版本中

#### 新功能

新增动画编辑器。打开动画文件或编辑多段动画时，可以在时间轴上添加和拖动关键帧、为关键帧设置缓动，并实时预览动画效果。

支持新版动画格式。开启“相对动画”后，动画会基于立绘或背景的当前状态进行变换；开启“帧继承”后，关键帧中没有设置的属性会沿用之前关键帧的值。模板中新增一组以 -v2 结尾的内置动画。

游戏配置中新增 Live2D 预留内存设置，可以调整 Live2D 预先分配的内存大小。

#### 修复

修复在脚本编辑中打开场景时，如果场景读取缓慢或失败，场景文件可能被错误内容覆盖的问题。现在读取完成前无法编辑，读取或保存失败时会提示并可以重试。

修复在脚本编辑中切回窗口时，尚未保存的修改可能被覆盖的问题。

<!-- English Translation -->
## Release Notes

### In this version

#### New Features

Added an animation editor. When opening an animation file or editing multiple animations, you can add and drag keyframes on a timeline, set easing for each keyframe, and preview the animation in real time.

Added support for the new animation format. With "Relative animation" on, animations transform figures or backgrounds from their current state. With "Keyframe inheritance" on, properties not set in a keyframe carry over values from previous keyframes. Templates now include a set of built-in animations ending in -v2.

Added a Live2D reserved memory setting to the game configuration, which adjusts how much memory Live2D allocates in advance.

#### Fixes

Fixed scene files possibly being overwritten with incorrect content when a scene loaded slowly or failed to load in script editing. Editing is now disabled until the scene has loaded, and a message with a retry option appears if loading or saving fails.

Fixed unsaved changes possibly being overwritten when switching back to the window in script editing.

<!-- Japanese Translation -->
## リリースノート

### このバージョンでは

#### 新機能

アニメーションエディタを追加しました。アニメーションファイルを開いたときや複数のアニメーションを編集するときに、タイムライン上でキーフレームを追加・ドラッグしたり、キーフレームごとにイージングを設定したりでき、アニメーションをリアルタイムでプレビューできます。

新しいアニメーション形式に対応しました。「相対アニメーション」をオンにすると、立ち絵や背景の現在の状態を基準に変換します。「キーフレーム継承」をオンにすると、キーフレームで設定されていないプロパティは前のキーフレームの値を引き継ぎます。テンプレートに -v2 で終わる組み込みアニメーションを追加しました。

ゲーム構成に Live2D の予約メモリ設定を追加しました。Live2D があらかじめ確保するメモリの大きさを調整できます。

#### 修正

スクリプト編集でシーンを開く際、シーンの読み込みが遅い、または失敗した場合に、シーンファイルが誤った内容で上書きされることがある問題を修正しました。読み込みが完了するまでは編集できず、読み込みや保存に失敗した場合はメッセージが表示され、再試行できます。

スクリプト編集でウィンドウに戻ったときに、未保存の変更が上書きされることがある問題を修正しました。
