import SceneParser from "webgal-parser";
import { logger } from "../../../utils/logger";
import {commandType, IScene} from "webgal-parser/src/interface/sceneInterface";


const SCRIPT_CONFIG = [
  { scriptString: 'intro', scriptType: commandType.intro },
  { scriptString: 'changeBg', scriptType: commandType.changeBg },
  { scriptString: 'changeFigure', scriptType: commandType.changeFigure },
  { scriptString: 'miniAvatar', scriptType: commandType.miniAvatar },
  { scriptString: 'changeScene', scriptType: commandType.changeScene },
  { scriptString: 'choose', scriptType: commandType.choose},
  { scriptString: 'end', scriptType: commandType.end },
  { scriptString: 'bgm', scriptType: commandType.bgm },
  { scriptString: 'playVideo', scriptType: commandType.video },
  {
    scriptString: 'setComplexAnimation',
    scriptType: commandType.setComplexAnimation,
  },
  { scriptString: 'setFilter', scriptType: commandType.setFilter },
  { scriptString: 'pixiInit', scriptType: commandType.pixiInit },
  { scriptString: 'pixiPerform', scriptType: commandType.pixi },
  { scriptString: 'label', scriptType: commandType.label},
  { scriptString: 'jumpLabel', scriptType: commandType.jumpLabel},
  { scriptString: 'setVar', scriptType: commandType.setVar },
  { scriptString: 'callScene', scriptType: commandType.callScene },
  { scriptString: 'showVars', scriptType: commandType.showVars },
  { scriptString: 'unlockCg', scriptType: commandType.unlockCg },
  { scriptString: 'unlockBgm', scriptType: commandType.unlockBgm },
  { scriptString: 'say', scriptType: commandType.say },
  { scriptString: 'filmMode', scriptType: commandType.filmMode },
  { scriptString: 'callScene', scriptType: commandType.callScene },
  { scriptString: 'setTextbox', scriptType: commandType.setTextbox},
  { scriptString: 'setAnimation', scriptType: commandType.setAnimation },
  { scriptString: 'playEffect', scriptType: commandType.playEffect },
  { scriptString: 'setTransition', scriptType: commandType.setTransition },
  { scriptString: 'setTransform', scriptType: commandType.setTransform },
  { scriptString: 'getUserInput', scriptType: commandType.getUserInput },
];

export const WebgalParser = new SceneParser(() => {
}, (fileName, assetType) => {
  return fileName;
}, [], SCRIPT_CONFIG);
/**
 * 场景解析器 - 编辑器版
 * @param rawScene 原始场景
 * @return {IScene} 解析后的场景
 */
export const parseScene = (rawScene: string): IScene => {
  const parsedScene = WebgalParser.parse(rawScene, 'editing', 'editing.txt');
  logger.info(`解析场景：${'editing'}，数据为：`, parsedScene);
  return parsedScene;
};
