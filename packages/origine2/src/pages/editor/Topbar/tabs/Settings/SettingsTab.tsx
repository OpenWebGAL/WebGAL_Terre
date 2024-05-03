import s from './settingsTab.module.scss';
import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import {
  ArrowEnterLeft24Filled,
  ArrowEnterLeft24Regular,
  bundleIcon,
  Live24Filled,
  Live24Regular,
  LiveOff24Filled,
  LiveOff24Regular,
  LocalLanguage24Filled,
  LocalLanguage24Regular,
  Navigation24Filled,
  Navigation24Regular,
} from '@fluentui/react-icons';
import { Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, Tooltip } from '@fluentui/react-components';
import useEditorStore from '@/store/useEditorStore';
import { t } from '@lingui/macro';

export function SettingsTab() {

  const updateLanguage = useEditorStore.use.updateLanguage();

  const LocalLanguageIcon = bundleIcon(LocalLanguage24Filled, LocalLanguage24Regular);
  const LiveIcon = bundleIcon(Live24Filled, Live24Regular);
  const LiveOffIcon = bundleIcon(LiveOff24Filled, LiveOff24Regular);
  const ArrowEnterLeftIcon = bundleIcon(ArrowEnterLeft24Filled, ArrowEnterLeft24Regular);
  const NavigationIcon = bundleIcon(Navigation24Filled, Navigation24Regular);

  const isAutoWarp = useEditorStore.use.isAutoWarp();
  const isEnableLivePreview = useEditorStore.use.isEnableLivePreview();
  const updateIsEnableLivePreview = useEditorStore.use.updateIsEnableLivePreview();
  const updateIsAutoWarp = useEditorStore.use.updateIsAutoWarp();

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
        content={<div className={s.previewTips}>{t`实时预览将游戏快进至编辑语句，但有限制。先前场景的语句效果，如变量，不会反映在预览中。`}</div>}
        relationship="description"
        showDelay={0}
        hideDelay={0}
        withArrow
      >
        <div>
          <IconWithTextItem
            onClick={() => {
              updateIsEnableLivePreview(!isEnableLivePreview);
            }}
            icon={ isEnableLivePreview ? <LiveIcon className={s.iconColor}/> : <LiveOffIcon className={s.iconColor}/>}
            text={ isEnableLivePreview ? t`实时预览打开` : t`实时预览关闭` }
          />
        </div>
      </Tooltip>
    </TabItem>
    <TabItem title={t`代码编辑器`}>
      <IconWithTextItem
        onClick={() => {
          updateIsAutoWarp(!isAutoWarp);
        }}
        icon={ isAutoWarp ? <ArrowEnterLeftIcon className={s.iconColor}/> : <NavigationIcon className={s.iconColor}/>}
        text={ isAutoWarp ? t`自动换行` : t`永不换行` }
      />
    </TabItem>
  </TopbarTab>;
}
