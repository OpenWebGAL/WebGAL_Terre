import { arg } from "webgal-parser/src/interface/sceneInterface";

/**
 * 合成要提交的字符串
 * @param commandStr 命令字符串, 若为 undefined, 则隐藏冒号
 * @param content 语句内容
 * @param originalArgs 原始参数数组
 * @param newArgs 新的参数数组, 若 fullMode 为 false, 会将值为 true 的 arg 简写为 -arg, 省略值为 false 或空字符串的 arg
 * @param inlineComment 行内注释
 * @returns 合并后的用于提交的字符串
 */
// eslint-disable-next-line max-params
export function combineSubmitString (
  commandStr: string | undefined,
  content: string,
  originalArgs: Array<arg>,
  newArgs: Array<{key: string, value: string | boolean | number, fullMode?: boolean}>,
  inlineComment: string,
): string {
  const argStrings: Array<string> = [];
  const unsupportedArg = new Map<string, string | boolean | number>();

  originalArgs.forEach(oArg => unsupportedArg.set(oArg.key, oArg.value));
  newArgs.forEach((nArg) => {
    if (!nArg.fullMode && (nArg.value === true || nArg.value === false || nArg.value === "")) {
      if (nArg.value === "") {
        nArg.value = false;
      }
      const simplified = argToSimplifiedString(nArg.key, nArg.value);
      // 关闭的布尔参数会得到空串。它并不是一个参数，必须丢掉：
      // 单行输出时它只是被 join 吞掉，但多行输出会让它白白占据一行。
      if (simplified !== "") {
        argStrings.push(simplified);
      }
    } else {
      argStrings.push(argToString(nArg.key, nArg.value));
    }
    unsupportedArg.delete(nArg.key);
  });

  unsupportedArg.forEach((v, k, m) => {
    argStrings.push(argToString(k, v));
  });

  const head = commandStr === undefined ? content : `${commandStr}:${content}`;
  const tail = inlineComment && inlineComment.trim().length > 0 ? `; ${inlineComment.trim()}` : ";";

  const singleLine = `${head}${argStrings.join("")}${tail}`;
  if (displayWidth(singleLine) <= MULTILINE_THRESHOLD) {
    return singleLine;
  }

  return foldToMultiline(commandStr, head, argStrings, tail) ?? singleLine;
}

/** 合成结果超过这个显示宽度就折成多行，短语句保持单行以免产生大量两行语句 */
const MULTILINE_THRESHOLD = 80;

/** 全角字符（CJK、假名、全角标点等），在等宽字体下占两列 */
const FULL_WIDTH_CHAR = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/;

/**
 * 按显示宽度而非字符数衡量长度。
 * WebGAL 的对白多是中日文，按字符数算的话一行中文要写到 80 字才会折行，实际早已过长。
 */
const displayWidth = (text: string) =>
  [...text].reduce((width, char) => width + (FULL_WIDTH_CHAR.test(char) ? 2 : 1), 0);

/** 续行的缩进。解析器要求续行以空白开头，且首字符为 `-` 或 `|` */
const CONTINUATION_INDENT = "  ";

/**
 * 把过长的语句折成多行：首行放「命令 + 内容」，其后每个参数缩进独占一行。
 *
 * 分号与行内注释只能留在最后一行 —— 写在首行会把后面的续行吞进注释里。
 * 含 `-concat` 的语句不折行，因为解析器遇到 `-concat` 会关闭多行折叠。
 *
 * @returns 折行后的语句；无法安全折行时返回 undefined，调用方回退到单行
 */
// eslint-disable-next-line max-params
function foldToMultiline(
  commandStr: string | undefined,
  head: string,
  argStrings: string[],
  tail: string,
): string | undefined {
  if (argStrings.some(argString => argString.startsWith(" -concat")) || head.includes("\n")) {
    return undefined;
  }

  // intro 的内容用 `|` 分隔多段文字，是最容易超长的命令，一并拆开（转义过的 `\|` 不算分隔符）
  const contentSegments = commandStr === "intro" ? head.split(/(?<!\\)\|/) : [head];
  const lines = [contentSegments[0]];
  contentSegments.slice(1).forEach(segment => lines.push(`${CONTINUATION_INDENT}|${segment}`));
  argStrings.forEach(argString => lines.push(`${CONTINUATION_INDENT}${argString.trim()}`));

  if (lines.length === 1) {
    return undefined; // 没有可以拆到续行的部分
  }

  return lines.join("\n") + tail;
}

/**
 * 单个参数转换为字符串的通用函数
 * @param key 参数的键
 * @param value 参数的值
 * @returns 转换后的字符串
 */
export function argToString(
  key: string,
  value: string | boolean | number,
): string {
  return ` -${key}=${value}`;
}

/**
 * 单个布尔参数转换为简写字符串的函数
 * @param key 参数的键
 * @param value 参数的值
 * @returns 转换后的字符串
 */
export function argToSimplifiedString(
  key: string,
  value: boolean,
): string {
  if (value) {
    return ` -${key}`;
  } else {
    return ``;
  }
}
