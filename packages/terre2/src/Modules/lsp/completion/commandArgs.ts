import {
  MarkupContent,
  MarkupKind,
} from 'vscode-languageserver';
// FIXME: Error: Cannot find module 'webgal-parser/src/interface/sceneInterface'
// import { commandType } from 'webgal-parser/src/interface/sceneInterface';

/**
 * 语句类型
 */
export enum commandType {
  say = 0,
  changeBg = 1,
  changeFigure = 2,
  bgm = 3,
  video = 4,
  pixi = 5,
  pixiInit = 6,
  intro = 7,
  miniAvatar = 8,
  changeScene = 9,
  choose = 10,
  end = 11,
  setComplexAnimation = 12,
  setFilter = 13,
  label = 14,
  jumpLabel = 15,
  chooseLabel = 16,
  setVar = 17,
  if = 18,
  callScene = 19,
  showVars = 20,
  unlockCg = 21,
  unlockBgm = 22,
  filmMode = 23,
  setTextbox = 24,
  setAnimation = 25,
  playEffect = 26,
  setTempAnimation = 27,
  comment = 28,
  setTransform = 29,
  setTransition = 30,
  getUserInput = 31,
  applyStyle = 32,
}

export function markdown(content: string): MarkupContent {
  return {
    kind: MarkupKind.Markdown,
    value: content
  }
}
