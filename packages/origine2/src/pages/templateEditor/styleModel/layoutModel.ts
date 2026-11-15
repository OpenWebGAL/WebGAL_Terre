import { patchRuleDeclarations, readRuleDeclarations } from './cssAstAdapter';
import { buildFourSidePatch, FourSides, parseFourSidePx } from './shorthandResolver';
import { LayoutFields } from './types';
import { formatPx, parsePx } from './valueParsers';

const DIRECT_LAYOUT_PROPS = ['left', 'top', 'width', 'height'] as const;

const SIZE_CONSTRAINT_AXES = {
  width: { min: 'min-width', max: 'max-width', start: 'left', end: 'right' },
  height: { min: 'min-height', max: 'max-height', start: 'top', end: 'bottom' },
} as const;

export interface PartLogicalBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PartDragLayoutSnapshot {
  positionMode: 'static-to-relative' | 'relative' | 'absolute';
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  hasNonPxRight: boolean;
  hasNonPxBottom: boolean;
  clearMinWidth: boolean;
  clearMaxWidth: boolean;
  clearMinHeight: boolean;
  clearMaxHeight: boolean;
  box: PartLogicalBox;
}

export function parsePartLayout(scssText: string, selector: string): LayoutFields {
  const decls = readRuleDeclarations(scssText, selector, 'default');
  const padding = parseFourSidePx(decls, 'padding');
  const margin = parseFourSidePx(decls, 'margin');

  return {
    left: parsePx(decls.left),
    top: parsePx(decls.top),
    width: parsePx(decls.width),
    height: parsePx(decls.height),
    paddingTop: padding.top,
    paddingRight: padding.right,
    paddingBottom: padding.bottom,
    paddingLeft: padding.left,
    marginTop: margin.top,
    marginRight: margin.right,
    marginBottom: margin.bottom,
    marginLeft: margin.left,
  };
}

function mergeSides(
  current: FourSides,
  patch: Partial<LayoutFields>,
  prefix: 'padding' | 'margin',
): { touched: boolean; sides: FourSides } {
  const keys = {
    top: `${prefix}Top` as keyof LayoutFields,
    right: `${prefix}Right` as keyof LayoutFields,
    bottom: `${prefix}Bottom` as keyof LayoutFields,
    left: `${prefix}Left` as keyof LayoutFields,
  };

  const touched = Object.values(keys).some((k) => k in patch);
  if (!touched) return { touched: false, sides: current };

  return {
    touched: true,
    sides: {
      top: keys.top in patch ? patch[keys.top] : current.top,
      right: keys.right in patch ? patch[keys.right] : current.right,
      bottom: keys.bottom in patch ? patch[keys.bottom] : current.bottom,
      left: keys.left in patch ? patch[keys.left] : current.left,
    },
  };
}

export function applyPartLayoutPatch(
  scssText: string,
  selector: string,
  patch: Partial<LayoutFields>,
): string {
  const decls = readRuleDeclarations(scssText, selector, 'default');
  const updates: Record<string, string | null> = {};

  for (const prop of DIRECT_LAYOUT_PROPS) {
    if (!(prop in patch)) continue;
    const val = patch[prop];
    const isValidNum = typeof val === 'number' && Number.isFinite(val);
    updates[prop] = isValidNum ? formatPx(val) : null;
    if (isValidNum && (prop === 'width' || prop === 'height')) {
      const axis = SIZE_CONSTRAINT_AXES[prop];
      if (decls[axis.min] !== undefined && parsePx(decls[axis.min]) !== 0) {
        updates[axis.min] = null;
      }
      if (decls[axis.max] !== undefined) {
        updates[axis.max] = null;
      }
      if (decls[axis.start] !== undefined && decls[axis.end] !== undefined) {
        updates[axis.end] = null;
      }
    }
  }

  const paddingMerged = mergeSides(parseFourSidePx(decls, 'padding'), patch, 'padding');
  if (paddingMerged.touched) {
    Object.assign(updates, buildFourSidePatch('padding', paddingMerged.sides));
  }

  const marginMerged = mergeSides(parseFourSidePx(decls, 'margin'), patch, 'margin');
  if (marginMerged.touched) {
    Object.assign(updates, buildFourSidePatch('margin', marginMerged.sides));
  }

  return patchRuleDeclarations({ scssText, selector, state: 'default', updates });
}

export function capturePartDragSnapshot(
  scssText: string,
  selector: string,
  box: PartLogicalBox,
): PartDragLayoutSnapshot {
  const decls = readRuleDeclarations(scssText, selector, 'default');
  const rawPos = decls.position?.trim().toLowerCase();
  const left = parsePx(decls.left);
  const right = parsePx(decls.right);
  const top = parsePx(decls.top);
  const bottom = parsePx(decls.bottom);
  const hasNonPxRight = decls.right !== undefined && right === undefined;
  const hasNonPxBottom = decls.bottom !== undefined && bottom === undefined;
  const sizeConstraints = {
    clearMinWidth: decls['min-width'] !== undefined && parsePx(decls['min-width']) !== 0,
    clearMaxWidth: decls['max-width'] !== undefined,
    clearMinHeight: decls['min-height'] !== undefined && parsePx(decls['min-height']) !== 0,
    clearMaxHeight: decls['max-height'] !== undefined,
  };

  if (rawPos === 'absolute' || rawPos === 'fixed') {
    return {
      positionMode: 'absolute',
      left,
      right,
      top,
      bottom,
      hasNonPxRight,
      hasNonPxBottom,
      ...sizeConstraints,
      box,
    };
  }

  if (rawPos === 'relative') {
    return {
      positionMode: 'relative',
      left: left ?? 0,
      top: top ?? 0,
      hasNonPxRight: false,
      hasNonPxBottom: false,
      ...sizeConstraints,
      box,
    };
  }

  return {
    positionMode: 'static-to-relative',
    left: 0,
    top: 0,
    hasNonPxRight: false,
    hasNonPxBottom: false,
    ...sizeConstraints,
    box,
  };
}

interface DragAxisParams {
  startProp: 'left' | 'top';
  endProp: 'right' | 'bottom';
  startVal?: number;
  endVal?: number;
  hasNonPxEnd: boolean;
  fallbackStart: number;
  delta: number;
}

function buildDragAxisUpdate({
  startProp,
  endProp,
  startVal,
  endVal,
  hasNonPxEnd,
  fallbackStart,
  delta,
}: DragAxisParams): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  if (startVal !== undefined && endVal !== undefined) {
    result[startProp] = formatPx(Math.round(startVal + delta));
    result[endProp] = formatPx(Math.round(endVal - delta));
  } else if (startVal !== undefined) {
    result[startProp] = formatPx(Math.round(startVal + delta));
  } else if (endVal !== undefined) {
    result[endProp] = formatPx(Math.round(endVal - delta));
  } else {
    result[startProp] = formatPx(Math.round(fallbackStart + delta));
    if (hasNonPxEnd) {
      result[endProp] = null;
    }
  }
  return result;
}

export interface ApplyPartDragDeltaOptions {
  scssText: string;
  selector: string;
  snapshot: PartDragLayoutSnapshot;
  dx: number;
  dy: number;
}

export function applyPartDragDelta({
  scssText,
  selector,
  snapshot,
  dx,
  dy,
}: ApplyPartDragDeltaOptions): string {
  const updates: Record<string, string | null> = {};

  if (snapshot.positionMode === 'absolute') {
    Object.assign(
      updates,
      buildDragAxisUpdate({
        startProp: 'left',
        endProp: 'right',
        startVal: snapshot.left,
        endVal: snapshot.right,
        hasNonPxEnd: snapshot.hasNonPxRight,
        fallbackStart: snapshot.box.x,
        delta: dx,
      }),
      buildDragAxisUpdate({
        startProp: 'top',
        endProp: 'bottom',
        startVal: snapshot.top,
        endVal: snapshot.bottom,
        hasNonPxEnd: snapshot.hasNonPxBottom,
        fallbackStart: snapshot.box.y,
        delta: dy,
      }),
    );
  } else {
    if (snapshot.positionMode === 'static-to-relative') {
      updates.position = 'relative';
    }
    updates.left = formatPx(Math.round((snapshot.left ?? 0) + dx));
    updates.top = formatPx(Math.round((snapshot.top ?? 0) + dy));
  }

  return patchRuleDeclarations({ scssText, selector, state: 'default', updates });
}

interface ResizeAxisParams {
  startProp: 'left' | 'top';
  endProp: 'right' | 'bottom';
  startVal?: number;
  endVal?: number;
  hasNonPxEnd: boolean;
  fallbackStart: number;
  deltaStart: number;
  deltaSize: number;
}

function buildResizeAxisUpdate({
  startProp,
  endProp,
  startVal,
  endVal,
  hasNonPxEnd,
  fallbackStart,
  deltaStart,
  deltaSize,
}: ResizeAxisParams): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  if (startVal !== undefined && endVal !== undefined) {
    result[startProp] = formatPx(Math.round(startVal + deltaStart));
    result[endProp] = null;
  } else if (startVal !== undefined) {
    if (deltaStart !== 0) {
      result[startProp] = formatPx(Math.round(startVal + deltaStart));
    }
  } else if (endVal !== undefined) {
    if (deltaStart !== 0 || deltaSize !== 0) {
      result[endProp] = formatPx(Math.round(endVal - (deltaStart + deltaSize)));
    }
  } else if (deltaStart !== 0) {
    result[startProp] = formatPx(Math.round(fallbackStart + deltaStart));
    if (hasNonPxEnd) {
      result[endProp] = null;
    }
  }
  return result;
}

export interface ApplyPartResizeBoxOptions {
  scssText: string;
  selector: string;
  snapshot: PartDragLayoutSnapshot;
  dx: number;
  dy: number;
  nextWidth: number;
  nextHeight: number;
}

export function applyPartResizeBox({
  scssText,
  selector,
  snapshot,
  dx,
  dy,
  nextWidth,
  nextHeight,
}: ApplyPartResizeBoxOptions): string {
  const roundedWidth = Math.max(1, Math.round(nextWidth));
  const roundedHeight = Math.max(1, Math.round(nextHeight));
  const dWidth = roundedWidth - Math.round(snapshot.box.width);
  const dHeight = roundedHeight - Math.round(snapshot.box.height);
  const changedX = dx !== 0 || dWidth !== 0;
  const changedY = dy !== 0 || dHeight !== 0;
  if (!changedX && !changedY) return scssText;

  const updates: Record<string, string | null> = {};
  if (changedX) {
    updates.width = formatPx(roundedWidth);
    if (snapshot.clearMinWidth) updates['min-width'] = null;
    if (snapshot.clearMaxWidth) updates['max-width'] = null;
  }
  if (changedY) {
    updates.height = formatPx(roundedHeight);
    if (snapshot.clearMinHeight) updates['min-height'] = null;
    if (snapshot.clearMaxHeight) updates['max-height'] = null;
  }

  if (snapshot.positionMode === 'absolute') {
    if (changedX) {
      Object.assign(
        updates,
        buildResizeAxisUpdate({
          startProp: 'left',
          endProp: 'right',
          startVal: snapshot.left,
          endVal: snapshot.right,
          hasNonPxEnd: snapshot.hasNonPxRight,
          fallbackStart: snapshot.box.x,
          deltaStart: dx,
          deltaSize: dWidth,
        }),
      );
    }
    if (changedY) {
      Object.assign(
        updates,
        buildResizeAxisUpdate({
          startProp: 'top',
          endProp: 'bottom',
          startVal: snapshot.top,
          endVal: snapshot.bottom,
          hasNonPxEnd: snapshot.hasNonPxBottom,
          fallbackStart: snapshot.box.y,
          deltaStart: dy,
          deltaSize: dHeight,
        }),
      );
    }
  } else {
    if (snapshot.positionMode === 'static-to-relative') {
      updates.position = 'relative';
    }
    if (changedX && dx !== 0) {
      updates.left = formatPx(Math.round((snapshot.left ?? 0) + dx));
    }
    if (changedY && dy !== 0) {
      updates.top = formatPx(Math.round((snapshot.top ?? 0) + dy));
    }
  }

  return patchRuleDeclarations({ scssText, selector, state: 'default', updates });
}
