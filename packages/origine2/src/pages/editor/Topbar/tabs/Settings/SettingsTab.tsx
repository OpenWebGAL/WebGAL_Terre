import s from './settingsTab.module.scss';
import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {
  CommandBar,
  ContextualMenu,
  FontIcon,
  ICommandBarItemProps,
  IContextualMenuItem, TooltipDelay,
  TooltipHost
} from '@fluentui/react';
import {language} from "@/store/statusReducer";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import {useCallback, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/origineStore";
import {setEnableLivePreview, setIsWarp} from "@/store/userDataReducer";
import {useTranslation} from "react-i18next";

export function SettingsTab() {

  const t = useTrans('editor.topBar.');
  const setLanguage = useLanguage();
  const trans = useTranslation();
  const t2 = trans.t;
  const _items: IContextualMenuItem[] =
    [
      {
        key: 'zhCn',
        text: '简体中文',
        onClick() {
          setLanguage(language.zhCn);
        }
      },
      {
        key: 'en',
        text: 'English',
        onClick() {
          setLanguage(language.en);
        }
      },
      {
        key: 'jp',
        text: '日本語',
        onClick() {
          setLanguage(language.jp);
        }
      }
    ];

  const isAutoWarp = useSelector((state:RootState)=>state.userData.isWarp);
  const linkRef = useRef(null);
  const [showContextualMenu, setShowContextualMenu] = useState(false);
  const onShowContextualMenu = () => setShowContextualMenu(!showContextualMenu);
  const onHideContextualMenu = () => setShowContextualMenu(false);
  const dispatch = useDispatch();
  const isEnableLivePreview = useSelector((state: RootState) => state.userData.isEnableLivePreview);
  const tSidebar = useTrans("editor.sideBar.");

  return <TopbarTab>
    <TabItem title={t('commandBar.items.language.text')}>
      <div ref={linkRef}>
        <IconWithTextItem onClick={onShowContextualMenu}
          icon={<FontIcon className={s.iconColor} iconName="LocaleLanguage"/>}
          text={t('commandBar.items.language.text')}/>
      </div>
      <ContextualMenu
        items={_items}
        hidden={!showContextualMenu}
        target={linkRef}
        onItemClick={onHideContextualMenu}
        onDismiss={onHideContextualMenu}
      />
    </TabItem>
    <TabItem title={t2("实时预览")}>
      <TooltipHost
        delay={TooltipDelay.zero}
        content={<div className={s.previewTips}>
          {tSidebar('preview.notice')}
        </div>}
      >
        <IconWithTextItem
          onClick={() => {
            dispatch(setEnableLivePreview(!isEnableLivePreview));
          }}
          icon={<FontIcon iconName={isEnableLivePreview ? "Streaming" : "StreamingOff"} className={s.iconColor}/>}
          text={isEnableLivePreview ? t2('实时预览打开') : t2('实时预览关闭')}
        />
      </TooltipHost>
    </TabItem><TabItem title={t2("代码编辑器")}>
      <IconWithTextItem
        onClick={() => {
          dispatch(setIsWarp(!isAutoWarp));
        }}
        icon={<FontIcon iconName={isAutoWarp ? "ReturnKey" : "GlobalNavButton"} className={s.iconColor}/>}
        text={isAutoWarp ? t2('自动换行') : t2('永不换行')}
      />
    </TabItem>
  </TopbarTab>;
}
