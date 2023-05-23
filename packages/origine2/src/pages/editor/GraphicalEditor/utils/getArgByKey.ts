import { ISentence } from "webgal-parser/src/interface/sceneInterface";

export const getArgByKey = (sentence: ISentence, key: string): boolean | string | number => {
  for (const arg of sentence.args) {
    if (arg.key === key) {
      return arg.value;
    }
  }
  return "";
};
