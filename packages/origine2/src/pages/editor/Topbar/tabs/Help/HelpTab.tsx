import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import {FontIcon} from "@fluentui/react";
import s from './help.module.scss';
import {useTranslation} from "react-i18next";

export function HelpTab() {
  const {t} = useTranslation();
  return <TopbarTab>
    <TabItem title={t("帮助")}>
      <IconWithTextItem onClick={()=>window.open("https://docs.openwebgal.com/", "_blank")} icon={<FontIcon aria-label="Help" iconName="Help" className={s.helpIconColor}/>} text={t("帮助")}/>
    </TabItem>
  </TopbarTab>;
}
