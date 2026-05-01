import s from './settings.module.scss';
import { useEffect, useState } from 'react';
import TagInputPicker from '@/pages/editor/GraphicalEditor/components/TagInputPicker';
import TerreToggle from '@/components/terreToggle/TerreToggle';
import { t } from '@lingui/macro';
import { candidateFontSizes } from './constants';
import { PreviewOpen, PreviewClose } from '@icon-park/react';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Tooltip,
  Input,
  Combobox,
  Option,
  Switch,
} from '@fluentui/react-components';
import {
  ArrowEnterLeftFilled,
  ArrowEnterLeftRegular,
  bundleIcon,
  LiveFilled,
  LiveRegular,
  LiveOffFilled,
  LiveOffRegular,
  LocalLanguageFilled,
  LocalLanguageRegular,
  NavigationFilled,
  NavigationRegular,
} from '@fluentui/react-icons';
import useEditorStore from '@/store/useEditorStore';

// Icon definitions
const LocalLanguageIcon = bundleIcon(LocalLanguageFilled, LocalLanguageRegular);
const LiveIcon = bundleIcon(LiveFilled, LiveRegular);
const LiveOffIcon = bundleIcon(LiveOffFilled, LiveOffRegular);
const ArrowEnterLeftIcon = bundleIcon(ArrowEnterLeftFilled, ArrowEnterLeftRegular);
const NavigationIcon = bundleIcon(NavigationFilled, NavigationRegular);

export default function SettingPage() {
  const updateLanguage = useEditorStore.use.updateLanguage();
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
  const editorFontFamily = useEditorStore.use.editorFontFamily();
  const editorFontSize = useEditorStore.use.editorFontSize();
  const updateEditorFontFamily = useEditorStore.use.updateEditorFontFamily();
  const updateEditorFontSize = useEditorStore.use.updateEditorFontSize();
  const isCascaderDelimitersCustomizable = useEditorStore.use.isCascaderDelimitersCustomizable();
  const updateIsCascaderDelimitersCustomizable = useEditorStore.use.updateIsCascaderDelimitersCustomizable();
  const cascaderDelimiters = useEditorStore.use.cascaderDelimiters();
  const updateCascaderDelimiters = useEditorStore.use.updateCascaderDelimiters();
  const [tempFontSize, setTempFontSize] = useState(editorFontSize.toString());

  useEffect(() => {
    const testValue = Number.parseFloat(tempFontSize);
    if (!isNaN(testValue)) {
      updateEditorFontSize(testValue);
    }
  }, [tempFontSize, updateEditorFontSize]);

  return (
    <div className={s.settingPage}>
      <div className={s.settingsTabs}>
        {/* Common Settings */}
        <div className={s.tabItem}>
          <div className={s.tabTitle}>{t`通用设置`}</div>
        </div>
        <div className={s.tabItem}>
          <div className={s.settingRow}>
            <div className={s.settingIcon}>
              <LocalLanguageIcon className={s.iconColor} />
            </div>
            <div className={s.settingText}>{t`语言`}</div>
            <div className={s.settingControl}>
              <Menu>
                <MenuTrigger>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{t`语言`}</span>
                  </button>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem onClick={() => updateLanguage('zhCn')}>简体中文</MenuItem>
                    <MenuItem onClick={() => updateLanguage('en')}>English</MenuItem>
                    <MenuItem onClick={() => updateLanguage('ja')}>日本語</MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </div>
          </div>
        </div>

        {/* Preview Setting */}
        <div className={s.tabItem}>
          <div className={s.settingRow}>
            <div className={s.settingIcon}>
              {isShowPreview ? <PreviewOpen className={s.iconColor} /> : <PreviewClose className={s.iconColor} />}
            </div>
            <div className={s.settingText}>{isShowPreview ? t`显示预览窗口` : t`关闭预览窗口`}</div>
            <div className={s.settingControl}>
              <Switch checked={isShowPreview} onChange={() => updateIsShowPreview(!isShowPreview)} />
            </div>
          </div>
        </div>
        <div className={s.tabItem}>
          <div className={s.settingRow}>
            <div className={s.settingIcon}>
              {isEnableLivePreview ? <LiveIcon className={s.iconColor} /> : <LiveOffIcon className={s.iconColor} />}
            </div>
            <div className={s.settingText}>{isEnableLivePreview ? t`实时预览打开` : t`实时预览关闭`}</div>
            <div className={s.settingControl}>
              <Tooltip
                content={
                  <div className={s.previewTips}>
                    {t`实时预览将游戏快进至编辑语句，但有限制。先前场景的语句效果，如变量，不会反映在预览中。`}
                  </div>
                }
                relationship="description"
                showDelay={0}
                hideDelay={0}
              >
                <Switch
                  checked={isEnableLivePreview}
                  onChange={() => updateIsEnableLivePreview(!isEnableLivePreview)}
                />
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Preview Performance Settings */}
        <div className={s.tabItem}>
          <div className={s.settingRow}>
            <div className={s.settingText}>{t`快速预览语句`}</div>
            <div className={s.settingControl}>
              <Tooltip
                content={<div className={s.previewTips}>{t`该功能将大幅提升实时预览效率，但可能出现异常。`}</div>}
                relationship="description"
                showDelay={0}
                hideDelay={0}
              >
                <Switch
                  label={t`快速预览语句`}
                  labelPosition="after"
                  checked={isUseExpSyncFast}
                  onChange={() => updateIsUseExpSyncFast(!isUseExpSyncFast)}
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className={s.tabItem}>
          <div className={s.settingRow}>
            <div className={s.settingText}>{t`快速预览效果`}</div>
            <div className={s.settingControl}>
              <Switch
                label={t`快速预览效果`}
                labelPosition="after"
                checked={isUseRealtimeEffect}
                onChange={() => updateIsUseRealtimeEffect(!isUseRealtimeEffect)}
              />
            </div>
          </div>
        </div>

        {/* Font Settings */}
        <div className={s.tabItem}>
          <div className={s.tabTitle}>{t`字体设置`}</div>
          <div className={s.settingRow}>
            <div className={s.settingText}>{t`字体`}</div>
            <div className={s.settingControl}>
              <Input
                className={`${s.fontFamilyInput}`}
                value={editorFontFamily}
                onChange={(ev) => updateEditorFontFamily(ev.target.value)}
              />
            </div>
          </div>
        </div>
        <div className={s.tabItem}>
          <div className={s.settingRow}>
            <div className={s.settingText}>{t`字体大小`}</div>
            <div className={s.settingControl}>
              <Combobox
                freeform
                style={{ minWidth: 'unset' }}
                input={{ style: { width: '40px' } }}
                value={tempFontSize}
                onChange={(ev) => setTempFontSize(ev.target.value)}
                onOptionSelect={(_, data) => setTempFontSize(data.optionValue ?? '')}
              >
                {candidateFontSizes.map((option) => (
                  <Option key={option}>{option.toString()}</Option>
                ))}
              </Combobox>
            </div>
          </div>
        </div>
        <div className={s.tabItem}>
          <div className={s.settingRow}>
            <div className={s.settingIcon}>
              {isAutoWarp ? <ArrowEnterLeftIcon className={s.iconColor} /> : <NavigationIcon className={s.iconColor} />}
            </div>
            <div className={s.settingText}>{isAutoWarp ? t`自动换行` : t`永不换行`}</div>
            <div className={s.settingControl}>
              <Switch checked={isAutoWarp} onChange={() => updateIsAutoWarp(!isAutoWarp)} />
            </div>
          </div>
        </div>

        {/* Delimiter Settings */}
        <div className={s.tabItem}>
          <div className={s.settingRow}>
            <div className={s.settingText}>{t`是否自定义分隔符`}</div>
            <div className={s.settingControl}>
              <TerreToggle
                title={t`是否自定义分隔符`}
                onChange={() => {
                  const next = !isCascaderDelimitersCustomizable;
                  updateIsCascaderDelimitersCustomizable(next);
                  if (!next) {
                    updateCascaderDelimiters(['/']);
                  }
                }}
                onText={t`启用`}
                offText={t`关闭`}
                isChecked={isCascaderDelimitersCustomizable}
              />
            </div>
          </div>
        </div>
        {isCascaderDelimitersCustomizable && (
          <div className={s.tabItem}>
            <div className={s.settingRow}>
              <div className={s.settingIcon} />
              <div className={s.settingText}>{t`分隔符`}</div>
              <div className={s.settingControl}>
                <TagInputPicker
                  onOptionSelect={(options) => {
                    updateCascaderDelimiters(options);
                  }}
                  selectedOptions={cascaderDelimiters}
                />
              </div>
            </div>
          </div>
        )}
        {isCascaderDelimitersCustomizable && (
          <div className={s.tabItem}>
            <div className={s.settingText} style={{ padding: '0 12px', fontSize: 'smaller', color: 'var(--primary)' }}>
              {t`点击或按退格键以删除旧的分隔符，输入新的分隔符后请按回车键确认。`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
