import { arg } from 'webgal-parser/src/interface/sceneInterface';

/**
 * 合成要提交的字符串
 * @param commandStr 命令字符串, 若为 undefined, 则隐藏冒号
 * @param content 语句内容
 * @param originalArgs 原始参数数组
 * @param newArgs 新的参数数组, 若 fullMode 为 false, 会将值为 true 的 arg 简写为 -arg, 省略值为 false 或空字符串的 arg
 * @returns 合并后的用于提交的字符串
 */
// eslint-disable-next-line max-params
export function combineSubmitString(
  commandStr: string | undefined,
  content: string,
  originalArgs: Array<arg>,
  newArgs: Array<{ key: string; value: string | boolean | number; fullMode?: boolean }>,
  comment: string,
): string {
  const argStrings: Array<string> = [];
  const unsupportedArg = new Map<string, string | boolean | number>();

  originalArgs.forEach((oArg) => unsupportedArg.set(oArg.key, oArg.value));
  newArgs.forEach((nArg) => {
    if (!nArg.fullMode && (nArg.value === true || nArg.value === false || nArg.value === '')) {
      if (nArg.value === '') {
        nArg.value = false;
      }
      argStrings.push(argToSimplifiedString(nArg.key, nArg.value));
    } else {
      argStrings.push(argToString(nArg.key, nArg.value));
    }
    unsupportedArg.delete(nArg.key);
  });

  unsupportedArg.forEach((v, k, m) => {
    argStrings.push(argToString(k, v));
  });

  let combinedString = '';
  if (commandStr !== undefined) {
    combinedString += `${commandStr}:`;
  }
  combinedString += `${content}${argStrings.join('')};${comment || ''}`;

  return combinedString;
}

/**
 * 单个参数转换为字符串的通用函数
 * @param key 参数的键
 * @param value 参数的值
 * @returns 转换后的字符串
 */
export function argToString(key: string, value: string | boolean | number): string {
  return ` -${key}=${value}`;
}

/**
 * 单个布尔参数转换为简写字符串的函数
 * @param key 参数的键
 * @param value 参数的值
 * @returns 转换后的字符串
 */
export function argToSimplifiedString(key: string, value: boolean): string {
  if (value) {
    return ` -${key}`;
  } else {
    return ``;
  }
}
