import {
  Button,
  Combobox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Option,
  ToolbarButton,
} from '@fluentui/react-components';
import {
  Dismiss24Filled,
  Dismiss24Regular,
  ArrowEnterLeftFilled,
  ArrowEnterLeftRegular,
  ArrowRepeatAllFilled,
  ArrowRepeatAllOffRegular,
  bundleIcon,
  EyeFilled,
  EyeOffFilled,
  LiveFilled,
  LiveOffFilled,
  LocalLanguageFilled,
  LocalLanguageRegular,
  NavigationFilled,
  NavigationRegular,
  Settings20Regular,
} from '@fluentui/react-icons';
import { Platte } from '@icon-park/react';
import { ReactNode, useEffect, useState } from 'react';
import { t } from '@lingui/macro';
import useEditorStore from '@/store/useEditorStore';
import TagInputPicker from '@/pages/editor/GraphicalEditor/components/TagInputPicker';
import { candidateFontSizes } from '@/pages/editor/Topbar/tabs/Settings/constants';
import { UserDataSettingsPanel } from '@/components/UserDataSettings/UserDataSettingsDialog';
import styles from './AppSettingsDialog.module.scss';

export {
  USER_DATA_STATUS_KEY,
  userDataStatusFetcher,
} from '@/components/UserDataSettings/UserDataSettingsDialog';

const LocalLanguageIcon = bundleIcon(LocalLanguageFilled, LocalLanguageRegular);
const LiveIcon = bundleIcon(LiveFilled, LiveOffFilled);
const ArrowEnterLeftIcon = bundleIcon(ArrowEnterLeftFilled, ArrowEnterLeftRegular);
const NavigationIcon = bundleIcon(NavigationFilled, NavigationRegular);
const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);

interface AppSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AppSettingsButtonProps {
  appearance?: 'subtle' | 'transparent' | 'primary';
  label?: ReactNode;
}

interface SettingTileProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function SettingTile({
  icon,
  title,
  description,
  active = false,
  onClick,
}: SettingTileProps) {
  return (
    <button
      type="button"
      className={`${styles.tile} ${active ? styles.tileActive : ''}`}
      onClick={onClick}
    >
      <span className={styles.tileIcon}>{icon}</span>
      <span className={styles.tileText}>
        <span className={styles.tileTitle}>{title}</span>
        {description && <span className={styles.tileDescription}>{description}</span>}
      </span>
    </button>
  );
}

export function AppSettingsButton({
  appearance = 'subtle',
  label = t`设置`,
}: AppSettingsButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ToolbarButton
        appearance={appearance}
        icon={<Settings20Regular />}
        onClick={() => setOpen(true)}
        style={{
          fontWeight: 'normal',
          fontSize: '14px',
          paddingLeft: '4px',
          paddingRight: '4px',
          minWidth: 0,
          textWrap: 'nowrap',
        }}
      >
        {label}
      </ToolbarButton>
      <AppSettingsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function SettingsShortcutGrid({
  onOpenSettings,
}: {
  onOpenSettings?: () => void;
}) {
  const updateLanguage = useEditorStore.use.updateLanguage();
  const isDarkMode = useEditorStore.use.isDarkMode();
  const updateIsDarkMode = useEditorStore.use.updateIsDarkMode();
  const isAutoWarp = useEditorStore.use.isAutoWarp();
  const updateIsAutoWarp = useEditorStore.use.updateIsAutoWarp();
  const isShowPreview = useEditorStore.use.isShowPreview();
  const updateIsShowPreview = useEditorStore.use.updateIsShowPreview();
  const isEnableLivePreview = useEditorStore.use.isEnableLivePreview();
  const updateIsEnableLivePreview = useEditorStore.use.updateIsEnableLivePreview();
  const isUseExpSyncFast = useEditorStore.use.isUseExpFastSync();
  const updateIsUseExpSyncFast = useEditorStore.use.updateIsUseExpFastSync();
  const isUseRealtimeEffect = useEditorStore.use.isUseRealtimeEffect();
  const updateIsUseRealtimeEffect = useEditorStore.use.updateIsUseRealtimeEffect();
  const isCascaderDelimitersCustomizable = useEditorStore.use.isCascaderDelimitersCustomizable();
  const updateIsCascaderDelimitersCustomizable = useEditorStore.use.updateIsCascaderDelimitersCustomizable();
  const updateCascaderDelimiters = useEditorStore.use.updateCascaderDelimiters();

  return (
    <div className={styles.grid}>
      {onOpenSettings && (
        <SettingTile
          icon={<Settings20Regular />}
          title={t`更多设置`}
          description={t`打开完整设置`}
          onClick={onOpenSettings}
        />
      )}
      <Menu>
        <MenuTrigger>
          <div>
            <SettingTile
              icon={<LocalLanguageIcon />}
              title={t`语言`}
              description={t`切换界面语言`}
            />
          </div>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem onClick={() => updateLanguage('zhCn')}>简体中文</MenuItem>
            <MenuItem onClick={() => updateLanguage('en')}>English</MenuItem>
            <MenuItem onClick={() => updateLanguage('ja')}>日本語</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      <SettingTile
        icon={<Platte />}
        title={t`主题`}
        description={isDarkMode ? t`深色` : t`浅色`}
        active={isDarkMode}
        onClick={() => updateIsDarkMode(!isDarkMode)}
      />
      <SettingTile
        icon={isShowPreview ? <EyeFilled /> : <EyeOffFilled />}
        title={t`显示预览窗口`}
        description={isShowPreview ? t`启用` : t`关闭`}
        active={isShowPreview}
        onClick={() => updateIsShowPreview(!isShowPreview)}
      />
      <SettingTile
        icon={isEnableLivePreview ? <LiveIcon /> : <LiveOffFilled />}
        title={t`实时预览打开`}
        description={isEnableLivePreview ? t`启用` : t`关闭`}
        active={isEnableLivePreview}
        onClick={() => updateIsEnableLivePreview(!isEnableLivePreview)}
      />
      <SettingTile
        icon={isUseExpSyncFast ? <ArrowRepeatAllFilled /> : <ArrowRepeatAllOffRegular />}
        title={t`快速预览语句`}
        description={isUseExpSyncFast ? t`启用` : t`关闭`}
        active={isUseExpSyncFast}
        onClick={() => updateIsUseExpSyncFast(!isUseExpSyncFast)}
      />
      <SettingTile
        icon={isUseRealtimeEffect ? <LiveIcon /> : <LiveOffFilled />}
        title={t`快速预览效果`}
        description={isUseRealtimeEffect ? t`启用` : t`关闭`}
        active={isUseRealtimeEffect}
        onClick={() => updateIsUseRealtimeEffect(!isUseRealtimeEffect)}
      />
      <SettingTile
        icon={isAutoWarp ? <ArrowEnterLeftIcon /> : <NavigationIcon />}
        title={isAutoWarp ? t`自动换行` : t`永不换行`}
        description={t`代码编辑器`}
        active={isAutoWarp}
        onClick={() => updateIsAutoWarp(!isAutoWarp)}
      />
      <SettingTile
        icon={<Settings20Regular />}
        title={t`自定义级联选择器分隔符`}
        description={isCascaderDelimitersCustomizable ? t`启用` : t`关闭`}
        active={isCascaderDelimitersCustomizable}
        onClick={() => {
          const next = !isCascaderDelimitersCustomizable;
          updateIsCascaderDelimitersCustomizable(next);
          if (!next) updateCascaderDelimiters(['/']);
        }}
      />
    </div>
  );
}

export function AppSettingsDialog({ open, onOpenChange }: AppSettingsDialogProps) {
  const editorFontFamily = useEditorStore.use.editorFontFamily();
  const editorFontSize = useEditorStore.use.editorFontSize();
  const updateEditorFontFamily = useEditorStore.use.updateEditorFontFamily();
  const updateEditorFontSize = useEditorStore.use.updateEditorFontSize();
  const isCascaderDelimitersCustomizable = useEditorStore.use.isCascaderDelimitersCustomizable();
  const cascaderDelimiters = useEditorStore.use.cascaderDelimiters();
  const updateCascaderDelimiters = useEditorStore.use.updateCascaderDelimiters();
  const [tempFontSize, setTempFontSize] = useState(editorFontSize.toString());

  useEffect(() => {
    setTempFontSize(editorFontSize.toString());
  }, [editorFontSize]);

  useEffect(() => {
    const testValue = Number.parseFloat(tempFontSize);
    if (!Number.isNaN(testValue)) {
      updateEditorFontSize(testValue);
    }
  }, [tempFontSize]);

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button appearance="subtle" aria-label={t`关闭`} icon={<DismissIcon />} />
              </DialogTrigger>
            }
          >
            {t`设置`}
          </DialogTitle>
          <DialogContent className={styles.content}>
            <div className={styles.sections}>
              <section className={styles.section}>
                <div className={styles.sectionTitle}>{t`常用设置`}</div>
                <SettingsShortcutGrid />
              </section>
              <section className={styles.section}>
                <div className={styles.sectionTitle}>{t`代码编辑器`}</div>
                <div className={styles.fieldGrid}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>{t`字体`}</span>
                    <Input
                      value={editorFontFamily}
                      onChange={(ev) => updateEditorFontFamily(ev.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>{t`字体大小`}</span>
                    <Combobox
                      freeform
                      value={tempFontSize}
                      onChange={(ev) => setTempFontSize(ev.target.value)}
                      onOptionSelect={(_, data) => setTempFontSize(data.optionValue ?? '')}
                    >
                      {candidateFontSizes.map((option) => (
                        <Option key={option}>{option.toString()}</Option>
                      ))}
                    </Combobox>
                  </label>
                </div>
              </section>
              {isCascaderDelimitersCustomizable && (
                <section className={styles.section}>
                  <div className={styles.sectionTitle}>{t`自定义级联选择器分隔符`}</div>
                  <div className={styles.cascaderInput}>
                    <TagInputPicker
                      onOptionSelect={(options) => updateCascaderDelimiters(options)}
                      selectedOptions={cascaderDelimiters}
                    />
                  </div>
                </section>
              )}
              <section className={styles.section}>
                <div className={styles.sectionTitle}>{t`用户数据`}</div>
                <UserDataSettingsPanel />
              </section>
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
