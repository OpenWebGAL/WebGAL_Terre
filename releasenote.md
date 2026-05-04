## 发布日志

### 在此版本中

#### 新功能

新增 4.6 用户数据目录体系，游戏、模板、定制引擎和导出内容会统一保存在用户数据目录中，后续升级不再需要手动迁移安装目录下的工程文件。

新增用户数据迁移入口，可将旧版本中的游戏、自定义模板和定制引擎迁移到新的用户数据目录。

新增用户数据设置，可打开用户数据目录、配置目录、安装目录，并支持恢复默认目录或迁移到指定目录。

新增 portable 模式支持，安装目录下存在 `data` 文件夹时可使用便携数据目录。

新增快速预览超时提示弹窗，用于说明循环跳转或快进计算过长导致的预览中止。

新增更多常用语句的图形化编辑项，包含 `wait`、输入相关语句和基础命令参数。

重构设置界面与仪表盘侧边栏，用户数据、应用设置和编辑器设置入口更加集中。

优化游戏、资源、模板和导出文件的访问方式，以适配新的用户数据目录。

优化图形化编辑器参数面板，更多命令可以通过开关、选项、目标和默认值输入来编辑。

优化默认模板和游戏模板处理，减少模板为空或默认模板配置异常时的错误。

更新内置模板和默认模板配置，以适配 4.6 的工程结构。

#### 修复

修复资源列表在特定情况下可能报错的问题。

修复部分模板名称、目录或默认模板为空时可能导致的界面异常。

修复 Windows 用户目录路径在部分环境下处理不正确的问题。

<!-- English Translation -->
## Release Notes

### In this version

#### New Features

Added the 4.6 user data directory system. Games, templates, custom engines, and exported files are now stored in the user data directory, so future upgrades no longer require manually moving project files inside the installation directory.

Added a user data migration entry for moving games, custom templates, and custom engines from older versions into the new user data directory.

Added user data settings for opening the user data directory, config directory, and install directory, with support for restoring the default directory or migrating to a specified directory.

Added portable mode support. When a `data` folder exists in the installation directory, Terre can use it as the portable data directory.

Added a fast preview timeout warning dialog to explain preview stops caused by loop jumps or overly long fast-forward calculations.

Added graphical editing entries for more common statements, including `wait`, input-related statements, and basic command parameters.

Refactored the settings UI and dashboard sidebar, making user data, application settings, and editor settings easier to access from one place.

Improved access to games, assets, templates, and exported files for the new user data directory.

Improved the graphical editor parameter panel so more commands can be edited with switches, options, targets, and default-value inputs.

Improved default template and game template handling, reducing errors when templates are empty or default template configuration is abnormal.

Updated built-in and default template configuration for the 4.6 project structure.

#### Fixes

Fixed the asset list possibly throwing errors in specific cases.

Fixed UI issues that could occur when template names, directories, or default template values are empty.

Fixed incorrect Windows user directory path handling in some environments.

<!-- Japanese Translation -->
## リリースノート

### このバージョンでは

#### 新機能

4.6 のユーザーデータディレクトリ体系を追加しました。ゲーム、テンプレート、カスタムエンジン、エクスポート内容はユーザーデータディレクトリに保存されるため、今後のアップグレードでインストールディレクトリ内のプロジェクトファイルを手動移行する必要がなくなります。

旧バージョンのゲーム、カスタムテンプレート、カスタムエンジンを新しいユーザーデータディレクトリへ移行する入口を追加しました。

ユーザーデータディレクトリ、設定ディレクトリ、インストールディレクトリを開けるユーザーデータ設定を追加し、既定ディレクトリへの復元や指定ディレクトリへの移行にも対応しました。

portable モードに対応しました。インストールディレクトリ内に `data` フォルダーがある場合、Terre はそれを portable データディレクトリとして使用できます。

ループジャンプや長すぎる早送り計算によるプレビュー停止を説明する高速プレビュータイムアウト警告ダイアログを追加しました。

`wait`、入力関連文、基本コマンドのパラメーターなど、より多くの常用文をグラフィカルに編集できるようにしました。

設定 UI とダッシュボードのサイドバーをリファクタリングし、ユーザーデータ、アプリ設定、エディター設定へアクセスしやすくしました。

新しいユーザーデータディレクトリに合わせて、ゲーム、素材、テンプレート、エクスポートファイルの扱いを改善しました。

グラフィカルエディターのパラメーターパネルを改善し、より多くのコマンドをスイッチ、選択肢、ターゲット、既定値入力で編集できるようにしました。

既定テンプレートとゲームテンプレートの処理を改善し、テンプレートが空の場合や既定テンプレート設定が異常な場合のエラーを減らしました。

4.6 のプロジェクト構造に合わせて、組み込みテンプレートと既定テンプレート設定を更新しました。

#### 修正

特定の場合に素材一覧がエラーになる問題を修正しました。

テンプレート名、ディレクトリ、既定テンプレート値が空の場合に発生する可能性がある UI 問題を修正しました。

一部環境で Windows ユーザーディレクトリのパス処理が正しくない問題を修正しました。