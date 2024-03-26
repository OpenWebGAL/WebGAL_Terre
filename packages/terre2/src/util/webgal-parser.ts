import SceneParser, {
  ADD_NEXT_ARG_LIST,
  SCRIPT_CONFIG,
} from 'webgal-parser/build/cjs/index.cjs';

export const webgalParser = new SceneParser(
  (assetList) => {
    return;
  },
  (fileName, assetType) => {
    return fileName;
  },
  ADD_NEXT_ARG_LIST,
  [...SCRIPT_CONFIG],
);
