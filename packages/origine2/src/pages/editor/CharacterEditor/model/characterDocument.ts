/**
 * @file 合成角色描述文件（figure.json，version: 1）与编辑器模型之间的转换。
 *
 * WebGAL JSON 中 components 与 presets[name] 均按从底到顶（bottom-to-top）排列；
 * 编辑器图层列表采用 PS 习惯的从顶到底（top-to-bottom）排列，解析与序列化时互逆。
 */

export interface ICharacterComponent {
  src: string;
  x?: number;
  y?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  width?: number;
  height?: number;
  rotation?: number;
  /** 保留未识别的扩展字段 */
  extra?: Record<string, unknown>;
}

export interface ICharacterLayer {
  key: string;
  component: ICharacterComponent;
}

export interface ICharacterCanvas {
  width: number;
  height: number;
}

export interface ICharacterDocument {
  fields: Record<string, unknown>;
  canvas?: ICharacterCanvas;
  /** 从顶到底（top-to-bottom）的图层顺序 */
  layers: ICharacterLayer[];
  presets?: Record<string, string[]>;
}

const KNOWN_COMPONENT_KEYS = new Set([
  'src',
  'x',
  'y',
  'scale',
  'scaleX',
  'scaleY',
  'width',
  'height',
  'rotation',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function toFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function tryParsePlainObject(text: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * 判断文本是否可作为合成角色描述文件打开
 */
export function isEditableCharacter(text: string, url: string): boolean {
  const isInFigureDir = /(?:^|\/)game\/figure\//.test(url);
  if (text.trim() === '') return isInFigureDir && /(?:^|\/)figure\.json$/i.test(url);
  const obj = tryParsePlainObject(text);
  if (!obj || Array.isArray(obj.keyframes)) return false;
  if ('FileReferences' in obj || 'motions' in obj) return false;
  if ('skeleton' in obj || 'bones' in obj) return false;
  if (!isPlainObject(obj.components)) return false;
  return obj.version === 1 || (obj.version === undefined && isInFigureDir);
}

/**
 * 解析组件在 X/Y 轴上的有效缩放比，优先 scaleX/scaleY，回退到 scale 或 1
 */
export function resolveComponentScale(comp: ICharacterComponent): { scaleX: number; scaleY: number } {
  const base = comp.scale && comp.scale > 0 ? comp.scale : 1;
  const scaleX = comp.scaleX && comp.scaleX > 0 ? comp.scaleX : base;
  const scaleY = comp.scaleY && comp.scaleY > 0 ? comp.scaleY : base;
  return { scaleX, scaleY };
}

function parseComponent(raw: unknown): ICharacterComponent {
  if (!isPlainObject(raw)) return { src: '' };
  const extraEntries = Object.entries(raw).filter(([k]) => !KNOWN_COMPONENT_KEYS.has(k));
  return {
    src: typeof raw.src === 'string' ? raw.src : '',
    x: toFiniteNumber(raw.x),
    y: toFiniteNumber(raw.y),
    scale: toFiniteNumber(raw.scale),
    scaleX: toFiniteNumber(raw.scaleX),
    scaleY: toFiniteNumber(raw.scaleY),
    width: toFiniteNumber(raw.width),
    height: toFiniteNumber(raw.height),
    rotation: toFiniteNumber(raw.rotation),
    ...(extraEntries.length > 0 ? { extra: Object.fromEntries(extraEntries) } : {}),
  };
}

function parsePresets(raw: unknown): Record<string, string[]> | undefined {
  if (!isPlainObject(raw)) return undefined;
  const entries = Object.entries(raw)
    .filter(([, value]) => Array.isArray(value))
    .map(([key, value]) => [key, (value as unknown[]).filter((item): item is string => typeof item === 'string')]);
  return Object.fromEntries(entries);
}

/**
 * 解析 figure.json 为编辑器文档；新建空文件时初始化默认画布与空图层
 */
export function parseCharacter(text: string): ICharacterDocument {
  if (text.trim() === '') {
    return { fields: { version: 1 }, canvas: { width: 2560, height: 1440 }, layers: [], presets: {} };
  }
  const obj = tryParsePlainObject(text) ?? {};
  const { version: _version, canvas, components, presets, ...restFields } = obj;
  const parsedCanvas =
    isPlainObject(canvas) && isPositiveNumber(canvas.width) && isPositiveNumber(canvas.height)
      ? { width: canvas.width, height: canvas.height }
      : undefined;
  const layers = isPlainObject(components)
    ? Object.entries(components)
      .map(([key, value]) => ({ key, component: parseComponent(value) }))
      .reverse()
    : [];
  return {
    fields: { ...restFields, version: 1 },
    ...(parsedCanvas ? { canvas: parsedCanvas } : {}),
    layers,
    ...(presets !== undefined ? { presets: parsePresets(presets) ?? {} } : {}),
  };
}

function serializeComponent(comp: ICharacterComponent): Record<string, unknown> {
  const hasExplicitSize = (comp.width ?? 0) > 0 && (comp.height ?? 0) > 0;
  const out: Record<string, unknown> = { src: comp.src };
  if (comp.x) out.x = comp.x;
  if (comp.y) out.y = comp.y;
  if (hasExplicitSize) {
    out.width = comp.width;
    out.height = comp.height;
  } else {
    const { scaleX, scaleY } = resolveComponentScale(comp);
    if (scaleX === scaleY) {
      if (scaleX !== 1) out.scale = scaleX;
    } else {
      if (scaleX !== 1) out.scaleX = scaleX;
      if (scaleY !== 1) out.scaleY = scaleY;
    }
  }
  if (comp.rotation) out.rotation = comp.rotation;
  if (comp.extra) Object.assign(out, comp.extra);
  return out;
}

/**
 * 序列化为 WebGAL figure.json（components 恢复为从底到顶顺序）
 */
export function serializeCharacter(doc: ICharacterDocument): string {
  const components = Object.fromEntries(
    [...doc.layers].reverse().map((layer) => [layer.key, serializeComponent(layer.component)]),
  );
  const output: Record<string, unknown> = {
    ...doc.fields,
    version: 1,
    ...(doc.canvas ? { canvas: doc.canvas } : {}),
    components,
    ...(doc.presets !== undefined ? { presets: doc.presets } : {}),
  };
  return JSON.stringify(output, null, 2);
}

/**
 * 按从底到顶的图层顺序筛选集合中的图层名
 */
export function filterLayerKeysBottomToTop(layers: ICharacterLayer[], keySet: Set<string>): string[] {
  return [...layers]
    .reverse()
    .map((layer) => layer.key)
    .filter((key) => keySet.has(key));
}

/**
 * 从文件路径生成不重复的图层名
 */
export function deriveLayerKey(src: string, existingLayers: ICharacterLayer[]): string {
  const fileName = src.split('/').pop() ?? src;
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'layer';
  const existing = new Set(existingLayers.map((layer) => layer.key));
  if (!existing.has(baseName)) return baseName;
  let index = 2;
  while (existing.has(`${baseName}_${index}`)) index += 1;
  return `${baseName}_${index}`;
}

/**
 * 生成不重复的新预设名
 */
export function derivePresetKey(presets: Record<string, string[]>): string {
  let index = 1;
  while (Object.hasOwn(presets, `preset_${index}`)) index += 1;
  return `preset_${index}`;
}

/**
 * 拼接立绘资源 URL，逐段编码路径以兼容空格与特殊字符
 */
export function buildFigureAssetUrl(charDirPath: string, src: string): string {
  const encodedSrc = src.split('/').map(encodeURIComponent).join('/');
  return `/${charDirPath}/${encodedSrc}`;
}
