import { useEffect, useState } from 'react';
import { t } from '@lingui/macro';
import {
  Combobox,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Option,
} from '@fluentui/react-components';
import {
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
import TopbarTab from '@/pages/editor/Topbar/components/TopbarTab';
import { TabItem } from '@/pages/editor/Topbar/components/TabItem';
import { IconWithTextItem } from '@/pages/editor/Topbar/components/IconWithTextItem';
import useEditorStore from '@/store/useEditorStore';
import TagInputPicker from '@/pages/editor/GraphicalEditor/components/TagInputPicker';
import { candidateFontSizes } from '@/pages/editor/Topbar/tabs/Settings/constants';
import { AppSettingsDialog } from '@/components/AppSettings/AppSettingsDialog';
import s from './settingsTab.module.scss';

const LocalLanguageIcon = bundleIcon(LocalLanguageFilled, LocalLanguageRegular);
const LiveIcon = bundleIcon(LiveFilled, LiveOffFilled);
const ArrowEnterLeftIcon = bundleIcon(ArrowEnterLeftFilled, ArrowEnterLeftRegular);
const NavigationIcon = bundleIcon(NavigationFilled, NavigationRegular);

export function SettingsTab() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempFontSize, setTempFontSize] = useState('');

  const updateLanguage = useEditorStore.use.updateLanguage();
  const isDarkMode = useEditorStore.use.isDarkMode();
  const updateIsDarkMode = useEditorStore.use.updateIsDarkMode();
  const editorFontFamily = useEditorStore.use.editorFontFamily();
  const editorFontSize = useEditorStore.use.editorFontSize();
  const updateEditorFontFamily = useEditorStore.use.updateEditorFontFamily();
  const updateEditorFontSize = useEditorStore.use.updateEditorFontSize();
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
  const cascaderDelimiters = useEditorStore.use.cascaderDelimiters();
  const updateCascaderDelimiters = useEditorStore.use.updateCascaderDelimiters();

  useEffect(() => {
    setTempFontSize(editorFontSize.toString());
  }, [editorFontSize]);

  useEffect(() => {
    const testValue = Number.parseFloat(tempFontSize);
    if (!Number.isNaN(testValue)) {
      updateEditorFontSize(testValue);
    }
  }, [tempFontSize]);

  const toggleCascaderDelimiter = () => {
    const next = !isCascaderDelimitersCustomizable;
    updateIsCascaderDelimitersCustomizable(next);
    if (!next) {
      updateCascaderDelimiters(['/']);
    }
  };

  return (
    <>
      <TopbarTab>
        <TabItem title={t`语言`}>
          <Menu>
            <MenuTrigger>
              <div>
                <IconWithTextItem
                  icon={<LocalLanguageIcon />}
                  text={t`语言`}
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
        </TabItem>
        <TabItem title={t`主题`}>
          <IconWithTextItem
            onClick={() => updateIsDarkMode(!isDarkMode)}
            icon={<Platte className={s.iconColor} />}
            text={isDarkMode ? t`深色` : t`浅色`}
          />
        </TabItem>
        <TabItem title={t`预览`}>
          <IconWithTextItem
            onClick={() => updateIsShowPreview(!isShowPreview)}
            icon={isShowPreview ? <EyeFilled /> : <EyeOffFilled />}
            text={isShowPreview ? t`显示预览窗口` : t`关闭预览窗口`}
          />
          <IconWithTextItem
            onClick={() => updateIsEnableLivePreview(!isEnableLivePreview)}
            icon={isEnableLivePreview ? <LiveIcon /> : <LiveOffFilled />}
            text={isEnableLivePreview ? t`实时预览打开` : t`实时预览关闭`}
          />
        </TabItem>
        <TabItem title={t`实验性快速预览`}>
          <IconWithTextItem
            onClick={() => updateIsUseExpSyncFast(!isUseExpSyncFast)}
            icon={isUseExpSyncFast ? <ArrowRepeatAllFilled /> : <ArrowRepeatAllOffRegular />}
            text={t`快速预览语句`}
          />
          <IconWithTextItem
            onClick={() => updateIsUseRealtimeEffect(!isUseRealtimeEffect)}
            icon={isUseRealtimeEffect ? <LiveIcon /> : <LiveOffFilled />}
            text={t`快速预览效果`}
          />
        </TabItem>
        <TabItem title={t`代码编辑器`}>
          <div className={s.editorSettings}>
            <label className={s.inlineField}>
              <span>{t`字体`}</span>
              <Input
                className={s.fontFamilyInput}
                value={editorFontFamily}
                onChange={(ev) => updateEditorFontFamily(ev.target.value)}
              />
            </label>
            <label className={s.inlineField}>
              <span>{t`字体大小`}</span>
              <Combobox
                className={s.fontSizeInput}
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
            <IconWithTextItem
              onClick={() => updateIsAutoWarp(!isAutoWarp)}
              icon={isAutoWarp ? <ArrowEnterLeftIcon /> : <NavigationIcon />}
              text={isAutoWarp ? t`自动换行` : t`永不换行`}
            />
          </div>
        </TabItem>
        <TabItem title={t`自定义级联选择器分隔符`}>
          <div className={s.cascaderSettings}>
            <IconWithTextItem
              onClick={toggleCascaderDelimiter}
              icon={<Settings20Regular />}
              text={isCascaderDelimitersCustomizable ? t`启用` : t`关闭`}
            />
            {isCascaderDelimitersCustomizable && (
              <div className={s.cascaderPicker}>
                <TagInputPicker
                  onOptionSelect={(options) => updateCascaderDelimiters(options)}
                  selectedOptions={cascaderDelimiters}
                />
              </div>
            )}
          </div>
        </TabItem>
        <TabItem title={t`设置`}>
          <IconWithTextItem
            onClick={() => setSettingsOpen(true)}
            icon={<Settings20Regular />}
            text={t`更多设置`}
          />
        </TabItem>
      </TopbarTab>
      <AppSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
