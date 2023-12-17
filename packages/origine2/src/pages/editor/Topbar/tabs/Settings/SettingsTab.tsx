import s from './settingsTab.module.scss';
import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {CommandBar, ContextualMenu, FontIcon, ICommandBarItemProps, IContextualMenuItem} from '@fluentui/react';
import {language} from "@/store/statusReducer";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import {useCallback, useRef, useState} from "react";

export function SettingsTab() {

  const t = useTrans('editor.topBar.');
  const setLanguage = useLanguage();
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

  const linkRef = useRef(null);
  const [showContextualMenu, setShowContextualMenu] = useState(false);
  const onShowContextualMenu = () => setShowContextualMenu(!showContextualMenu);
  const onHideContextualMenu = () => setShowContextualMenu(false);

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
  </TopbarTab>;
}
