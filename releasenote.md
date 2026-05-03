## 发布日志

### 在此版本中

#### 新功能

新增模板导入与导出功能，支持通过 ZIP 文件导入模板、导出模板并打开导出目录，并会校验重名与不完整模板

新增 `choose` 语句默认选项的图形化编辑与 `defaultChoose` 参数补全支持，可用于快速预览时自动选择指定选项

新增编辑器默认语言自动检测，会根据已保存语言或浏览器语言选择简体中文、日语或英语

新增 Electron 端 Steamworks 集成，支持 Steam Overlay 初始化与成就解锁接口，并优化 Electron 启动加载与应用图标

#### 修复

修复角色对话语法高亮在分号注释前误识别冒号的问题

<!-- English Translation -->
## Release Notes

### In this version

#### New Features

Added template import and export support, including ZIP import, template export, automatic opening of the export folder, and validation for duplicate or incomplete templates

Added graphical editing for the `choose` default option and completion support for the `defaultChoose` parameter, allowing quick preview to automatically select the specified option

Added automatic editor language detection for Simplified Chinese, Japanese, and English based on saved preferences or browser language

Added Electron Steamworks integration with Steam Overlay initialization and achievement unlock APIs, plus improved Electron startup loading and app icon setup

#### Fixes

Fixed character-dialogue syntax highlighting incorrectly treating colons in semicolon comments as statement operators

<!-- Japanese Translation -->
## リリースノート

### このバージョンでは

#### 新機能

テンプレートのインポート/エクスポート機能を追加し、ZIP からの取り込み、テンプレートの書き出し、書き出し先フォルダーの自動表示に対応し、重複名や不完全なテンプレートも検証するようにしました

`choose` 文のデフォルト選択肢をグラフィカルエディターで編集できるようにし、`defaultChoose` パラメーターの補完に対応しました。クイックプレビューで指定した選択肢を自動選択できます

保存済みの言語設定またはブラウザー言語に基づき、簡体字中国語、日本語、英語からエディターの既定言語を自動選択する機能を追加しました

Electron 版に Steamworks 連携を追加し、Steam Overlay の初期化と実績解除 API に対応しました。また、Electron の起動時読み込みとアプリアイコン設定を改善しました

#### 修正

キャラクター台詞のシンタックスハイライトで、セミコロンコメント内のコロンを文の演算子として誤認識する問題を修正しました
