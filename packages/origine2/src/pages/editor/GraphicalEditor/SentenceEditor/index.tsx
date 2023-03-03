import { commandType, ISentence } from "webgal-parser/src/interface/sceneInterface";
import Say from "./Say";
import { FC, ReactElement } from "react";
import { CommentOne, Music, NewPicture, People, VideoTwo } from "@icon-park/react";
import ChangeBg from "./ChangeBg";
import ChangeFigure from "./ChangeFigure";
import Bgm from "./Bgm";
import PlayVideo from "./PlayVideo";
import Unrecognized from "./Unrecognized";

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
  title: "未识别",
  initialText: "",
  component: Unrecognized,
  icon:<CommentOne theme="outline" size="24" fill="#333"/>
};

export const sentenceEditorConfig: ISentenceEditorConfig[] = [
  {
    type: commandType.say,
    title: "普通对话",
    initialText: "角色名，留空以继承上句:对话;",
    component: Say,
    icon:<CommentOne theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.changeBg,
    title: "切换背景",
    initialText: "changeBg:选择背景图片;",
    component: ChangeBg,
    icon:<NewPicture theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.changeFigure,
    title: "切换立绘",
    initialText: "changeFigure:选择立绘文件;",
    component: ChangeFigure,
    icon:<People theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.bgm,
    title: "背景音乐",
    initialText: "bgm:选择背景音乐;",
    component: Bgm,
    icon:<Music theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.video,
    title: "播放视频",
    initialText: "playVideo:选择视频文件;",
    component: PlayVideo,
    icon:<VideoTwo theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
];
