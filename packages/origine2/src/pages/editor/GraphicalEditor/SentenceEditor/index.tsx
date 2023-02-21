import { commandType, ISentence } from "webgal-parser/src/interface/sceneInterface";
import Say from "./Say";
import { FC } from "react";

export interface ISentenceEditorProps {
  sentence: ISentence;
  onSubmit: (newSentence: string) => void;
}

interface ISentenceEditorConfig {
  type: commandType,
  title: string,
  initialText: string,
  component: FC<ISentenceEditorProps>
}

export const sentenceEditorDefault: ISentenceEditorConfig = {
  type: commandType.say,
  title: "普通对话",
  initialText: "角色:对话;",
  component: Say
};

export const sentenceEditorConfig: ISentenceEditorConfig[] = [
  {
    type: commandType.say,
    title: "普通对话",
    initialText: "角色:对话;",
    component: Say
  }
];
