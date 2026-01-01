import { IWebgalConfig } from '../types/game-config';
import { webgalParser } from '../util/webgal-parser';
import { WebgalConfig } from 'webgal-parser/build/types/configParser/configParser';
import { cloneDeep } from "lodash";

// 转化旧版配置文件内容为新版配置
export function convertTextConfigToWebgalConfig(textConfig: string): IWebgalConfig {
  let config: IWebgalConfig = {};
  const gameConfig: WebgalConfig = webgalParser.parseConfig(textConfig);
  gameConfig.forEach((configItem) => {
    switch (configItem.command) {
      case 'Game_name':
        if (configItem.args[0]) config.gameName = configItem.args[0];
        break;
      case 'Game_key':
        if (configItem.args[0]) config.gameKey = configItem.args[0];
        break;
      case 'Game_Logo':
        if (configItem.args) config.gameLogo = configItem.args.join('|');
        break;
      case 'Title_img':
        if (configItem.args[0]) config.titleImage = configItem.args[0];
        break;
      case 'Title_bgm':
        if (configItem.args[0]) config.titleBgm = configItem.args[0];
        break;
      case 'Description':
        if (configItem.args[0]) config.description = configItem.args[0];
        break;
      case 'Default_Language':
        if (configItem.args[0]) config.defaultLanguage = configItem.args[0];
        break;
      case 'Package_name':
        if (configItem.args[0]) config.packageName = configItem.args[0];
        break;
      case 'Enable_Appreciation':
        if (configItem.args[0])
          config.enableExtra = configItem.args[0] === 'true';
        break;
      case 'Enable_Panic':
        if (configItem.args[0])
          config.enablePanic = configItem.args[0] === 'true';
        break;
      case 'Enable_Legacy_Expression_Blend_Mode':
        if (configItem.args[0])
          config.enableLegacyExpressionBlendMode = configItem.args[0] === 'true';
        break;
      case 'Steam_AppID':
        if (configItem.args[0]) config.steamAppId = configItem.args[0];
        break;
      case 'Max_line':
        if (configItem.args[0]) config.textboxMaxLine = parseInt(configItem.args[0], 10);
        break;
      case 'LineHeight':
        if (configItem.args[0]) config.textboxLineHeight = parseInt(configItem.args[0], 10);
        break;
      default:
        config[configItem.command] = cloneDeep(configItem.args).join('|');
        break;
    }
  });
  return config;
}

// 转化新版配置为旧版配置文件内容
export function convertWebgalConfigToTextConfig(webgalConfig: IWebgalConfig): string {
  let legacyConfig: WebgalConfig = [];
  if (webgalConfig.gameName)
    legacyConfig.push({ command: 'Game_name', args: [webgalConfig.gameName], options: [] });
  if (webgalConfig.gameKey)
    legacyConfig.push({ command: 'Game_key', args: [webgalConfig.gameKey], options: [] });
  if (webgalConfig.gameLogo && webgalConfig.gameLogo.length > 0)
    legacyConfig.push({ command: 'Game_Logo', args: webgalConfig.gameLogo.split('|'), options: [] });
  if (webgalConfig.titleImage)
    legacyConfig.push({ command: 'Title_img', args: [webgalConfig.titleImage], options: [] });
  if (webgalConfig.titleBgm)
    legacyConfig.push({ command: 'Title_bgm', args: [webgalConfig.titleBgm], options: [] });
  if (webgalConfig.description)
    legacyConfig.push({ command: 'Description', args: [webgalConfig.description], options: [] });
  if (webgalConfig.defaultLanguage)
    legacyConfig.push({ command: 'Default_Language', args: [webgalConfig.defaultLanguage], options: [] });
  if (webgalConfig.packageName)
    legacyConfig.push({ command: 'Package_name', args: [webgalConfig.packageName], options: [] });
  if (webgalConfig.enableExtra !== undefined)
    legacyConfig.push({ command: 'Enable_Appreciation', args: [webgalConfig.enableExtra ? 'true' : 'false'], options: [] });
  if (webgalConfig.enablePanic !== undefined)
    legacyConfig.push({ command: 'Enable_Panic', args: [webgalConfig.enablePanic ? 'true' : 'false'], options: [] });
  if (webgalConfig.enableLegacyExpressionBlendMode !== undefined)
    legacyConfig.push({ command: 'Enable_Legacy_Expression_Blend_Mode', args: [webgalConfig.enableLegacyExpressionBlendMode ? 'true' : 'false'], options: [] });
  if (webgalConfig.steamAppId)
    legacyConfig.push({ command: 'Steam_AppID', args: [webgalConfig.steamAppId], options: [] });
  if (webgalConfig.textboxMaxLine !== undefined)
    legacyConfig.push({ command: 'Max_line', args: [webgalConfig.textboxMaxLine.toString()], options: [] });
  if (webgalConfig.textboxLineHeight !== undefined)
    legacyConfig.push({ command: 'LineHeight', args: [webgalConfig.textboxLineHeight.toString()], options: [] });
  return webgalParser.stringifyConfig(legacyConfig);
}
