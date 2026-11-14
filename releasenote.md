## 发布日志

### 在此版本中

#### 新功能

新增角色编辑器与“切换角色”语句。可以将身体、服装、表情等多个图层图片组合为同一个角色，在画布中直观地调整图层顺序、位置、缩放与旋转并保存多套预设，在场景中按预设或自定义图层组合显示与切换角色。

左侧边栏新增“动画”和“角色”选项卡，并在“场景”“动画”“角色”选项卡中提供快捷新建入口，可直接创建对应的场景、动画或角色。

#### 修复

修复在场景内编辑多段动画时，“相对动画”和“帧继承”设置未能在预览中生效的问题。

修复动画编辑器在第一个关键帧之前，属性栏显示的数值和添加关键帧时的初始值不正确的问题。

修复动画编辑器保存时可能丢失不含属性变化的结尾关键帧，导致动画时长缩短的问题。

修复打开动画编辑器再切回场景时，游戏实时预览会被重置、丢失当前播放进度的问题。

修复项目中只有旧版格式动画时，动画选择框为空的问题。

修复在脚本编辑中刚打开 JSON 文件时，执行撤销会清空全部内容的问题。

修复在游戏配置页修改设置后，再使用顶部工具栏的快捷配置可能用旧内容覆盖配置的问题。

修复新建游戏、重命名文件或复制文件时的重名检查问题，避免因大小写、首尾空格或特殊符号导致已有项目或文件被意外覆盖。

修复导出的 macOS 游戏无法启动的问题，并修复 macOS 打包时重复包含框架文件导致应用体积异常增大的问题。

<!-- English Translation -->
## Release Notes

### In this version

#### New Features

Added a character editor and the "Change character" statement. Multiple layer images such as body, outfit, and expression can be combined into a single character, with layer order, position, scale, and rotation adjusted visually on a canvas and saved as presets, so characters can be shown and switched in scenes using presets or custom layer combinations.

Added "Animation" and "Character" tabs to the left sidebar, along with quick-create buttons on the "Scene", "Animation", and "Character" tabs to create new scenes, animations, or characters directly.

#### Fixes

Fixed "Relative animation" and "Keyframe inheritance" settings not taking effect in the preview when editing multiple animations inside a scene.

Fixed the animation editor showing incorrect values in the inspector and writing wrong initial values when adding a keyframe before the first keyframe.

Fixed saving in the animation editor possibly dropping a trailing keyframe without property changes, shortening the animation duration.

Fixed opening the animation editor and switching back to a scene resetting the live game preview and losing its playback progress.

Fixed the animation dropdown appearing empty in projects that contain only legacy-format animations.

Fixed undoing right after opening a JSON file in script editing clearing the entire file content.

Fixed quick configuration in the top toolbar possibly overwriting settings with stale values after modifying them on the game configuration page.

Fixed duplicate-name checks when creating games, renaming files, or duplicating files to prevent existing projects or files from being overwritten due to letter case, leading or trailing spaces, or special characters.

Fixed exported macOS games failing to launch, and fixed framework files being bundled multiple times during macOS packaging and inflating the app size.

<!-- Japanese Translation -->
## リリースノート

### このバージョンでは

#### 新機能

キャラクターエディタと「キャラクターの切り替え」文を追加しました。素体、衣装、表情などの複数のレイヤー画像を 1 人のキャラクターとして組み合わせ、キャンバス上でレイヤーの順序、位置、拡大縮小、回転を直感的に調整して複数のプリセットとして保存し、シーン内でプリセットや任意のレイヤー構成を使って表示・切り替えができます。

左サイドバーに「アニメーション」と「キャラクター」タブを追加し、「シーン」「アニメーション」「キャラクター」タブから対応するシーン、アニメーション、キャラクターを直接作成できる新規作成ボタンを追加しました。

#### 修正

シーン内で複数のアニメーションを編集する際、「相対アニメーション」と「キーフレーム継承」の設定がプレビューに反映されない問題を修正しました。

アニメーションエディタで最初のキーフレームより前の位置にあるとき、プロパティ欄の表示値やキーフレーム追加時の初期値が正しくならない問題を修正しました。

アニメーションエディタで保存する際、プロパティの変化を含まない末尾のキーフレームが失われ、アニメーションの長さが短くなることがある問題を修正しました。

アニメーションエディタを開いてからシーンに戻った際、ゲームのリアルタイムプレビューがリセットされ、再生位置が失われる問題を修正しました。

旧形式のアニメーションのみを含むプロジェクトで、アニメーションの選択欄が空になる問題を修正しました。

スクリプト編集で JSON ファイルを開いた直後に元に戻す操作を行うと、内容がすべて消えてしまう問題を修正しました。

ゲーム構成ページで設定を変更したあと、上部ツールバーのクイック設定を使うと古い内容で上書きされることがある問題を修正しました。

ゲームの新規作成、ファイル名の変更、ファイルの複製における重複チェックを修正し、大文字・小文字の違いや前後の空白、記号によって既存のプロジェクトやファイルが誤って上書きされないようにしました。

書き出した macOS 版ゲームが起動しない問題を修正し、macOS 向けのパッケージ作成時にフレームワークファイルが重複して含まれアプリのサイズが肥大化する問題を修正しました。
