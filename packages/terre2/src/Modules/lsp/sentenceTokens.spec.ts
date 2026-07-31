import { parseSentences } from './sentenceLocator';
import { collectSentenceTokens } from './sentenceTokens';
import { commandType } from './completion/commandArgs';

const MULTILINE_SCENE = [
  'changeFigure:stand.webp',
  '  -left',
  '  -id=fig1 -next;',
  'intro:第一段',
  '  |第二段 -hold;',
].join('\n');

const lines = MULTILINE_SCENE.split('\n');

/** 把 token 还原成它在源码里覆盖的文本，便于直观断言 */
const tokenTexts = (line: number, tokenType?: string) =>
  parseSentences(MULTILINE_SCENE, 'test')
    .flatMap((sentence) => collectSentenceTokens(sentence, lines))
    .filter(
      (token) =>
        token.line === line && (!tokenType || token.tokenType === tokenType),
    )
    .map((token) =>
      lines[token.line].substr(token.startCharacter, token.length),
    );

describe('多行语句的语义高亮', () => {
  it('续行占位不会成为独立语句', () => {
    const sentences = parseSentences(MULTILINE_SCENE, 'test');

    expect(sentences).toHaveLength(2);
    expect(sentences[0].command).toBe(commandType.changeFigure);
    expect(sentences[0].startLine).toBe(0);
    expect(sentences[0].endLine).toBe(2);
    expect(sentences[1].startLine).toBe(3);
    expect(sentences[1].endLine).toBe(4);
  });

  it('续行上的参数同样能被着色', () => {
    expect(tokenTexts(1)).toEqual(['left']);
    expect(tokenTexts(2)).toEqual(['id', 'fig1', 'next']);
  });

  it('intro 续行上的文字按字符串着色', () => {
    expect(tokenTexts(3, 'string')).toEqual(['第一段']);
    expect(tokenTexts(4, 'string')).toEqual(['第二段']);
  });
});
