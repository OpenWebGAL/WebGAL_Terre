import { patchRuleDeclarations, readRuleDeclarations } from './cssAstAdapter';
import { buildFourSidePatch, FourSides, parseFourSidePx } from './shorthandResolver';
import { LayoutFields } from './types';
import { formatPx, parsePx } from './valueParsers';

const DIRECT_LAYOUT_PROPS = ['left', 'top', 'width', 'height'] as const;

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
    updates[prop] = typeof val === 'number' && Number.isFinite(val) ? formatPx(val) : null;
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
