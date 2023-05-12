import { commandType, ISentence } from "webgal-parser/src/interface/sceneInterface";
import Say from "./Say";
import { FC, ReactElement } from "react";
import { t } from 'i18next';
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
  title: () => string,
  initialText: () => string,
  component: FC<ISentenceEditorProps>,
  icon: ReactElement,
  descText: () => string,
}

const tPrefix = 'editor.graphical.sentences.';

export const sentenceEditorDefault: ISentenceEditorConfig = {
  type: commandType.say,
  title: () => t(tPrefix + 'unknown.title'),
  initialText: () => "",
  component: Unrecognized,
  icon: <CommentOne theme="outline" size="24" fill="#333" />,
  descText: () => ""
};

export const sentenceEditorConfig: ISentenceEditorConfig[] = [
  {
    type: commandType.say,
    title: () => t(tPrefix + 'say.title'),
    initialText: () => t(tPrefix + 'say.initText'),
    component: Say,
    icon: <CommentOne theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'say.descText')
  },
  {
    type: commandType.changeBg,
    title: () => t(tPrefix + 'changeBg.title'),
    initialText: () => t(tPrefix + 'changeBg.initText'),
    component: ChangeBg,
    icon: <NewPicture theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'changeBg.descText')
  },
  {
    type: commandType.changeFigure,
    title: () => t(tPrefix + 'changeFigure.title'),
    initialText: () => t(tPrefix + 'changeFigure.initText'),
    component: ChangeFigure,
    icon: <People theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'changeFigure.descText')
  },
  {
    type: commandType.setAnimation,
    title: () => t(tPrefix + 'setAnime.title'),
    initialText: () => t(tPrefix + 'setAnime.initText'),
    component: SetAnimation,
    icon: <AutoWidth theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'setAnime.descText')
  },
  {
    type: commandType.bgm,
    title: () => t(tPrefix + 'bgm.title'),
    initialText: () => t(tPrefix + 'bgm.initText'),
    component: Bgm,
    icon: <Music theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'bgm.descText')
  },
  {
    type: commandType.video,
    title: () => t(tPrefix + 'video.title'),
    initialText: () => t(tPrefix + 'video.initText'),
    component: PlayVideo,
    icon: <VideoTwo theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'video.descText')
  },
  {
    type: commandType.pixi,
    title: () => t(tPrefix + 'effect.title'),
    initialText: () => t(tPrefix + 'effect.initText'),
    component: PixiPerform,
    icon: <Effects theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'effect.descText')
  },
  {
    type: commandType.pixiInit,
    title: () => t(tPrefix + 'clearEffect.title'),
    initialText: () => t(tPrefix + 'clearEffect.initText'),
    component: PixiPerform,
    icon: <Erase theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'clearEffect.descText')
  },
  {
    type: commandType.intro,
    title: () => t(tPrefix + 'intro.title'),
    initialText: () => t(tPrefix + 'intro.initText'),
    component: Intro,
    icon: <AlignLeftTwo theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'intro.descText')
  },
  {
    type: commandType.callScene,
    title: () => t(tPrefix + 'changeCallScene.title'),
    initialText: () => t(tPrefix + 'changeCallScene.initText'),
    component: ChangeCallScene,
    icon: <CornerRightUp theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'changeCallScene.descText')
  },
  {
    type: commandType.changeScene,
    title: () => t(tPrefix + 'changeScene.title'),
    initialText: () => t(tPrefix + 'changeScene.initText'),
    component: ChangeCallScene,
    icon: <SwitchThemes theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'changeScene.descText')
  },
  {
    type: commandType.choose,
    title: () => t(tPrefix + 'choose.title'),
    initialText: () => t(tPrefix + 'choose.initText'),
    component: Choose,
    icon: <ListCheckbox theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'choose.descText')
  },
  {
    type: commandType.miniAvatar,
    title: () => t(tPrefix + 'miniAvatar.title'),
    initialText: () => t(tPrefix + 'miniAvatar.initText'),
    component: MiniAvatar,
    icon: <Avatar theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'miniAvatar.descText')
  },
  {
    type: commandType.playEffect,
    title: () => t(tPrefix + 'soundEffect.descText'),
    initialText: () => t(tPrefix + 'soundEffect.descText'),
    component: PlayEffect,
    icon: <Acoustic theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'soundEffect.descText')
  },
  {
    type: commandType.unlockCg,
    title: () => t(tPrefix + 'unlockCg.title'),
    initialText: () => t(tPrefix + 'unlockCg.initText'),
    component: UnlockExtra,
    icon: <AddPicture theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'unlockCg.descText')
  },
  {
    type: commandType.unlockBgm,
    title: () => t(tPrefix + 'unlockBgm.descText'),
    initialText: () => t(tPrefix + 'unlockBgm.descText'),
    component: UnlockExtra,
    icon: <AddMusic theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'unlockBgm.descText')
  },
  {
    type: commandType.setTextbox,
    title: () => t(tPrefix + 'setTextbox.title'),
    initialText: () => t(tPrefix + 'setTextbox.initText'),
    component: SetTextbox,
    icon: <AlignTextBottomOne theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'setTextbox.descText')
  },
  {
    type: commandType.end,
    title: () => t(tPrefix + 'end.title'),
    initialText: () => t(tPrefix + 'end.initText'),
    component: End,
    icon: <Logout theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'end.descText')
  },
  {
    type: commandType.comment,
    title: () => t(tPrefix + 'comment.title'),
    initialText: () => t(tPrefix + 'comment.initText'),
    component: Comment,
    icon: <Code theme="multi-color" size="24" fill={["#333", "#2F88FF", "#FFF", "#43CCF8"]} />,
    descText: () => t(tPrefix + 'comment.descText')
  }
];
