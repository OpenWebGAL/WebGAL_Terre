import SceneParser from "webgal-parser";
import { logger } from "../../../utils/logger";
import {commandType, IScene} from "webgal-parser/src/interface/sceneInterface";
import { SCRIPT_CONFIG } from "webgal-parser/src/config/scriptConfig";


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
