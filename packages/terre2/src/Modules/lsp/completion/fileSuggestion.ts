import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
} from 'vscode-languageserver';
import { ISentence } from 'webgal-parser/build/types/interface/sceneInterface';
import { commandType } from './commandArgs';
import { IFileInfo, WebgalFsService } from '../../webgal-fs/webgal-fs.service';
import { ConsoleLogger } from '@nestjs/common';

function setKind(item: CompletionItem) {
  return { ...item, kind: CompletionItemKind.File };
}

export function makeFileSuggestion(files: string[]): CompletionItem[] {
  return files.map((f) =>
    setKind({
      label: f,
      insertText: f + ' ',
    }),
  );
}

const fsService = new WebgalFsService(new ConsoleLogger());

export async function handleFileSuggestions(
  sentence: ISentence,
  basePath: string,
): Promise<CompletionItem[]> {
  let dirPath = '';
  let dirInfo: IFileInfo[] = [];
  if (sentence.command === commandType.changeBg) {
    dirPath = fsService.getPathFromRoot(
      decodeURI(`public/${basePath}/background`),
    );
  }
  if (sentence.command === commandType.changeFigure) {
    dirPath = fsService.getPathFromRoot(decodeURI(`public/${basePath}/figure`));
  }
  if (sentence.command === commandType.changeScene) {
    dirPath = fsService.getPathFromRoot(decodeURI(`public/${basePath}/scene`));
  }
  dirInfo = await fsService.getDirInfo(dirPath);
  console.debug(dirInfo);

  return makeFileSuggestion(dirInfo.map((di) => di.name));
}
