import { commandType } from '../interfaces/sceneInterface';


export interface IConfigInterface {
  scriptString: string;
  scriptType: commandType;
}

export const SCRIPT_CONFIG: IConfigInterface[] = [
  { scriptString: 'intro', scriptType: commandType.intro },
  { scriptString: 'changeBg', scriptType: commandType.changeBg,},
  { scriptString: 'changeFigure', scriptType: commandType.changeFigure,  },
  { scriptString: 'miniAvatar', scriptType: commandType.miniAvatar, },
  { scriptString: 'changeScene', scriptType: commandType.changeScene,  },
  { scriptString: 'choose', scriptType: commandType.choose, },
  { scriptString: 'end', scriptType: commandType.end, },
  { scriptString: 'bgm', scriptType: commandType.bgm,  },
  { scriptString: 'playVideo', scriptType: commandType.video,  },
  { scriptString: 'setBgAni', scriptType: commandType.perform_bgAni, },
  { scriptString: 'setFigAni', scriptType: commandType.perform_FigAni,  },
  { scriptString: 'setBgTransform', scriptType: commandType.setBgTransform, },
  { scriptString: 'setBgFilter', scriptType: commandType.setBgFilter, },
  { scriptString: 'setFigTransform', scriptType: commandType.setFigTransform, },
  { scriptString: 'setFigFilter', scriptType: commandType.setFigFilter, },
  { scriptString: 'pixiInit', scriptType: commandType.pixiInit,  },
  { scriptString: 'pixiPerform', scriptType: commandType.pixi, },
  { scriptString: 'label', scriptType: commandType.label,  },
  { scriptString: 'jumpLabel', scriptType: commandType.jumpLabel, },
  { scriptString: 'setVar', scriptType: commandType.setVar, },
  { scriptString: 'callScene', scriptType: commandType.callScene,  },
  { scriptString: 'showVars', scriptType: commandType.showVars, },
  { scriptString: 'unlockCg', scriptType: commandType.unlockCg,  },
  { scriptString: 'unlockBgm', scriptType: commandType.unlockBgm,  },
  { scriptString: 'say', scriptType: commandType.say, },
  { scriptString: 'filmMode', scriptType: commandType.filmMode, },
  { scriptString: 'callScene', scriptType: commandType.callScene,  },
  { scriptString: 'setTextbox', scriptType: commandType.setTextbox, },
];
export const ADD_NEXT_ARG_LIST = [
  commandType.bgm,
  commandType.pixi,
  commandType.pixiInit,
  commandType.label,
  commandType.if,
  commandType.miniAvatar,
  commandType.setBgTransform,
  commandType.setBgFilter,
  commandType.setFigFilter,
  commandType.setFigTransform,
  commandType.perform_FigAni,
  commandType.perform_bgAni,
  commandType.setVar,
  commandType.unlockBgm,
  commandType.unlockCg,
  commandType.filmMode,
];
