import { commandType, ISentence } from "webgal-parser/src/interface/sceneInterface";
import Say from "./Say";
import { FC, ReactElement } from "react";
import {
  Acoustic,
  AddMusic,
  AddPicture,
  AlignLeftTwo,
  AlignTextBottomOne,
  AutoWidth,
  Avatar,
  Code,
  CommentOne,
  Effects,
  Erase,
  Logout,
  Music,
  NewPicture,
  People,
  VideoTwo
} from "@icon-park/react";
import ChangeBg from "./ChangeBg";
import ChangeFigure from "./ChangeFigure";
import Bgm from "./Bgm";
import PlayVideo from "./PlayVideo";
import Unrecognized from "./Unrecognized";
import PixiPerform from "./PixiPerform";
import Intro from "./Intro";
import End from "./End";
import MiniAvatar from "./MiniAvatar";
import Comment from "./Comment";
import PlayEffect from "./PlayEffect";
import SetTextbox from "./SetTextbox";
import UnlockExtra from "./UnlockExtra";
import SetAnimation from "./SetAnimation";
import ChangeCallScene from "./ChangeCallScene";

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
    type: commandType.setAnimation,
    title: "设置动画",
    initialText: "setAnimation:选择动画文件;",
    component: SetAnimation,
    icon:<AutoWidth theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
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
  {
    type: commandType.pixi,
    title: "使用特效",
    initialText: "pixiPerform:snow;",
    component: PixiPerform,
    icon:<Effects theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.pixiInit,
    title: "清除特效",
    initialText: "pixiInit;",
    component: PixiPerform,
    icon:<Erase theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.intro,
    title: "黑屏文字",
    initialText: "intro:;",
    component: Intro,
    icon:<AlignLeftTwo theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.callScene,
    title: "调用场景",
    initialText: "callScene:选择场景文件;",
    component: ChangeCallScene,
    icon:<AutoWidth theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.changeScene,
    title: "切换场景",
    initialText: "changeScene:选择场景文件;",
    component: ChangeCallScene,
    icon:<AutoWidth theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.miniAvatar,
    title: "角落头像",
    initialText: "miniAvatar:选择小头像;",
    component: MiniAvatar,
    icon:<Avatar theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.playEffect,
    title: "效果声音",
    initialText: "playEffect:;",
    component: PlayEffect,
    icon:<Acoustic theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.unlockCg,
    title: "鉴赏图片",
    initialText: "unlockCg:;",
    component: UnlockExtra,
    icon:<AddPicture theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.unlockBgm,
    title: "鉴赏音乐",
    initialText: "unlockBgm:;",
    component: UnlockExtra,
    icon:<AddMusic theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.setTextbox,
    title: "文本显示",
    initialText: "setTextbox:hide;",
    component: SetTextbox,
    icon:<AlignTextBottomOne theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.end,
    title: "结束游戏",
    initialText: "end;",
    component: End,
    icon:<Logout theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
  {
    type: commandType.comment,
    title: "单行注释",
    initialText: ";注释",
    component: Comment,
    icon:<Code theme="multi-color" size="24" fill={['#333' ,'#2F88FF' ,'#FFF' ,'#43CCF8']}/>
  },
];
