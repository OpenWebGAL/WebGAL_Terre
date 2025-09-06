; 依赖
!include MUI2.nsh

; 变量


; 常量
!define NAME "WebGal_Terre"

; 从 package.json 自动读取版本号
!define VERSION "0.0.0"
!searchparse /file package.json `"version": "` VERSION `"`

!define PRODUCT_VERSION "${VERSION}.0"
!define COPYRIGHT "Copyright © 2022 OpenWebGAL. All rights reserved." ; 版权信息
!define ICON_PATH ".\assets\icon.ico"
!define RELEASE_PATH ".\release" ; 构建文件所在位置

; 软件卸载注册表项 (当前用户)
!define UNINSTALL_KEY "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${NAME}"


; 安装信息
Name "${NAME} v${version} Setup" ; 安装程序名称
OutFile "./bundle/WebGal_Terre_Setup.exe" ; 安装包输出路径
RequestExecutionLevel user ; 设置为用户权限，无需管理员
ManifestSupportedOS all

; 图标
Icon "${ICON_PATH}"
!define MUI_ICON "${ICON_PATH}"
!define MUI_UNICON "${ICON_PATH}"
!define MUI_ABORTWARNING ; 退出时警告

; 默认安装路径 (用户个人目录)
InstallDir "$LOCALAPPDATA\${NAME}"

; 版本信息
VIAddVersionKey ProductName "${NAME} Installer"
VIAddVersionKey ProductVersion "${VERSION}"
VIAddVersionKey Comments "${NAME} is WebGal's web graphics editor."
VIAddVersionKey LegalCopyright "${COPYRIGHT}"
VIAddVersionKey FileVersion "${VERSION}"
VIAddVersionKey FileDescription "${NAME} Installer"
VIProductVersion "${PRODUCT_VERSION}"


; Welcome page
!insertmacro MUI_PAGE_WELCOME

; License page
!insertmacro MUI_PAGE_LICENSE ".\LICENSE"

; Directory page
!insertmacro MUI_PAGE_DIRECTORY

; Instfiles page
!insertmacro MUI_PAGE_INSTFILES

; Finish page
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

Section -Install
    SetOutPath $INSTDIR

    ; 可覆写情况
    SetOverwrite ifnewer

    ; 卸载程序
    WriteUninstaller "$INSTDIR\uninstall.exe"

    ; 安装包内文件
    File /r "${RELEASE_PATH}\*.*"

    ; 快捷方式
    CreateShortCut "$DESKTOP\${NAME}.lnk" "$INSTDIR\${NAME}.exe"

    ; 开始菜单
    CreateShortCut "$SMPROGRAMS\${NAME}.lnk" "$INSTDIR\${NAME}.exe"

    ; 写入卸载信息到注册表 (当前用户)
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayName" "${Name}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "InstallLocation" "$INSTDIR" ; 使用更标准的 InstallLocation
    WriteRegStr HKCU "${UNINSTALL_KEY}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayIcon" "$INSTDIR\${NAME}.exe" ; 指向主程序作为图标
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayVersion" "${VERSION}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "Publisher" "OpenWebGAL" ; 添加发布者信息
SectionEnd


Section -Uninstall
    RMDir /r "$INSTDIR\"

    ; 删除桌面快捷方式
    Delete "$DESKTOP\${NAME}.lnk"

    ; 删除开始菜单快捷方式
    Delete "$SMPROGRAMS\${NAME}.lnk"

    ; 删除注册表项 (当前用户)
    DeleteRegKey HKCU "${UNINSTALL_KEY}"
SectionEnd

; languages
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "SimpChinese"


; 初始化函数
Function .onInit
FunctionEnd