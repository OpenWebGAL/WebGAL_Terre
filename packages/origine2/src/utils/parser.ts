import SceneParser from "webgal-parser";
import { IScene } from "webgal-parser/src/interface/sceneInterface";
import { logger } from "./logger";
import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from "webgal-parser/src/config/scriptConfig";

const parser = new SceneParser((assetList) => {
}, (fileName, assetType) => {
  return fileName;
}, ADD_NEXT_ARG_LIST, [...SCRIPT_CONFIG]);

/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @return {IScene} 解析后的场景
 */
export const sceneParser = (rawScene: string, sceneName: string, sceneUrl: string): IScene => {
  const parsedScene = parser.parse(rawScene, sceneName, sceneUrl);
  logger.info(`解析场景：${sceneName}，数据为：`, parsedScene);
  return parsedScene;
};
