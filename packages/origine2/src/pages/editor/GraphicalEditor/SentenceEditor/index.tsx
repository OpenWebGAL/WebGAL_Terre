import { commandType, ISentence } from "webgal-parser/src/interface/sceneInterface";
import Say from "./Say";
import { FC, ReactElement } from "react";
import { CommentOne } from "@icon-park/react";

export interface ISentenceEditorProps {
  sentence: ISentence;
  onSubmit: (newSentence: string) => void;
}

interface ISentenceEditorConfig {
  type: commandType,
  title: string,
  initialText: string,
  component: FC<ISentenceEditorProps>,
  icon:ReactElement
}

export const sentenceEditorDefault: ISentenceEditorConfig = {
  type: commandType.say,
  title: "普通对话",
  initialText: "角色:对话;",
  component: Say,
  icon:<CommentOne theme="outline" size="24" fill="#333"/>
};

export const sentenceEditorConfig: ISentenceEditorConfig[] = [
  {
    type: commandType.say,
    title: "普通对话",
    initialText: "角色:对话;",
    component: Say,
    icon:<CommentOne theme="outline" size="24" fill="#333"/>
  }
];
