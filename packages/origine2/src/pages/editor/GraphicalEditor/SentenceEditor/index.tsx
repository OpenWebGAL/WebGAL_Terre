import { commandType, ISentence } from "webgal-parser/src/interface/sceneInterface";
import Say from "./Say";

export interface ISentenceEditorProps {
  sentence: ISentence;
  onSubmit: (newSentence: string) => void;
}

export const sentenceEditorConfig = [
  {
    type: commandType.say,
    title:'普通对话',
    initialText: "角色:对话;",
    component: Say
  }
];
