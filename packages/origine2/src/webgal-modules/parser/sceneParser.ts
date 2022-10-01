import { IAsset, IScene, ISentence } from '../interfaces/sceneInterface';
import { scriptParser } from './scriptParser/scriptParser';
import { logger } from '../../utils/logger';

/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @return {IScene} 解析后的场景
 */
export const sceneParser = (rawScene: string, sceneName: string, sceneUrl: string): IScene => {
  const rawSentenceList = rawScene.split('\n'); // 原始句子列表
  // 去除空行
  const rawSentenceListWithoutEmpty = rawSentenceList.filter((sentence) => sentence.trim() !== '');
  let assetsList: Array<IAsset> = []; // 场景资源列表
  let subSceneList: Array<string> = []; // 子场景列表
  const sentenceList: Array<ISentence> = rawSentenceListWithoutEmpty.map((sentence) => {
    const returnSentence: ISentence = scriptParser(sentence);
    // 在这里解析出语句可能携带的资源和场景，合并到 assetsList 和 subSceneList
    assetsList = [...assetsList, ...returnSentence.sentenceAssets];
    subSceneList = [...subSceneList, ...returnSentence.subScene];
    return returnSentence;
  });

  const parsedScene: IScene = {
    sceneName: sceneName, // 场景名称
    sceneUrl: sceneUrl,
    sentenceList: sentenceList, // 语句列表
    assetsList: assetsList, // 资源列表
    subSceneList: subSceneList, // 子场景列表
  };
  logger.info(`解析场景：${sceneName}，数据为：`, parsedScene);
  return parsedScene;
};
