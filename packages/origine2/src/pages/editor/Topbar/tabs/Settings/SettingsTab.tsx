import s from './settingsTab.module.scss';
import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {language} from "@/store/statusReducer";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/origineStore";
import {setEnableLivePreview, setIsWarp} from "@/store/userDataReducer";
import {useTranslation} from "react-i18next";
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

export function SettingsTab() {

  const t = useTrans('editor.topBar.');
  const setLanguage = useLanguage();
  const trans = useTranslation();
  const t2 = trans.t;

  const LocalLanguageIcon = bundleIcon(LocalLanguage24Filled, LocalLanguage24Regular);
  const LiveIcon = bundleIcon(Live24Filled, Live24Regular);
  const LiveOffIcon = bundleIcon(LiveOff24Filled, LiveOff24Regular);
  const ArrowEnterLeftIcon = bundleIcon(ArrowEnterLeft24Filled, ArrowEnterLeft24Regular);
  const NavigationIcon = bundleIcon(Navigation24Filled, Navigation24Regular);

  const isAutoWarp = useSelector((state:RootState)=>state.userData.isWarp);
  const dispatch = useDispatch();
  const isEnableLivePreview = useSelector((state: RootState) => state.userData.isEnableLivePreview);
  const tSidebar = useTrans("editor.sideBar.");

  return <TopbarTab>
    <TabItem title={t('commandBar.items.language.text')}>
      <Menu>
        <MenuTrigger>
          <div>
            <IconWithTextItem
              icon={<LocalLanguageIcon className={s.iconColor} />}
              text={t('commandBar.items.language.text')}
            />
          </div>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem onClick={() => setLanguage(language.zhCn)}>简体中文</MenuItem>
            <MenuItem onClick={() => setLanguage(language.en)}>English</MenuItem>
            <MenuItem onClick={() => setLanguage(language.jp)}>日本语</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </TabItem>
    <TabItem title={t2("实时预览")}>
      <Tooltip
        content={<div className={s.previewTips}>{tSidebar('preview.notice')}</div>}
        relationship="description"
        showDelay={0}
        hideDelay={0}
        withArrow
      >
        <div>
          <IconWithTextItem
            onClick={() => {
              dispatch(setEnableLivePreview(!isEnableLivePreview));
            }}
            icon={ isEnableLivePreview ? <LiveIcon className={s.iconColor}/> : <LiveOffIcon className={s.iconColor}/>}
            text={ isEnableLivePreview ? t2('实时预览打开') : t2('实时预览关闭') }
          />
        </div>
      </Tooltip>
    </TabItem>
    <TabItem title={t2("代码编辑器")}>
      <IconWithTextItem
        onClick={() => {
          dispatch(setIsWarp(!isAutoWarp));
        }}
        icon={ isAutoWarp ? <ArrowEnterLeftIcon className={s.iconColor}/> : <NavigationIcon className={s.iconColor}/>}
        text={ isAutoWarp ? t2('自动换行') : t2('永不换行') }
      />
    </TabItem>
  </TopbarTab>;
}
