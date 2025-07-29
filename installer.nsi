; ����
!include MUI2.nsh


; ����


; ����
!define NAME "WebGal_Terre"
!define VERSION "4.5.13" ; �汾�ű���
!define PRODUCT_VERSION "${VERSION}.0"
!define COPYRIGHT "Mahiru - https://github.com/MakinoharaShoko" ; ��Ȩ��Ϣ
!define ICON_PATH ".\assets\icon.ico"
!define UNINSTALL_KEY "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall${NAME}" ; ����ע��
!define RELEASE_PATH ".\release" ; �����ļ�����λ��


; ��װ��Ϣ
Name "${NAME} v${version} Setup" ; ��װ��������
OutFile "./bundle/WebGal_Terre_Setup.exe" ; ��װ�����·��
RequestExecutionLevel admin ; ���ð�װ���Թ���ԱȨ������
; ͼ��
Icon "${ICON_PATH}"
!define MUI_ICON "${ICON_PATH}"
!define MUI_UNICON "${ICON_PATH}"
!define MUI_ABORTWARNING ; �˳�ʱ����
; Ĭ�ϰ�װ·��
InstallDir "$LOCALAPPDATA\${NAME}"

; �汾��Ϣ
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

    ; �ɸ�д���
    SetOverwrite ifnewer

    ; ж�س���
    WriteUninstaller "$INSTDIR\uninstall.exe"

    ; ��װ�����ļ�
    File /r "${RELEASE_PATH}\*.*"

    ; ��ݷ�ʽ
    CreateShortCut "$DESKTOP\${NAME}.lnk" "$INSTDIR\${NAME}.exe"

    ; ��ʼ�˵�
    CreateShortCut "$SMPROGRAMS\${NAME}.lnk" "$INSTDIR\${NAME}.exe"

    ; Register the installed software
    WriteRegStr HKLM "${UNINSTALL_KEY}" "DisplayName" "${Name}"
    WriteRegStr HKLM "${UNINSTALL_KEY}" "InstallDir" "$INSTDIR"
    WriteRegStr HKLM "${UNINSTALL_KEY}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "${UNINSTALL_KEY}" "DisplayIcon" "$INSTDIR\resources\uninstallerIcon.ico"
    WriteRegStr HKLM "${UNINSTALL_KEY}" "DisplayVersion" "${VERSION}"

    ; �ó����Թ���Ա��������
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


; ��ʼ������
Function .onInit
FunctionEnd
