import { useEffect, useState, useMemo } from 'react';
import s from './settings.module.scss';
import TagInputPicker from '@/pages/editor/GraphicalEditor/components/TagInputPicker';
import TerreToggle from '@/components/terreToggle/TerreToggle';
import { t } from '@lingui/macro';
import { candidateFontSizes } from './constants';
import { PreviewOpen, PreviewClose } from '@icon-park/react';
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
  SettingsFilled,
  SettingsRegular,
} from '@fluentui/react-icons';
import useEditorStore from '@/store/useEditorStore';
import type { SettingCategory } from './constants';
import { SettingPageContent } from './SettingCategoryRenderer';

const LocalLanguageIcon = bundleIcon(LocalLanguageFilled, LocalLanguageRegular);
const LiveIcon = bundleIcon(LiveFilled, LiveRegular);
const LiveOffIcon = bundleIcon(LiveOffFilled, LiveOffRegular);
const ArrowEnterLeftIcon = bundleIcon(ArrowEnterLeftFilled, ArrowEnterLeftRegular);
const NavigationIcon = bundleIcon(NavigationFilled, NavigationRegular);
const SettingsIcon = bundleIcon(SettingsFilled, SettingsRegular);

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
  const currentLanguage = useEditorStore.use.language();
  const updateCascaderDelimiters = useEditorStore.use.updateCascaderDelimiters();
  const isDarkMode = useEditorStore.use.isDarkMode();
  const updateIsDarkMode = useEditorStore.use.updateIsDarkMode();
  const [tempFontSize, setTempFontSize] = useState(editorFontSize.toString());

  const languagesDefine = [
    { label: t`简体中文`, value: 'zhCn' },
    { label: t`英语`, value: 'en' },
    { label: t`日语`, value: 'ja' },
  ];

  const settingsCategories = useMemo((): SettingCategory[] => {
    const cat: SettingCategory[] = [
      {
        key: 'common',
        title: t`通用设置`,
        order: 1,
        options: [
          {
            key: 'language',
            type: 'select',
            label: t`语言`,
            icon: <LocalLanguageIcon className={s.iconColor} />,
            value: languagesDefine.find((v) => v.value === currentLanguage)!.label,
            options: languagesDefine,
            onChange: updateLanguage as (value: string) => void,
          },
          {
            key: 'theme',
            type: 'select',
            label: t`主题`,
            icon: <SettingsIcon className={s.iconColor} />,
            value: isDarkMode ? t`深色` : t`浅色`,
            options: [
              { label: t`浅色`, value: 'light' },
              { label: t`深色`, value: 'dark' },
            ],
            onChange: (value: string) => updateIsDarkMode(value === 'dark'),
          },
        ],
      },
      {
        key: 'preview',
        title: t`预览设置`,
        order: 2,
        options: [
          {
            key: 'showPreview',
            type: 'switch',
            label: isShowPreview ? t`显示预览窗口` : t`关闭预览窗口`,
            icon: isShowPreview ? <PreviewOpen className={s.iconColor} /> : <PreviewClose className={s.iconColor} />,
            checked: isShowPreview,
            onChange: (checked: boolean) => updateIsShowPreview(checked),
          },
          {
            key: 'enableLivePreview',
            type: 'switch',
            label: isEnableLivePreview ? t`实时预览打开` : t`实时预览关闭`,
            icon: isEnableLivePreview ? <LiveIcon className={s.iconColor} /> : <LiveOffIcon className={s.iconColor} />,
            checked: isEnableLivePreview,
            description: t`实时预览将游戏快进至编辑语句，但有限制。先前场景的语句效果，如变量，不会反映在预览中。`,
            onChange: (checked: boolean) => updateIsEnableLivePreview(checked),
          },
        ],
      },
      {
        key: 'previewPerformance',
        title: t`预览性能`,
        order: 3,
        options: [
          {
            key: 'useExpSyncFast',
            type: 'switch',
            label: t`快速预览语句`,
            description: t`该功能将大幅提升实时预览效率，但可能出现异常。`,
            checked: isUseExpSyncFast,
            onChange: (checked: boolean) => updateIsUseExpSyncFast(checked),
          },
          {
            key: 'useRealtimeEffect',
            type: 'switch',
            label: t`快速预览效果`,
            checked: isUseRealtimeEffect,
            onChange: (checked: boolean) => updateIsUseRealtimeEffect(checked),
          },
        ],
      },
      {
        key: 'font',
        title: t`字体设置`,
        order: 4,
        options: [
          {
            key: 'fontFamily',
            type: 'input',
            label: t`字体`,
            value: editorFontFamily,
            onChange: (value) => updateEditorFontFamily(value),
          },
          {
            key: 'fontSize',
            type: 'combo',
            label: t`字体大小`,
            value: tempFontSize,
            options: candidateFontSizes.map((s) => s.toString()),
            onChange: (value) => setTempFontSize(value),
          },
        ],
      },
      {
        key: 'lineWrap',
        title: t`换行设置`,
        order: 5,
        options: [
          {
            key: 'autoWarp',
            type: 'switch',
            label: isAutoWarp ? t`自动换行` : t`永不换行`,
            icon: isAutoWarp ? (
              <ArrowEnterLeftIcon className={s.iconColor} />
            ) : (
              <NavigationIcon className={s.iconColor} />
            ),
            checked: isAutoWarp,
            onChange: () => updateIsAutoWarp(!isAutoWarp),
          },
        ],
      },
      {
        key: 'delimiter',
        title: t`分隔符设置`,
        order: 6,
        options: [
          {
            key: 'toggleDelimitersCustomizable',
            type: 'custom',
            render: () => (
              <div className={s.settingRow} key="toggleDelimitersCustomizable">
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
            ),
          },
          ...(isCascaderDelimitersCustomizable
            ? [
                {
                  key: 'cascaderDelimiters',
                  type: 'custom',
                  render: () => (
                    <div className={s.settingRow} key="cascaderDelimiters">
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
                  ),
                } as const,
                {
                  key: 'delimiterTips',
                  type: 'custom',
                  render: () => (
                    <div className={s.tabItem} key="delimiterTips">
                      <div
                        className={s.settingText}
                        style={{ padding: '0 12px', fontSize: 'smaller', color: 'var(--primary)' }}
                      >
                        {t`点击或按退格键以删除旧的分隔符，输入新的分隔符后请按回车键确认。`}
                      </div>
                    </div>
                  ),
                } as const,
            ]
            : []),
        ],
      },
    ];
    return cat;
  }, [
    languagesDefine,
    isDarkMode,
    isShowPreview,
    isEnableLivePreview,
    isUseExpSyncFast,
    isUseRealtimeEffect,
    editorFontFamily,
    tempFontSize,
    isAutoWarp,
    isCascaderDelimitersCustomizable,
    cascaderDelimiters,
  ]);

  useEffect(() => {
    const testValue = Number.parseFloat(tempFontSize);
    if (!isNaN(testValue)) {
      updateEditorFontSize(testValue);
    }
  }, [tempFontSize, updateEditorFontSize]);

  return (
    <div className={s.settingPage}>
      <SettingPageContent categories={settingsCategories} />
    </div>
  );
}
