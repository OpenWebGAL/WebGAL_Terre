import { ICharacterComponent } from '../model/characterDocument';
import { INaturalSize } from './hitTestLayer';
import { IViewportState } from './useCanvasViewport';

export interface IPoint {
  x: number;
  y: number;
}

export type GizmoDragState =
  | { kind: 'rotate'; c0: IPoint; r0: number; startAngle: number }
  | {
    kind: 'resize';
    hx: -1 | 0 | 1;
    hy: -1 | 0 | 1;
    w0: number;
    h0: number;
    anchor: IPoint;
    ux: IPoint;
    uy: IPoint;
    uniformScale: boolean;
  };

export const RESIZE_HANDLES: { id: string; hx: -1 | 0 | 1; hy: -1 | 0 | 1 }[] = [
  { id: 'nw', hx: -1, hy: -1 },
  { id: 'n', hx: 0, hy: -1 },
  { id: 'ne', hx: 1, hy: -1 },
  { id: 'e', hx: 1, hy: 0 },
  { id: 'se', hx: 1, hy: 1 },
  { id: 's', hx: 0, hy: 1 },
  { id: 'sw', hx: -1, hy: 1 },
  { id: 'w', hx: -1, hy: 0 },
];

const RESIZE_CURSORS = ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize'] as const;

export function getResizeCursor(hx: number, hy: number, rotation: number): string {
  const deg = ((((Math.atan2(hy, hx) + rotation) * 180) / Math.PI) % 180 + 180) % 180;
  return RESIZE_CURSORS[Math.round(deg / 45) % 4];
}

export function toStagePoint(
  clientX: number,
  clientY: number,
  context: { viewport: HTMLDivElement | null; view: IViewportState },
): IPoint | null {
  const { viewport, view } = context;
  if (!viewport) return null;
  const rect = viewport.getBoundingClientRect();
  return {
    x: (clientX - rect.left - view.panX) / view.zoom,
    y: (clientY - rect.top - view.panY) / view.zoom,
  };
}

export function computeNextRotation(
  stage: IPoint,
  drag: Extract<GizmoDragState, { kind: 'rotate' }>,
  snap: boolean,
): number | undefined {
  const curAngle = Math.atan2(stage.y - drag.c0.y, stage.x - drag.c0.x);
  const rawRad = drag.r0 + (curAngle - drag.startAngle);
  let rad = Math.atan2(Math.sin(rawRad), Math.cos(rawRad));
  if (snap) {
    const step = Math.PI / 12;
    rad = Math.round(rad / step) * step;
  }
  const rounded = Number(rad.toFixed(3));
  return Math.abs(rounded) < 0.001 ? undefined : rounded;
}

export function computeResizedBox(stage: IPoint, drag: Extract<GizmoDragState, { kind: 'resize' }>) {
  const vx = stage.x - drag.anchor.x;
  const vy = stage.y - drag.anchor.y;
  let nextW = drag.w0;
  let nextH = drag.h0;
  if (drag.hx !== 0 && drag.hy !== 0) {
    const projX = (vx * drag.ux.x + vy * drag.ux.y) * drag.hx;
    const projY = (vx * drag.uy.x + vy * drag.uy.y) * drag.hy;
    const denom = drag.w0 * drag.w0 + drag.h0 * drag.h0;
    const minScale = 1 / Math.max(drag.w0, drag.h0, 1);
    const k = denom > 0 ? Math.max(minScale, (projX * drag.w0 + projY * drag.h0) / denom) : 1;
    nextW = Math.max(1, drag.w0 * k);
    nextH = Math.max(1, drag.h0 * k);
  } else if (drag.hx !== 0) {
    nextW = Math.max(1, (vx * drag.ux.x + vy * drag.ux.y) * drag.hx);
  } else if (drag.hy !== 0) {
    nextH = Math.max(1, (vx * drag.uy.x + vy * drag.uy.y) * drag.hy);
  }
  const nextCx = drag.anchor.x + drag.ux.x * ((drag.hx * nextW) / 2) + drag.uy.x * ((drag.hy * nextH) / 2);
  const nextCy = drag.anchor.y + drag.ux.y * ((drag.hx * nextW) / 2) + drag.uy.y * ((drag.hy * nextH) / 2);
  return {
    x: Math.round(nextCx - nextW / 2),
    y: Math.round(nextCy - nextH / 2),
    width: nextW,
    height: nextH,
  };
}

export function applyResizedComponent(
  prev: ICharacterComponent,
  box: { x: number; y: number; width: number; height: number },
  options: { isCorner: boolean; uniformScale: boolean; naturalSize?: INaturalSize },
): ICharacterComponent {
  const { isCorner, uniformScale, naturalSize } = options;
  const hasExplicitSize = (prev.width ?? 0) > 0 && (prev.height ?? 0) > 0;
  if (hasExplicitSize || !naturalSize || naturalSize.width <= 0 || naturalSize.height <= 0) {
    return {
      ...prev,
      x: box.x,
      y: box.y,
      width: Math.max(1, Math.round(box.width)),
      height: Math.max(1, Math.round(box.height)),
    };
  }
  if (isCorner && uniformScale) {
    const scale = Math.max(0.001, Number((box.width / naturalSize.width).toFixed(3)));
    return { ...prev, x: box.x, y: box.y, scale, scaleX: undefined, scaleY: undefined };
  }
  const sx = Math.max(0.001, Number((box.width / naturalSize.width).toFixed(3)));
  const sy = Math.max(0.001, Number((box.height / naturalSize.height).toFixed(3)));
  if (sx === sy) {
    return { ...prev, x: box.x, y: box.y, scale: sx, scaleX: undefined, scaleY: undefined };
  }
  return { ...prev, x: box.x, y: box.y, scale: undefined, scaleX: sx, scaleY: sy };
}
