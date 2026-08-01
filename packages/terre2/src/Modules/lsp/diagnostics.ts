import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { ISentence } from 'webgal-parser/build/types/interface/sceneInterface';
import { commandType } from './completion/commandArgs';
import { parseSentences, SentenceCursor } from './sentenceLocator';

/**
 * callScene 的参数会原样成为被调用场景的局部变量，唯独通用参数的名字会先被引擎自己消费掉。
 *
 * 这里只挑布尔型的通用参数：它们裸写（`-next`）才是正常用法，一旦写成 `-next=5`，
 * 作者要的显然是传一个叫 next 的参数，而引擎只会把它当成通用参数，值悄悄丢掉。
 * `-when` 不在其列，因为 `callScene:b.txt -when=a>0;` 本来就是合法的条件调用。
 */
const RESERVED_BOOLEAN_ARG_KEYS = new Set(['next', 'continue']);

/**
 * 整篇文档的诊断。规则按语句维度组织，后续规则同样追加到 collectSentenceDiagnostics。
 */
export function collectDiagnostics(text: string, uri: string): Diagnostic[] {
  const lines = text.split(/\r\n|\r|\n/);
  return parseSentences(text, uri).flatMap((sentence) =>
    collectSentenceDiagnostics(sentence, lines),
  );
}

function collectSentenceDiagnostics(
  sentence: ISentence,
  lines: string[],
): Diagnostic[] {
  if (sentence.command !== commandType.callScene) {
    return [];
  }
  return sentence.args
    .filter(
      (arg) =>
        RESERVED_BOOLEAN_ARG_KEYS.has(arg.key) &&
        typeof arg.value !== 'boolean',
    )
    .map((arg) => makeReservedArgDiagnostic(sentence, lines, arg.key))
    .filter((diagnostic): diagnostic is Diagnostic => !!diagnostic);
}

/**
 * 在源码里定位 `-参数名` 以确定波浪线的范围。定位不到就不报，
 * 免得把警告标到一个和作者所写无关的位置上。
 */
function makeReservedArgDiagnostic(
  sentence: ISentence,
  lines: string[],
  key: string,
): Diagnostic | undefined {
  const argText = `-${key}`;
  const position = new SentenceCursor(lines, sentence).find(argText);
  if (!position) {
    return undefined;
  }
  return {
    severity: DiagnosticSeverity.Warning,
    range: {
      start: { line: position.line, character: position.startCharacter },
      end: {
        line: position.line,
        character: position.startCharacter + argText.length,
      },
    },
    source: 'WebGAL',
    message: `“${key}”是所有命令通用的参数名，会被引擎自己使用，不会作为局部变量传给被调用的场景。请给参数换一个名字。`,
  };
}
