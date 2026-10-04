/**
 * @file 动画中与时间轴无关的设置：relative、inherit、relativeCalc。
 * 缺省值与引擎一致，见 WebGAL 仓库的 dev-docs/Animation v2.md
 */
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';

export type RelativeCalc = 'add' | 'multiply' | 'multiplyWithZeroFallback' | 'absolute';

export const RELATIVE_CALCS: RelativeCalc[] = ['add', 'multiply', 'multiplyWithZeroFallback', 'absolute'];

/** 未在 relativeCalc 中指定时，各属性的默认计算方式；表中没有的属性为 absolute */
const DEFAULT_RELATIVE_CALC: Partial<Record<string, RelativeCalc>> = {
  position: 'add',
  rotation: 'add',
  blur: 'add',
  bevel: 'add',
  bevelThickness: 'add',
  bevelRotation: 'add',
  bevelSoftness: 'add',
  bloom: 'add',
  bloomBlur: 'add',
  scale: 'multiplyWithZeroFallback',
};

export function isRelative(fields: Record<string, unknown>): boolean {
  return fields.relative !== false;
}

export function isInherit(fields: Record<string, unknown>): boolean {
  return fields.inherit !== false;
}

/**
 * relativeCalc 的键名是顶层属性名，position.x 这样的路径按 position 查找，即设置同时作用于两轴
 */
export function getCalcKey(path: string): string {
  return path.split('.')[0];
}

export function getDefaultRelativeCalc(path: string): RelativeCalc {
  return DEFAULT_RELATIVE_CALC[getCalcKey(path)] ?? 'absolute';
}

/**
 * 文件中为该属性指定的计算方式，未指定或非法时为 undefined
 */
export function getRelativeCalcOverride(fields: Record<string, unknown>, path: string): RelativeCalc | undefined {
  const relativeCalc = fields.relativeCalc as Record<string, unknown> | undefined;
  const calc = relativeCalc?.[getCalcKey(path)];
  return RELATIVE_CALCS.includes(calc as RelativeCalc) ? (calc as RelativeCalc) : undefined;
}

/**
 * 设置属性的计算方式，calc 为 undefined 时恢复默认。relativeCalc 为空时删去该字段
 */
export function setRelativeCalc(
  fields: Record<string, unknown>,
  path: string,
  calc: RelativeCalc | undefined,
): Record<string, unknown> {
  const key = getCalcKey(path);
  const relativeCalc = { ...omit(fields.relativeCalc as object, key), ...(calc ? { [key]: calc } : {}) };
  return isEmpty(relativeCalc) ? omit(fields, 'relativeCalc') : { ...fields, relativeCalc };
}

/**
 * 帧中的值是否为绝对值：非相对动画，或该属性的计算方式为绝对值
 */
export function isAbsoluteValue(fields: Record<string, unknown>, path: string): boolean {
  return !isRelative(fields) || (getRelativeCalcOverride(fields, path) ?? getDefaultRelativeCalc(path)) === 'absolute';
}

/**
 * 当前基准状态在帧值中的表示：相加时为 0，相乘时为 1，绝对值时为属性的默认值。
 * 用于显示第一个关键帧之前以及没有关键帧的属性的值
 */
export function getNeutralValue(fields: Record<string, unknown>, path: string, defaultValue: number): number {
  if (!isRelative(fields)) return defaultValue;
  const calc = getRelativeCalcOverride(fields, path) ?? getDefaultRelativeCalc(path);
  if (calc === 'add') return 0;
  if (calc === 'absolute') return defaultValue;
  return 1;
}
