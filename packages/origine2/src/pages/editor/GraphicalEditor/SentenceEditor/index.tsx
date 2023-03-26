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
  CornerRightUp,
  Effects,
  Erase,
  ListCheckbox,
  Logout,
  Music,
  NewPicture,
  People,
  SwitchThemes,
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
import Choose from "./Choose";

export interface ISentenceEditorProps {
  sentence: ISentence;
  onSubmit: (newSentence: string) => void;
}

interface ISentenceEditorConfig {
  type: commandType,
  title: string,
  initialText: string,
  component: FC<ISentenceEditorProps>,
  icon: ReactElement,
  descText: string,
}

export const sentenceEditorDefault: ISentenceEditorConfig = {
  type: commandType.say,
  title: "未识别",
  initialText: "",
  component: Unrecognized,
  icon: <CommentOne theme="outline" size="24" fill="#333" />,
  descText: ""
};

export const sentenceEditorConfig: ISentenceEditorConfig[] = [
  {
    type: commandType.say,
    title: "普通对话",
    initialText: "角色名，留空以继承上句:对话;",
    component: Say,
    icon: <CommentOne theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'添加一句对话，可以附带语音'
  },
  {
    type: commandType.changeBg,
    title: "切换背景",
    initialText: "changeBg:选择背景图片;",
    component: ChangeBg,
    icon: <NewPicture theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'切换背景图片'
  },
  {
    type: commandType.changeFigure,
    title: "切换立绘",
    initialText: "changeFigure:选择立绘文件;",
    component: ChangeFigure,
    icon: <People theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'添加或切换指定位置的立绘'
  },
  {
    type: commandType.setAnimation,
    title: "设置动画",
    initialText: "setAnimation:选择动画文件;",
    component: SetAnimation,
    icon: <AutoWidth theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'为立绘或背景图片设置动画效果'
  },
  {
    type: commandType.bgm,
    title: "背景音乐",
    initialText: "bgm:选择背景音乐;",
    component: Bgm,
    icon: <Music theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'启动、切换或停止背景音乐的播放'
  },
  {
    type: commandType.video,
    title: "播放视频",
    initialText: "playVideo:选择视频文件;",
    component: PlayVideo,
    icon: <VideoTwo theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'播放一小段视频'
  },
  {
    type: commandType.pixi,
    title: "使用特效",
    initialText: "pixiPerform:snow;",
    component: PixiPerform,
    icon: <Effects theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'为当前的舞台添加特殊效果'
  },
  {
    type: commandType.pixiInit,
    title: "清除特效",
    initialText: "pixiInit;",
    component: PixiPerform,
    icon: <Erase theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'清除当前舞台的特殊效果'
  },
  {
    type: commandType.intro,
    title: "黑屏文字",
    initialText: "intro:;",
    component: Intro,
    icon: <AlignLeftTwo theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'黑屏显示一段文字，用于独白或引出场景'
  },
  {
    type: commandType.callScene,
    title: "调用场景",
    initialText: "callScene:选择场景文件;",
    component: ChangeCallScene,
    icon: <CornerRightUp theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'调用一段场景文件，在结束后返回父场景'
  },
  {
    type: commandType.changeScene,
    title: "切换场景",
    initialText: "changeScene:选择场景文件;",
    component: ChangeCallScene,
    icon: <SwitchThemes theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'切换到另一个场景文件，并清除当前场景'
  },
  {
    type: commandType.choose,
    title: "分支选择",
    initialText: "choose:选项:选择场景文件;",
    component: Choose,
    icon: <ListCheckbox theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'通过选项进入不同的场景'
  },
  {
    type: commandType.miniAvatar,
    title: "角落头像",
    initialText: "miniAvatar:选择小头像;",
    component: MiniAvatar,
    icon: <Avatar theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'在对话框的左下角显示一个小头像'
  },
  {
    type: commandType.playEffect,
    title: "效果声音",
    initialText: "playEffect:选择效果音文件;",
    component: PlayEffect,
    icon: <Acoustic theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'播放一段效果音'
  },
  {
    type: commandType.unlockCg,
    title: "鉴赏图片",
    initialText: "unlockCg:;",
    component: UnlockExtra,
    icon: <AddPicture theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'添加一张图片到 CG 鉴赏界面'
  },
  {
    type: commandType.unlockBgm,
    title: "鉴赏音乐",
    initialText: "unlockBgm:;",
    component: UnlockExtra,
    icon: <AddMusic theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'添加一首音乐到音乐鉴赏界面'
  },
  {
    type: commandType.setTextbox,
    title: "文本显示",
    initialText: "setTextbox:hide;",
    component: SetTextbox,
    icon: <AlignTextBottomOne theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'控制是否要显示文本框'
  },
  {
    type: commandType.end,
    title: "结束游戏",
    initialText: "end;",
    component: End,
    icon: <Logout theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'结束当前游戏并回到标题画面'
  },
  {
    type: commandType.comment,
    title: "单行注释",
    initialText: ";注释",
    component: Comment,
    icon: <Code theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText:'添加一行注释'
  }
];
