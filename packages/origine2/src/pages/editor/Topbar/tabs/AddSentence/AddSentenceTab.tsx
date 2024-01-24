import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import s from './addSentence.module.scss';
import {IconWithTextItemSmall} from "@/pages/editor/Topbar/components/IconWithTextItemSmall";
import {ISentenceEditorConfig, sentenceEditorConfig} from "@/pages/editor/GraphicalEditor/SentenceEditor";
import {cloneElement} from "react";
import {eventBus} from "@/utils/eventBus";
import {useTranslation} from "react-i18next";

function addSentenceText(text: string) {
  console.log(text);
  eventBus.emit('topbar-add-sentence', text);
}

function pickSentenceType(indexes: Array<number>) {
  return indexes.map(index => sentenceEditorConfig[index]).filter(item => item !== undefined).map((e, index) => convertSentenceToNode(e, index));
}

function convertSentenceToNode(sentence: ISentenceEditorConfig, index: number) {
  const iconSmall = cloneElement(sentence.icon, {size: "18px"});
  return <IconWithTextItemSmall key={`sentenceAddSmall${index}`} onClick={() => addSentenceText(sentence.initialText())}
    icon={iconSmall}
    text={sentence.title()}/>;
}

export function AddSentenceTab() {

  const btsCommon1 = pickSentenceType([0, 1, 2]);
  const btsCommon2 = pickSentenceType([4, 5]);
  const btsSpecial = pickSentenceType([8, 12, 13]);
  const btsSpecial2 = pickSentenceType([6, 7, 21]);
  const btsBranch = pickSentenceType([9, 10, 11]);
  const btsExtra = pickSentenceType([14, 15]);
  const btsSystem = pickSentenceType([16, 17]);
  const btsControl = pickSentenceType([3, 19, 20]);
  const {t} = useTranslation();

  return <TopbarTab>
    <TabItem title={t("常规演出")}>
      <div>
        {btsCommon1}
      </div>
      <div>
        {btsCommon2}
      </div>
    </TabItem>
    <TabItem title={t("舞台对象控制")}>
      <div>
        {btsControl}
      </div>
    </TabItem>
    <TabItem title={t("特殊演出")}>
      <div>
        {btsSpecial}
      </div>
      <div>
        {btsSpecial2}
      </div>
    </TabItem>
    <TabItem title={t("场景与分支")}>
      <div>
        {btsBranch}
      </div>
    </TabItem>
    <TabItem title={t("鉴赏")}>
      <div>
        {btsExtra}
      </div>
    </TabItem>
    <TabItem title={t("游戏控制")}>
      <div>
        {btsSystem}
      </div>
    </TabItem>
  </TopbarTab>;
}
