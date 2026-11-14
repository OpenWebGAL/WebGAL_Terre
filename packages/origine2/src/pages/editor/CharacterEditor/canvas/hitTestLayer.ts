import {
  buildFigureAssetUrl,
  ICharacterCanvas,
  ICharacterComponent,
  ICharacterLayer,
  resolveComponentScale,
} from '../model/characterDocument';

export interface INaturalSize {
  width: number;
  height: number;
}

export interface ILayerMetrics {
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
}

const DEFAULT_CANVAS: ICharacterCanvas = { width: 2560, height: 1440 };
const ALPHA_THRESHOLD = 4;

let hitCanvasCtx: CanvasRenderingContext2D | null | undefined;

function getHitContext(): CanvasRenderingContext2D | null {
  if (hitCanvasCtx !== undefined) return hitCanvasCtx;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  hitCanvasCtx = canvas.getContext('2d', { willReadFrequently: true });
  return hitCanvasCtx;
}

/**
 * 与 WebGAL 渲染逻辑一致：优先显式 width/height，否则按自然尺寸乘以 scaleX/scaleY
 */
export function resolveLayerMetrics(comp: ICharacterComponent, natural?: INaturalSize): ILayerMetrics | null {
  const left = comp.x ?? 0;
  const top = comp.y ?? 0;
  const rotation = comp.rotation ?? 0;
  if (comp.width && comp.width > 0 && comp.height && comp.height > 0) {
    return { left, top, width: comp.width, height: comp.height, rotation };
  }
  if (!natural || natural.width <= 0 || natural.height <= 0) return null;
  const { scaleX, scaleY } = resolveComponentScale(comp);
  return { left, top, width: natural.width * scaleX, height: natural.height * scaleY, rotation };
}

/**
 * 未配置 canvas 时根据已加载图层边界（含旋转包络）推断画布大小，回退 2560 × 1440
 */
export function inferCanvasSize(
  layers: ICharacterLayer[],
  naturalSizes: Record<string, INaturalSize>,
  charDirPath: string,
): ICharacterCanvas {
  let maxRight = 0;
  let maxBottom = 0;
  for (const layer of layers) {
    const url = buildFigureAssetUrl(charDirPath, layer.component.src);
    const metrics = resolveLayerMetrics(layer.component, naturalSizes[url]);
    if (!metrics) continue;
    const cx = metrics.left + metrics.width / 2;
    const cy = metrics.top + metrics.height / 2;
    const cos = Math.abs(Math.cos(metrics.rotation));
    const sin = Math.abs(Math.sin(metrics.rotation));
    maxRight = Math.max(maxRight, cx + (cos * metrics.width + sin * metrics.height) / 2);
    maxBottom = Math.max(maxBottom, cy + (sin * metrics.width + cos * metrics.height) / 2);
  }
  if (maxRight <= 0 || maxBottom <= 0) return DEFAULT_CANVAS;
  return { width: Math.max(1, Math.ceil(maxRight)), height: Math.max(1, Math.ceil(maxBottom)) };
}

function toLocalStagePoint(metrics: ILayerMetrics, stageX: number, stageY: number): { x: number; y: number } {
  if (metrics.rotation === 0) return { x: stageX, y: stageY };
  const cx = metrics.left + metrics.width / 2;
  const cy = metrics.top + metrics.height / 2;
  const dx = stageX - cx;
  const dy = stageY - cy;
  const cos = Math.cos(-metrics.rotation);
  const sin = Math.sin(-metrics.rotation);
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

function isOpaqueAtPoint(params: {
  img: HTMLImageElement | undefined;
  metrics: ILayerMetrics;
  stageX: number;
  stageY: number;
}): boolean {
  const { img, metrics, stageX, stageY } = params;
  const local = toLocalStagePoint(metrics, stageX, stageY);
  const inBounds =
    local.x >= metrics.left &&
    local.x < metrics.left + metrics.width &&
    local.y >= metrics.top &&
    local.y < metrics.top + metrics.height;
  if (!inBounds) return false;
  if (!img?.complete || img.naturalWidth <= 0) return true;

  try {
    const ctx = getHitContext();
    if (!ctx) return true;
    const sx = Math.min(img.naturalWidth - 1, Math.max(0, Math.floor(((local.x - metrics.left) / metrics.width) * img.naturalWidth)));
    const sy = Math.min(img.naturalHeight - 1, Math.max(0, Math.floor(((local.y - metrics.top) / metrics.height) * img.naturalHeight)));
    ctx.clearRect(0, 0, 1, 1);
    ctx.drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1);
    return ctx.getImageData(0, 0, 1, 1).data[3] > ALPHA_THRESHOLD;
  } catch {
    return true;
  }
}

/**
 * 从顶到底遍历可见图层，返回指针下首个不透明像素所在的图层
 */
export function findHitLayer(params: {
  layers: ICharacterLayer[];
  visibleKeys: Set<string>;
  naturalSizes: Record<string, INaturalSize>;
  imgElements: Map<string, HTMLImageElement>;
  charDirPath: string;
  stageX: number;
  stageY: number;
}): ICharacterLayer | null {
  const { layers, visibleKeys, naturalSizes, imgElements, charDirPath, stageX, stageY } = params;
  for (const layer of layers) {
    if (!visibleKeys.has(layer.key)) continue;
    const url = buildFigureAssetUrl(charDirPath, layer.component.src);
    const img = imgElements.get(layer.key);
    const natural = naturalSizes[url] ?? (img?.naturalWidth ? { width: img.naturalWidth, height: img.naturalHeight } : undefined);
    const metrics = resolveLayerMetrics(layer.component, natural);
    if (!metrics) continue;
    if (isOpaqueAtPoint({ img, metrics, stageX, stageY })) return layer;
  }
  return null;
}
