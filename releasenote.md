## 发布日志

### 在此版本中

#### 新功能

新增 4.6 用户数据目录体系，游戏、模板、定制引擎和导出内容会统一保存在用户数据目录中，后续升级不再需要手动迁移安装目录下的工程文件。

新增用户数据迁移入口，可将旧版本中的游戏、自定义模板和定制引擎迁移到新的用户数据目录。

新增迁移文档入口，可按当前语言从迁移提示和用户数据设置中打开 4.6 迁移说明。

新增用户数据设置，可打开用户数据目录、配置目录、安装目录，并支持恢复默认目录或迁移到指定目录。

新增 portable 模式支持，安装目录下存在 `data` 文件夹时可使用便携数据目录。

新增 Android 端文件入口，可从主界面直接打开 Terre 文件目录。

新增快速预览超时提示弹窗，用于说明循环跳转或快进计算过长导致的预览中止。

新增更多常用语句的图形化编辑项，包含 `wait` 和输入相关语句。

新增模板编辑器的已读文本样式项，并支持切换文本框文本的已读或未读状态。

重构设置界面与仪表盘侧边栏，用户数据、应用设置和编辑器设置入口更加集中。

优化游戏、资源、模板和导出文件的访问方式，以适配新的用户数据目录。

优化图形化编辑器参数面板，更多命令可以通过开关、选项、目标和默认值输入来编辑。

优化 `choose` 语句图形化编辑界面，可更清晰地选择跳转到场景文件、本场景标签或手动输入标签。

优化默认模板和游戏模板处理，减少模板为空或默认模板配置异常时的错误。

更新内置模板和默认模板配置，以适配 4.6 的工程结构。

#### 修复

修复资源列表在特定情况下可能报错的问题。

修复部分模板名称、目录或默认模板为空时可能导致的界面异常。

修复 Windows 用户目录路径在部分环境下处理不正确的问题。

修复 Android 端默认用户数据目录可能指向不可用主目录的问题。

修复 Android 端从通知或主界面打开浏览器时可能因 Intent 参数不足而失败的问题。

修复更新 WebGAL 引擎模板时未同步 `webgal-engine.json` 的问题。

<!-- English Translation -->
## Release Notes

### In this version

#### New Features

Added the 4.6 user data directory system. Games, templates, custom engines, and exported files are now stored in the user data directory, so future upgrades no longer require manually moving project files inside the installation directory.

Added a user data migration entry for moving games, custom templates, and custom engines from older versions into the new user data directory.

Added migration document links, allowing the 4.6 migration guide to be opened from migration notices and user data settings in the current language.

Added user data settings for opening the user data directory, config directory, and install directory, with support for restoring the default directory or migrating to a specified directory.

Added portable mode support. When a `data` folder exists in the installation directory, Terre can use it as the portable data directory.

Added an Android files entry for opening the Terre file directory directly from the main screen.

Added a fast preview timeout warning dialog to explain preview stops caused by loop jumps or overly long fast-forward calculations.

Added graphical editing entries for more common statements, including `wait` and input-related statements.

Added read-text style items to the template editor and support for switching textbox text between read and unread states.

Refactored the settings UI and dashboard sidebar, making user data, application settings, and editor settings easier to access from one place.

Improved access to games, assets, templates, and exported files for the new user data directory.

Improved the graphical editor parameter panel so more commands can be edited with switches, options, targets, and default-value inputs.

Improved the graphical editor UI for `choose` statements, making it clearer to select a scene file, an in-scene label, or manually enter a label as the jump target.

Improved default template and game template handling, reducing errors when templates are empty or default template configuration is abnormal.

Updated built-in and default template configuration for the 4.6 project structure.

#### Fixes

Fixed the asset list possibly throwing errors in specific cases.

Fixed UI issues that could occur when template names, directories, or default template values are empty.

Fixed incorrect Windows user directory path handling in some environments.

Fixed the Android default user data directory possibly pointing to an unavailable home directory.

Fixed browser opening from Android notifications or the main screen possibly failing because of insufficient Intent parameters.

Fixed `webgal-engine.json` not being synchronized when updating the WebGAL engine template.

<!-- Japanese Translation -->
## リリースノート

### このバージョンでは

#### 新機能

4.6 のユーザーデータディレクトリ体系を追加しました。ゲーム、テンプレート、カスタムエンジン、エクスポート内容はユーザーデータディレクトリに保存されるため、今後のアップグレードでインストールディレクトリ内のプロジェクトファイルを手動移行する必要がなくなります。

旧バージョンのゲーム、カスタムテンプレート、カスタムエンジンを新しいユーザーデータディレクトリへ移行する入口を追加しました。

移行通知とユーザーデータ設定から、現在の言語に応じた 4.6 移行ドキュメントを開ける入口を追加しました。

ユーザーデータディレクトリ、設定ディレクトリ、インストールディレクトリを開けるユーザーデータ設定を追加し、既定ディレクトリへの復元や指定ディレクトリへの移行にも対応しました。

portable モードに対応しました。インストールディレクトリ内に `data` フォルダーがある場合、Terre はそれを portable データディレクトリとして使用できます。

Android 版のメイン画面から Terre のファイルディレクトリを直接開けるファイル入口を追加しました。

ループジャンプや長すぎる早送り計算によるプレビュー停止を説明する高速プレビュータイムアウト警告ダイアログを追加しました。

`wait` や入力関連文など、より多くの常用文をグラフィカルに編集できるようにしました。

テンプレートエディターに既読テキストのスタイル項目を追加し、テキストボックスのテキストを既読または未読状態に切り替えられるようにしました。

設定 UI とダッシュボードのサイドバーをリファクタリングし、ユーザーデータ、アプリ設定、エディター設定へアクセスしやすくしました。

新しいユーザーデータディレクトリに合わせて、ゲーム、素材、テンプレート、エクスポートファイルの扱いを改善しました。

グラフィカルエディターのパラメーターパネルを改善し、より多くのコマンドをスイッチ、選択肢、ターゲット、既定値入力で編集できるようにしました。

`choose` 文のグラフィカル編集 UI を改善し、シーンファイル、本シーン内のラベル、または手入力ラベルをジャンプ先として選びやすくしました。

既定テンプレートとゲームテンプレートの処理を改善し、テンプレートが空の場合や既定テンプレート設定が異常な場合のエラーを減らしました。

4.6 のプロジェクト構造に合わせて、組み込みテンプレートと既定テンプレート設定を更新しました。

#### 修正

特定の場合に素材一覧がエラーになる問題を修正しました。

テンプレート名、ディレクトリ、既定テンプレート値が空の場合に発生する可能性がある UI 問題を修正しました。

一部環境で Windows ユーザーディレクトリのパス処理が正しくない問題を修正しました。

Android 版の既定ユーザーデータディレクトリが利用できないホームディレクトリを指す可能性がある問題を修正しました。

Android 版で通知またはメイン画面からブラウザーを開く際、Intent パラメーター不足により失敗する可能性がある問題を修正しました。

WebGAL エンジンテンプレート更新時に `webgal-engine.json` が同期されない問題を修正しました。
