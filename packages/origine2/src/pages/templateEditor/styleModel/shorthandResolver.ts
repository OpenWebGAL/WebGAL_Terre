import { BorderBoxValue, BorderImage9SliceValue } from './types';
import {
  formatPx,
  isGradientCss,
  parseFiniteNumber,
  parsePx,
  parseUrlValue,
  sanitizeNoViewportUnit,
  splitTopLevel,
  stripImportant,
} from './valueParsers';

export interface FourSides {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

const SIDE_NAMES = ['top', 'right', 'bottom', 'left'] as const;

export function parseFourSidePx(decls: Record<string, string>, baseProp: 'padding' | 'margin'): FourSides {
  const result: FourSides = {};
  const shorthand = decls[baseProp];

  if (shorthand) {
    const tokens = splitTopLevel(stripImportant(shorthand), 'space').map((t) => parsePx(t));
    if (tokens.length === 1) {
      result.top = tokens[0];
      result.right = tokens[0];
      result.bottom = tokens[0];
      result.left = tokens[0];
    } else if (tokens.length === 2) {
      result.top = tokens[0];
      result.bottom = tokens[0];
      result.right = tokens[1];
      result.left = tokens[1];
    } else if (tokens.length === 3) {
      result.top = tokens[0];
      result.right = tokens[1];
      result.left = tokens[1];
      result.bottom = tokens[2];
    } else if (tokens.length >= 4) {
      result.top = tokens[0];
      result.right = tokens[1];
      result.bottom = tokens[2];
      result.left = tokens[3];
    }
  }

  for (const side of SIDE_NAMES) {
    const longhand = parsePx(decls[`${baseProp}-${side}`]);
    if (longhand !== undefined) {
      result[side] = longhand;
    }
  }

  return result;
}

export function buildFourSidePatch(
  baseProp: 'padding' | 'margin',
  sides: FourSides,
): Record<string, string | null> {
  const { top, right, bottom, left } = sides;
  const patch: Record<string, string | null> = {};

  if (top !== undefined && right !== undefined && bottom !== undefined && left !== undefined) {
    const t = formatPx(top);
    const r = formatPx(right);
    const b = formatPx(bottom);
    const l = formatPx(left);

    if (t === r && r === b && b === l) {
      patch[baseProp] = t;
    } else if (t === b && r === l) {
      patch[baseProp] = `${t} ${r}`;
    } else {
      patch[baseProp] = `${t} ${r} ${b} ${l}`;
    }

    for (const side of SIDE_NAMES) {
      patch[`${baseProp}-${side}`] = null;
    }
    return patch;
  }

  patch[baseProp] = null;
  for (const side of SIDE_NAMES) {
    const val = sides[side];
    patch[`${baseProp}-${side}`] = val !== undefined ? formatPx(val) : null;
  }
  return patch;
}

export function isTextBackgroundClip(decls: Record<string, string>): boolean {
  const clip = stripImportant(decls['background-clip'] ?? '').toLowerCase();
  const webkitClip = stripImportant(decls['-webkit-background-clip'] ?? '').toLowerCase();
  return clip === 'text' || webkitClip === 'text';
}

export function extractBackgroundGradientOrColor(decls: Record<string, string>): {
  gradient?: string;
  solidColor?: string;
  imageUrl?: string;
  size?: string;
  repeat?: string;
  position?: string;
} {
  const rawBg = decls['background'] ? stripImportant(decls['background']) : undefined;
  const rawImage = decls['background-image'] ? stripImportant(decls['background-image']) : undefined;
  const rawColor = decls['background-color'] ? stripImportant(decls['background-color']) : undefined;

  let gradient: string | undefined;
  let solidColor: string | undefined;
  let imageUrl: string | undefined;
  let size = decls['background-size'] ? stripImportant(decls['background-size']) : undefined;
  let repeat = decls['background-repeat'] ? stripImportant(decls['background-repeat']) : undefined;
  let position = decls['background-position'] ? stripImportant(decls['background-position']) : undefined;

  if (rawBg && rawBg.toLowerCase() !== 'none') {
    const tokens = splitTopLevel(rawBg, 'space');
    const urlToken = tokens.find((t) => /^url\(/i.test(t));
    const gradToken = tokens.find((t) => isGradientCss(t));

    if (gradToken) {
      gradient = gradToken;
    } else if (urlToken) {
      imageUrl = parseUrlValue(urlToken);
      const repeatToken = tokens.find((t) => /^(?:no-repeat|repeat-x|repeat-y|repeat|space|round)$/i.test(t));
      if (!repeat && repeatToken) repeat = repeatToken;
      const slashToken = tokens.find((t) => t.includes('/'));
      if (slashToken) {
        const [posPart, sizePart] = slashToken.split('/');
        if (!position && posPart?.trim()) position = posPart.trim();
        if (!size && sizePart?.trim()) size = sizePart.trim();
      }
    } else if (rawBg.toLowerCase() !== 'transparent') {
      solidColor = rawBg;
    } else {
      solidColor = 'transparent';
    }
  }

  if (rawImage && rawImage.toLowerCase() !== 'none') {
    if (isGradientCss(rawImage)) {
      gradient = rawImage;
    } else {
      const parsedUrl = parseUrlValue(rawImage);
      if (parsedUrl) imageUrl = parsedUrl;
    }
  }

  if (rawColor && !gradient && !imageUrl) {
    solidColor = rawColor;
  }

  return {
    gradient,
    solidColor,
    imageUrl,
    size: sanitizeNoViewportUnit(size),
    repeat,
    position: sanitizeNoViewportUnit(position),
  };
}

const BORDER_STYLES = new Set(['none', 'solid', 'dashed', 'double']);
const ALL_CSS_LINE_STYLES = new Set([
  'none',
  'hidden',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
]);

export function parseBorderBox(decls: Record<string, string>): BorderBoxValue {
  const result: BorderBoxValue = {};

  if (decls['border-radius']) {
    const tokens = splitTopLevel(stripImportant(decls['border-radius']), 'space');
    const radiusPx = parsePx(tokens[0]);
    if (radiusPx !== undefined) result.radiusPx = radiusPx;
  }

  if (decls['border']) {
    const raw = stripImportant(decls['border']);
    if (raw.toLowerCase() === 'none' || raw === '0') {
      result.borderStyle = 'none';
      result.borderWidthPx = 0;
    } else {
      const tokens = splitTopLevel(raw, 'space');
      const colorTokens: string[] = [];
      for (const token of tokens) {
        const lower = token.toLowerCase();
        const px = parsePx(token);
        if (px !== undefined && result.borderWidthPx === undefined) {
          result.borderWidthPx = px;
        } else if (ALL_CSS_LINE_STYLES.has(lower)) {
          if (BORDER_STYLES.has(lower)) {
            result.borderStyle = lower as BorderBoxValue['borderStyle'];
          }
        } else {
          colorTokens.push(token);
        }
      }
      if (colorTokens.length > 0) {
        result.borderColor = colorTokens.join(' ');
      }
    }
  }

  const widthOverride = parsePx(decls['border-width']);
  if (widthOverride !== undefined) result.borderWidthPx = widthOverride;

  const styleOverride = stripImportant(decls['border-style'] ?? '').toLowerCase();
  if (BORDER_STYLES.has(styleOverride)) {
    result.borderStyle = styleOverride as BorderBoxValue['borderStyle'];
  }

  if (decls['border-color']) {
    result.borderColor = stripImportant(decls['border-color']);
  }

  return result;
}

export function parseBorderImage9Slice(decls: Record<string, string>): BorderImage9SliceValue {
  const fallback: BorderImage9SliceValue = {
    enabled: false,
    imageUrl: '',
    sliceTop: 16,
    sliceRight: 16,
    sliceBottom: 16,
    sliceLeft: 16,
    fill: true,
    widthPx: 16,
    repeat: 'stretch',
  };

  let imageUrl = parseUrlValue(decls['border-image-source']);
  let sliceRaw = decls['border-image-slice'] ? stripImportant(decls['border-image-slice']) : undefined;
  let widthPx = parsePx(decls['border-image-width']) ?? parsePx(decls['border-width']);
  let repeatRaw = decls['border-image-repeat'] ? stripImportant(decls['border-image-repeat']).toLowerCase() : undefined;

  if (!imageUrl && decls['border-image'] && stripImportant(decls['border-image']).toLowerCase() !== 'none') {
    const parts = splitTopLevel(stripImportant(decls['border-image']), 'space');
    const urlToken = parts.find((p) => /^url\(/i.test(p));
    if (urlToken) imageUrl = parseUrlValue(urlToken);
    const repeatToken = parts.find((p) => /^(?:stretch|repeat|round)$/i.test(p));
    if (repeatToken) repeatRaw = repeatToken.toLowerCase();
    const numericSlices = parts.filter((p) => /^\d+(?:\.\d+)?$/.test(p));
    if (numericSlices.length > 0) {
      sliceRaw = [...numericSlices, ...(parts.includes('fill') ? ['fill'] : [])].join(' ');
    }
  }

  if (!imageUrl) return fallback;

  let sliceTop = 16;
  let sliceRight = 16;
  let sliceBottom = 16;
  let sliceLeft = 16;
  let fill = false;

  if (sliceRaw) {
    const tokens = splitTopLevel(sliceRaw, 'space');
    fill = tokens.some((t) => t.toLowerCase() === 'fill');
    const nums = tokens
      .filter((t) => t.toLowerCase() !== 'fill')
      .map((t) => parseFiniteNumber(t))
      .filter((n): n is number => n !== undefined);

    if (nums.length === 1) {
      [sliceTop, sliceRight, sliceBottom, sliceLeft] = [nums[0], nums[0], nums[0], nums[0]];
    } else if (nums.length === 2) {
      [sliceTop, sliceBottom] = [nums[0], nums[0]];
      [sliceRight, sliceLeft] = [nums[1], nums[1]];
    } else if (nums.length === 3) {
      [sliceTop, sliceRight, sliceBottom, sliceLeft] = [nums[0], nums[1], nums[2], nums[1]];
    } else if (nums.length >= 4) {
      [sliceTop, sliceRight, sliceBottom, sliceLeft] = nums;
    }
  }

  const repeat: BorderImage9SliceValue['repeat'] =
    repeatRaw === 'repeat' || repeatRaw === 'round' ? repeatRaw : 'stretch';

  return {
    enabled: true,
    imageUrl,
    sliceTop,
    sliceRight,
    sliceBottom,
    sliceLeft,
    fill,
    widthPx: widthPx ?? sliceTop,
    repeat,
  };
}
