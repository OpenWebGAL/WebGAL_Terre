import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {IconWithTextItemSmall} from "@/pages/editor/Topbar/components/IconWithTextItemSmall";
import {ISentenceEditorConfig, sentenceEditorConfig} from "@/pages/editor/GraphicalEditor/SentenceEditor";
import {cloneElement} from "react";
import {eventBus} from "@/utils/eventBus";
import {t} from "@lingui/macro";
import {commandType} from "webgal-parser/src/interface/sceneInterface";

function addSentenceText(text: string) {
  eventBus.emit('editor:topbar-add-sentence', { sentence: text });
}

function pickSentenceType(types: Array<commandType>) {
  return types
    .map(type => sentenceEditorConfig.find(item => item.type === type))
    .filter((item): item is ISentenceEditorConfig => item !== undefined)
    .map(convertSentenceToNode);
}

function convertSentenceToNode(sentence: ISentenceEditorConfig) {
  const iconSmall = cloneElement(sentence.icon, {size: "18px"});
  return <IconWithTextItemSmall key={`sentenceAddSmall${sentence.type}`} onClick={() => addSentenceText(sentence.initialText())}
    icon={iconSmall}
    text={sentence.title()}/>;
}

export function AddSentenceTab() {

  const btsCommon1 = pickSentenceType([commandType.say, commandType.changeBg, commandType.changeFigure]);
  const btsCommon2 = pickSentenceType([commandType.bgm, commandType.video, commandType.playEffect]);
  const btsControl = pickSentenceType([commandType.setAnimation, commandType.setComplexAnimation, commandType.setTransform]);
  const btsControl2 = pickSentenceType([commandType.setTempAnimation, commandType.setTransition]);
  const btsSpecial = pickSentenceType([commandType.pixi, commandType.pixiInit, commandType.intro]);
  const btsSpecial2 = pickSentenceType([commandType.miniAvatar, commandType.setTextbox, commandType.filmMode]);
  const btsBranch = pickSentenceType([commandType.callScene, commandType.changeScene, commandType.choose]);
  const btsBranch2 = pickSentenceType([commandType.label, commandType.jumpLabel]);
  const btsExtra = pickSentenceType([commandType.unlockCg, commandType.unlockBgm]);
  const btsSystem = pickSentenceType([commandType.getUserInput, commandType.setVar, commandType.showVars]);
  const btsSystem2 = pickSentenceType([commandType.wait, commandType.applyStyle, commandType.callSteam]);
  const btsSystem3 = pickSentenceType([commandType.end]);

  return <TopbarTab>
    <TabItem title={t`常规演出`}>
      <div>
        {btsCommon1}
      </div>
      <div>
        {btsCommon2}
      </div>
    </TabItem>
    <TabItem title={t`舞台对象控制`}>
      <div>
        {btsControl}
      </div>
      <div>
        {btsControl2}
      </div>
    </TabItem>
    <TabItem title={t`特殊演出`}>
      <div>
        {btsSpecial}
      </div>
      <div>
        {btsSpecial2}
      </div>
    </TabItem>
    <TabItem title={t`场景与分支`}>
      <div>
        {btsBranch}
      </div>
      <div>
        {btsBranch2}
      </div>
    </TabItem>
    <TabItem title={t`鉴赏`}>
      <div>
        {btsExtra}
      </div>
    </TabItem>
    <TabItem title={t`游戏控制`}>
      <div>
        {btsSystem}
      </div>
      <div>
        {btsSystem2}
      </div>
      <div>
        {btsSystem3}
      </div>
    </TabItem>
  </TopbarTab>;
}
