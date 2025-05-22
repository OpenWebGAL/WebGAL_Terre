import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
  MarkupContent,
  MarkupKind,
} from 'vscode-languageserver';
import { ISentence } from 'webgal-parser/build/types/interface/sceneInterface';
import { commandType } from './commandArgs';
import { IFileInfo, WebgalFsService } from '../../webgal-fs/webgal-fs.service';
import { ConsoleLogger } from '@nestjs/common';

function setKind(item: CompletionItem, isDir: boolean) {
  return {
    ...item,
    kind: isDir ? CompletionItemKind.Folder : CompletionItemKind.File,
  };
}

export function makeFileSuggestion(files: IFileInfo[]): CompletionItem[] {
  return files.map((f) =>
    setKind(
      {
        label: f.name,
        insertText: f.name,
      },
      f.isDir,
    ),
  );
}

const fsService = new WebgalFsService(new ConsoleLogger());

function getPathFromSubdir(basePath: string, subdir: string, content: string) {
  const path = `public/${basePath}/${subdir}/${content}`;
  return fsService.getPathFromRoot(decodeURI(path));
}

function filterFiles(files: IFileInfo[]) {
  // Ignores hidden files (starting with `.`)
  return files.filter((di) => !di.name.startsWith('.'));
}

function getPath(line: string): string {
  // 匹配第一个冒号到最后一个斜杠之间的内容
  // 包括最后一个斜杠，不包括第一个冒号以及紧接着的一个或多个空格
  const result = line.match('(?<=:\\s*)\\S.*/');
  return result ? result[0] : '';
}

export async function handleFileSuggestions(
  sentence: ISentence,
  basePath: string,
  line: string,
): Promise<CompletionItem[]> {
  let dirPath = '';
  let dirInfo: IFileInfo[] = [];
  if (sentence.command === commandType.changeBg) {
    dirPath = getPathFromSubdir(basePath, 'background', getPath(line));
  }
  if (sentence.command === commandType.unlockCg) {
    dirPath = getPathFromSubdir(basePath, 'background', getPath(line));
  }
  if (sentence.command === commandType.changeFigure) {
    dirPath = getPathFromSubdir(basePath, 'figure', getPath(line));
  }
  if (sentence.command === commandType.miniAvatar) {
    dirPath = getPathFromSubdir(basePath, 'figure', getPath(line));
  }
  if (sentence.command === commandType.changeScene) {
    dirPath = getPathFromSubdir(basePath, 'scene', getPath(line));
  }
  if (sentence.command === commandType.callScene) {
    dirPath = getPathFromSubdir(basePath, 'scene', getPath(line));
  }
  if (sentence.command === commandType.bgm) {
    dirPath = getPathFromSubdir(basePath, 'bgm', getPath(line));
  }
  if (sentence.command === commandType.unlockBgm) {
    dirPath = getPathFromSubdir(basePath, 'bgm', getPath(line));
  }
  if (sentence.command === commandType.video) {
    dirPath = getPathFromSubdir(basePath, 'video', getPath(line));
  }
  if (sentence.command === commandType.playEffect) {
    dirPath = getPathFromSubdir(basePath, 'vocal', getPath(line));
  }
  if (sentence.command === commandType.choose) {
    let path = '';
    // 第一步匹配最后一个冒号后的所有内容
    // 第二步匹配最后一个斜杠前的所有内容
    const result0 = line.match('(?<=:\\s*)[^:|\\|]*$');
    if (result0) {
      const result1 = result0[0].match('.*/');
      path = result1 ? result1[0] : '';
      dirPath = getPathFromSubdir(basePath, 'scene', path);
    } else {
      return [];
    }
  }
  dirInfo = await fsService.getDirInfo(dirPath);
  console.debug(dirInfo);

  return makeFileSuggestion(filterFiles(dirInfo));
}
