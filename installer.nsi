; 依赖
!include MUI2.nsh


; 变量


; 常量
!define NAME "WebGal_Terre"
!define VERSION "4.5.13" ; 版本号变量
!define PRODUCT_VERSION "${VERSION}.0"
!define COPYRIGHT "Mahiru - https://github.com/MakinoharaShoko" ; 版权信息
!define ICON_PATH ".\assets\icon.ico"
!define UNINSTALL_KEY "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall${NAME}" ; 软件注册
!define RELEASE_PATH ".\release" ; 构建文件所在位置


; 安装信息
Name "${NAME} v${version} Setup" ; 安装程序名称
OutFile "./bundle/WebGal_Terre_Setup.exe" ; 安装包输出路径
RequestExecutionLevel admin ; 设置安装包以管理员权限运行
; 图标
Icon "${ICON_PATH}"
!define MUI_ICON "${ICON_PATH}"
!define MUI_UNICON "${ICON_PATH}"
!define MUI_ABORTWARNING ; 退出时警告
; 默认安装路径
InstallDir "$LOCALAPPDATA\${NAME}"

; 版本信息
VIAddVersionKey ProductName "${NAME} Installer" ; product name
VIAddVersionKey ProductVersion "${VERSION}" ; product version
VIAddVersionKey Comments "${NAME} is WebGal's web graphics editor." ; description
VIAddVersionKey LegalCopyright "${COPYRIGHT}" ; copyright
VIAddVersionKey FileVersion "${VERSION}" ; file version
VIAddVersionKey FileDescription "${NAME} Installer" ; file description
VIProductVersion "${PRODUCT_VERSION}" ; product verion(actual replace FileVersion)


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

    ; Register the installed software
    WriteRegStr HKLM "${UNINSTALL_KEY}" "DisplayName" "${Name}"
    WriteRegStr HKLM "${UNINSTALL_KEY}" "InstallDir" "$INSTDIR"
    WriteRegStr HKLM "${UNINSTALL_KEY}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "${UNINSTALL_KEY}" "DisplayIcon" "$INSTDIR\resources\uninstallerIcon.ico"
    WriteRegStr HKLM "${UNINSTALL_KEY}" "DisplayVersion" "${VERSION}"

    ; 让程序以管理员身份运行
    WriteRegStr HKCU "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\WebGal_Terre.exe" "RUNASADMIN"
SectionEnd

Section run_as_admin
SectionEnd


Section -Uninstall
    RMDir /r "$INSTDIR\"

    ; delete Desktop icon
    Delete "$DESKTOP\${NAME}.lnk"

    ; delete start menu folder 
    Delete "$SMPROGRAMS\${NAME}.lnk"

    ; delete reg item
    DeleteRegKey HKLM "${UNINSTALL_KEY}"

    DeleteRegKey HKCU "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers\$INSTDIR"
SectionEnd

; languages
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "SimpChinese"


; 初始化函数
Function .onInit
FunctionEnd
