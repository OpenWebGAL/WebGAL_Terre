import s from './settingsTab.module.scss';
import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import { TabItem } from "@/pages/editor/Topbar/components/TabItem";
import { IconWithTextItem } from "@/pages/editor/Topbar/components/IconWithTextItem";
import {
  ArrowEnterLeftFilled,
  ArrowEnterLeftRegular,
  ArrowRepeatAllFilled,
  ArrowRepeatAllOffRegular,
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
import { Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, Tooltip, Input, Combobox, Option } from '@fluentui/react-components';
import useEditorStore from '@/store/useEditorStore';
import { t } from '@lingui/macro';
import { candidateFontSizes } from './constants';
import { useEffect, useState } from 'react';

export function SettingsTab() {

  const updateLanguage = useEditorStore.use.updateLanguage();

  const LocalLanguageIcon = bundleIcon(LocalLanguageFilled, LocalLanguageRegular);
  const LiveIcon = bundleIcon(LiveFilled, LiveRegular);
  const LiveOffIcon = bundleIcon(LiveOffFilled, LiveOffRegular);
  const ArrowEnterLeftIcon = bundleIcon(ArrowEnterLeftFilled, ArrowEnterLeftRegular);
  const NavigationIcon = bundleIcon(NavigationFilled, NavigationRegular);

  const isAutoWarp = useEditorStore.use.isAutoWarp();
  const isEnableLivePreview = useEditorStore.use.isEnableLivePreview();
  const updateIsEnableLivePreview = useEditorStore.use.updateIsEnableLivePreview();
  const updateIsAutoWarp = useEditorStore.use.updateIsAutoWarp();
  const isUseExpSyncFast = useEditorStore.use.isUseExpFastSync();
  const updateIsUseExpSyncFast = useEditorStore.use.updateIsUseExpFastSync();

  const editorFontFamily = useEditorStore.use.editorFontFamily();
  const editorFontSize = useEditorStore.use.editorFontSize();
  const updateEditorFontFamily = useEditorStore.use.updateEditorFontFamily();
  const updateEditorFontSize = useEditorStore.use.updateEditorFontSize();

  const [tempFontSize, setTempFontSize] = useState(editorFontSize.toString());

  useEffect(() => {
    const testValue = Number.parseFloat(tempFontSize);
    if (!isNaN(testValue)) {
      updateEditorFontSize(testValue);
    }
  }, [tempFontSize]);

  return <TopbarTab>
    <TabItem title={t`语言`}>
      <Menu>
        <MenuTrigger>
          <div>
            <IconWithTextItem
              icon={<LocalLanguageIcon className={s.iconColor} />}
              text={t`语言`}
            />
          </div>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem onClick={() => updateLanguage('zhCn')}>简体中文</MenuItem>
            <MenuItem onClick={() => updateLanguage('en')}>English</MenuItem>
            <MenuItem onClick={() => updateLanguage('ja')}>日本语</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </TabItem>
    <TabItem title={t`实时预览`}>
      <Tooltip
        content={<div
          className={s.previewTips}>{t`实时预览将游戏快进至编辑语句，但有限制。先前场景的语句效果，如变量，不会反映在预览中。`}</div>}
        relationship="description"
        showDelay={0}
        hideDelay={0}
      >
        <div>
          <IconWithTextItem
            onClick={() => {
              updateIsEnableLivePreview(!isEnableLivePreview);
            }}
            icon={isEnableLivePreview ? <LiveIcon className={s.iconColor} /> : <LiveOffIcon className={s.iconColor} />}
            text={isEnableLivePreview ? t`实时预览打开` : t`实时预览关闭`}
          />
        </div>
      </Tooltip>
    </TabItem>
    <TabItem title={t`代码编辑器`}>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginLeft: 10 }}>
          <div className={s.prompt}>{t`字体`}</div>
          <Input className={s.fontFamilyInput}
            value={editorFontFamily}
            onChange={(ev) => updateEditorFontFamily(ev.target.value)} />
        </div>
        <div style={{ marginRight: 10 }}>
          <div className={s.prompt}>{t`字体大小`}</div>
          <Combobox freeform
            style={{ minWidth: 'unset' }}
            input={{ style: { width: '40px' } }}
            value={tempFontSize}
            onChange={(ev) => setTempFontSize(ev.target.value)}
            onOptionSelect={(_, data) => setTempFontSize(data.optionValue ?? '')}>
            {candidateFontSizes.map((option) => (
              <Option key={option}>{option.toString()}</Option>
            ))}
          </Combobox>
        </div>
        <IconWithTextItem
          onClick={() => {
            updateIsAutoWarp(!isAutoWarp);
          }}
          icon={isAutoWarp ? <ArrowEnterLeftIcon className={s.iconColor} /> : <NavigationIcon className={s.iconColor} />}
          text={isAutoWarp ? t`自动换行` : t`永不换行`}
        />
      </div>
    </TabItem>
    <TabItem title={t`实验性快速预览`}>
      <IconWithTextItem
        onClick={() => {
          updateIsUseExpSyncFast(!isUseExpSyncFast);
        }}
        icon={isUseExpSyncFast ? <ArrowRepeatAllFilled className={s.iconColor} /> : <ArrowRepeatAllOffRegular className={s.iconColor} />}
        text={isUseExpSyncFast ? t`启用` : t`关闭`}
      />
      {isUseExpSyncFast && <div className={s.tips}>
        {t`你已启用实验性快速预览，该功能将大幅提升实时预览效率，但可能出现异常。特别提示：不要在上一次实时预览跳转还没有完全结束时（尤其是有动画没有结束时）再次跳转。`}
      </div>}
    </TabItem>
  </TopbarTab>;
}
