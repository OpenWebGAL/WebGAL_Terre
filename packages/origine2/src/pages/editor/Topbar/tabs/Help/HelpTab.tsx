import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import s from './help.module.scss';
import { Question24Filled, Question24Regular, bundleIcon } from "@fluentui/react-icons";
import { t } from "@lingui/macro";

export function HelpTab() {
  const QuestionIcon = bundleIcon(Question24Filled, Question24Regular);

  return <TopbarTab>
    <TabItem title={t`帮助`}>
      <IconWithTextItem
        onClick={()=>window.open("https://docs.openwebgal.com/", "_blank")}
        icon={<QuestionIcon aria-label="Help" className={s.helpIconColor}/>} text={t`帮助`}
      />
    </TabItem>
  </TopbarTab>;
}
