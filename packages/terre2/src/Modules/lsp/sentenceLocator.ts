import {
  IScene,
  ISentence,
} from 'webgal-parser/build/types/interface/sceneInterface';
import { webgalParser } from '../../util/webgal-parser';

/**
 * 一条语句可能跨越脚本文件的多行：首行写命令和内容，其后若干条以空白开头、
 * 首字符为 `-` 或 `|` 的续行承载剩余的参数或文本。
 *
 * 解析器会把续行折叠进首行，并在解析结果里留下占位语句来补齐行数，
 * 因此「语句 index == 文件行号」始终成立，而真正的语句用 startLine / endLine
 * 描述自己占据的行范围。
 *
 * 本模块把「按行找语句」和「在语句的行范围内定位文本」这两件事集中起来，
 * 供语义高亮与补全共用，避免各自再按单行去解析。
 */

/** 解析整篇文档，只返回真正的语句（跳过续行占位） */
export function parseSentences(text: string, uri: string): ISentence[] {
  const scene: IScene = webgalParser.parse(text, 'scene.txt', uri);
  return scene.sentenceList.filter((sentence) => !sentence.isLineBreakHolder);
}

/** 找到覆盖指定行（0-based）的语句。行在注释或空行上时返回 undefined */
export function findSentenceByLine(
  sentences: ISentence[],
  line: number,
): ISentence | undefined {
  return sentences.find(
    (sentence) => line >= sentence.startLine && line <= sentence.endLine,
  );
}

/** 文本在文档中的位置 */
export interface TextPosition {
  line: number;
  startCharacter: number;
}

/**
 * 在一条语句占据的行范围内顺序查找文本的游标。
 *
 * 语句的参数可能分散在多条续行里，所以查找必须能跨行向后推进；
 * 同时游标只前进不后退，保证同名文本不会被重复匹配到同一处。
 */
export class SentenceCursor {
  private line: number;
  private offset = 0;

  constructor(
    private readonly lines: string[],
    private readonly sentence: ISentence,
  ) {
    this.line = sentence.startLine;
  }

  /** 从当前位置向后查找，命中则把游标推到匹配内容之后 */
  find(text: string): TextPosition | undefined {
    if (text === '') {
      return undefined;
    }

    for (let line = this.line; line <= this.sentence.endLine; line++) {
      const from = line === this.line ? this.offset : 0;
      const startCharacter = this.lines[line]?.indexOf(text, from) ?? -1;

      if (startCharacter !== -1) {
        this.line = line;
        this.offset = startCharacter + text.length;
        return { line, startCharacter };
      }
    }

    return undefined;
  }

  /** 回到语句开头，用于换一类 token 重新扫描 */
  rewind() {
    this.line = this.sentence.startLine;
    this.offset = 0;
  }
}

/**
 * 文本在语句行范围内首次出现的「拉平」位置，用于给参数排序。
 *
 * 解析器产出的参数顺序不一定是源码顺序（命令自带的参数会排在前面），
 * 而游标只能向前推进，所以定位前要先按源码顺序排好。找不到时返回 -1，
 * 让这类参数排在最前，不会挡住后面的查找。
 */
export function flatIndexInSentence(
  lines: string[],
  sentence: ISentence,
  text: string,
): number {
  let flatOffset = 0;

  for (let line = sentence.startLine; line <= sentence.endLine; line++) {
    const found = lines[line]?.indexOf(text) ?? -1;
    if (found !== -1) {
      return flatOffset + found;
    }
    flatOffset += lines[line]?.length ?? 0;
  }

  return -1;
}
