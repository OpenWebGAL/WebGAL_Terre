import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import {FontIcon} from "@fluentui/react";
import s from './help.module.scss';

export function HelpTab() {
  return <TopbarTab>
    <TabItem title="帮助">
      <IconWithTextItem onClick={()=>window.open("https://docs.openwebgal.com/", "_blank")} icon={<FontIcon aria-label="Help" iconName="Help" className={s.helpIconColor}/>} text="帮助"/>
    </TabItem>
  </TopbarTab>;
}
