import { commandType, ISentence } from "webgal-parser/src/interface/sceneInterface";
import Say from "./Say";
import { FC, ReactElement } from "react";
import {
  Acoustic,
  AddMusic,
  AddPicture,
  AlignLeftTwo,
  AlignTextBottomOne, ApplicationEffect,
  AutoWidth,
  Avatar,
  Code,
  CommentOne,
  CornerRightUp,
  Effects,
  EnterTheKeyboard,
  Erase,
  ListCheckbox,
  Logout,
  Music,
  NewPicture,
  People,
  SwitchThemes, Transform,
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
import SetTransition from "@/pages/editor/GraphicalEditor/SentenceEditor/SetTransition";
import SetTransform from "@/pages/editor/GraphicalEditor/SentenceEditor/SetTransform";
import styles from "./sentenceEditor.module.scss";
import GetUserInput from "@/pages/editor/GraphicalEditor/SentenceEditor/GetUserInput";
import { t } from "@lingui/macro";

export interface ISentenceEditorProps {
  sentence: ISentence;
  onSubmit: (newSentence: string) => void;
  index:number
}

export interface ISentenceEditorConfig {
  type: commandType,
  title: () => string,
  initialText: () => string,
  component: FC<ISentenceEditorProps>,
  icon: ReactElement,
  descText: () => string,
}


export const sentenceEditorDefault: ISentenceEditorConfig = {
  type: commandType.say,
  title: () => t`未识别`,
  initialText: () => "",
  component: Unrecognized,
  icon: <CommentOne theme="outline" size="24" className={styles.iconParkIcon}/>,
  descText: () => ""
};

export const sentenceEditorConfig: ISentenceEditorConfig[] = [
  {
    type: commandType.say,
    title: () => t`普通对话`,
    initialText: () => t`对话;`,
    component: Say,
    icon: <CommentOne className={styles.iconSvg} theme="multi-color" size="24"/>,
    descText: () => t`添加一句对话，可以附带语音`
  },
  {
    type: commandType.changeBg,
    title: () => t`切换背景`,
    initialText: () => t`changeBg: 选择背景图片;`,
    component: ChangeBg,
    icon: <NewPicture theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`切换背景图片`
  },
  {
    type: commandType.changeFigure,
    title: () => t`切换立绘`,
    initialText: () => t`changeFigure:选择立绘文件;`,
    component: ChangeFigure,
    icon: <People theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`添加或切换指定位置的立绘`
  },
  {
    type: commandType.setAnimation,
    title: () => t`设置动画`,
    initialText: () => t`setAnimation:选择动画文件;`,
    component: SetAnimation,
    icon: <AutoWidth theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`为立绘或背景图片设置动画效果`
  },
  {
    type: commandType.bgm,
    title: () => t`背景音乐`,
    initialText: () => t`bgm:选择背景音乐;`,
    component: Bgm,
    icon: <Music theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`启动、切换或停止背景音乐的播放`
  },
  {
    type: commandType.video,
    title: () => t`播放视频`,
    initialText: () => t`playVideo:选择视频文件;`,
    component: PlayVideo,
    icon: <VideoTwo theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`播放一小段视频`
  },
  {
    type: commandType.pixi,
    title: () => t`使用特效`,
    initialText: () => t`pixiPerform:snow;`,
    component: PixiPerform,
    icon: <Effects theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`为当前的舞台添加特殊效果`
  },
  {
    type: commandType.pixiInit,
    title: () => t`清除特效`,
    initialText: () => t`pixiInit;`,
    component: PixiPerform,
    icon: <Erase theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`清除当前舞台的特殊效果`
  },
  {
    type: commandType.intro,
    title: () => t`全屏文字`,
    initialText: () => t`intro:;`,
    component: Intro,
    icon: <AlignLeftTwo theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`全屏显示一段文字，用于独白或引出场景`
  },
  {
    type: commandType.callScene,
    title: () => t`调用场景`,
    initialText: () => t`callScene:选择场景文件;`,
    component: ChangeCallScene,
    icon: <CornerRightUp theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`调用一段场景文件，在结束后返回父场景`
  },
  {
    type: commandType.changeScene,
    title: () => t`切换场景`,
    initialText: () => t`changeScene:选择场景文件;`,
    component: ChangeCallScene,
    icon: <SwitchThemes theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`切换到另一个场景文件，并清除当前场景`
  },
  {
    type: commandType.choose,
    title: () => t`分支选择`,
    initialText: () => t`choose:选项:选择场景文件;`,
    component: Choose,
    icon: <ListCheckbox theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`通过选项进入不同的场景`
  },
  {
    type: commandType.miniAvatar,
    title: () => t`角落头像`,
    initialText: () => t`miniAvatar:选择小头像;`,
    component: MiniAvatar,
    icon: <Avatar theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`在对话框的左下角显示一个小头像`
  },
  {
    type: commandType.playEffect,
    title: () => t`效果声音`,
    initialText: () => t`playEffect:选择效果音文件;`,
    component: PlayEffect,
    icon: <Acoustic theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`播放一段效果音`
  },
  {
    type: commandType.unlockCg,
    title: () => t`鉴赏图片`,
    initialText: () => t`unlockCg:;`,
    component: UnlockExtra,
    icon: <AddPicture theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`添加一张图片到 CG 鉴赏界面`
  },
  {
    type: commandType.unlockBgm,
    title: () => t`鉴赏音乐`,
    initialText: () => t`unlockBgm:;`,
    component: UnlockExtra,
    icon: <AddMusic theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`添加一首音乐到音乐鉴赏界面`
  },
  {
    type: commandType.setTextbox,
    title: () => t`文本显示`,
    initialText: () => t`setTextbox:hide;`,
    component: SetTextbox,
    icon: <AlignTextBottomOne theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`控制是否要显示文本框`
  },
  {
    type: commandType.end,
    title: () => t`结束游戏`,
    initialText: () => t`end;`,
    component: End,
    icon: <Logout theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`结束当前游戏并回到标题画面`
  },
  {
    type: commandType.comment,
    title: () => t`单行注释`,
    initialText: () => t`;注释`,
    component: Comment,
    icon: <Code theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`添加一行注释`
  },
  {
    type: commandType.setTransition,
    title: () => t`设置转场`,
    initialText: () => t`setTransition:;`,
    component: SetTransition,
    icon: <Transform theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`设置转场效果`
  },
  {
    type:commandType.setTransform,
    title:() => t`设置效果`,
    initialText: () => t`setTransform: -duration=0;`,
    component:SetTransform,
    icon: <ApplicationEffect theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`为立绘或背景图片设置效果`
  },
  {
    type:commandType.getUserInput,
    title:() => t`获取输入`,
    initialText: () => t`getUserInput:;`,
    component:GetUserInput,
    icon: <EnterTheKeyboard theme="multi-color" className={styles.iconSvg} size="24"/>,
    descText: () => t`获取来自用户的字符输入`
  }
];

