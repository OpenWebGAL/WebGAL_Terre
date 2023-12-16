import s from './settingsTab.module.scss';
import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {CommandBar, ICommandBarItemProps } from '@fluentui/react';
import {language} from "@/store/statusReducer";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";

export function SettingsTab(){

  const t = useTrans('editor.topBar.');
  const setLanguage = useLanguage();
  const _items: ICommandBarItemProps[] = [
    {
      key: "language",
      text: t('commandBar.items.language.text'),
      cacheKey: 'language',
      iconProps: {iconName: 'LocaleLanguage'},
      subMenuProps: {
        items: [
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
        ]
      }
    },];


  return <TopbarTab>
    <TabItem title={t('commandBar.items.language.text')}>
      <CommandBar
        onReduceData={()=>undefined}
        items={_items}
        ariaLabel="Inbox actions"
        primaryGroupAriaLabel="Email actions"
        farItemsGroupAriaLabel="More actions"
      />
    </TabItem>
  </TopbarTab>;
}
