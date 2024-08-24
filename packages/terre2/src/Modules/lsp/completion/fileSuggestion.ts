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

function getPathFromSubdir(basePath: string, subdir: string) {
  return fsService.getPathFromRoot(decodeURI(`public/${basePath}/${subdir}`));
}

function filterFiles(files: IFileInfo[]) {
  // Ignores hidden files (starting with `.`)
  return files.filter((di) => !di.name.startsWith('.'));
}

export async function handleFileSuggestions(
  sentence: ISentence,
  basePath: string,
): Promise<CompletionItem[]> {
  let dirPath = '';
  let dirInfo: IFileInfo[] = [];
  if (sentence.command === commandType.changeBg) {
    dirPath = getPathFromSubdir(basePath, 'background');
  }
  if (sentence.command === commandType.unlockCg) {
    dirPath = getPathFromSubdir(basePath, 'background');
  }
  if (sentence.command === commandType.changeFigure) {
    dirPath = getPathFromSubdir(basePath, 'figure');
  }
  if (sentence.command === commandType.changeScene) {
    dirPath = getPathFromSubdir(basePath, 'scene');
  }
  if (sentence.command === commandType.callScene) {
    dirPath = getPathFromSubdir(basePath, 'scene');
  }
  if (sentence.command === commandType.bgm) {
    dirPath = getPathFromSubdir(basePath, 'bgm');
  }
  if (sentence.command === commandType.unlockBgm) {
    dirPath = getPathFromSubdir(basePath, 'bgm');
  }
  if (sentence.command === commandType.video) {
    dirPath = getPathFromSubdir(basePath, 'video');
  }
  dirInfo = await fsService.getDirInfo(dirPath);
  console.debug(dirInfo);

  return makeFileSuggestion(filterFiles(dirInfo).map((di) => di.name));
}
