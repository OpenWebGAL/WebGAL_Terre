export const splitToArray = (rawText:string)=>{
  return rawText.replaceAll('\r','').split('\n');
};

export const mergeToString = (stringArray:string[])=>{
  return stringArray.join('\n');
};

/**
 * 用新的行替换脚本里的一段行范围（含首尾）。
 *
 * 图形编辑器改动一条语句时，脚本被切成「语句前 / 语句 / 语句后」三段，
 * 只重写中间一段，其余行原样保留。一条语句可能占据多行，所以这里按范围而非单行替换。
 *
 * 纯插入传 `endLine = startLine - 1`（即不覆盖任何已有行），纯删除传空的 `newLines`。
 * range 的字段与解析结果里的 ISentence 一致，可以直接把语句传进来。
 */
export const replaceLineRange = <T>(
  lines: T[],
  range: { startLine: number; endLine: number },
  newLines: T[],
): T[] => [
    ...lines.slice(0, range.startLine),
    ...newLines,
    ...lines.slice(range.endLine + 1),
  ];
