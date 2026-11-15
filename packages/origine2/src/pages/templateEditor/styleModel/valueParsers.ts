import { MaskFadeValue, ShadowValue } from './types';

export function stripImportant(raw: string): string {
  return raw.replace(/\s*!important\s*$/i, '').trim();
}

const VIEWPORT_UNIT_RE = /\d+(?:\.\d+)?v[wh]\b/i;

export function sanitizeNoViewportUnit(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = stripImportant(raw);
  if (!cleaned || VIEWPORT_UNIT_RE.test(cleaned)) return undefined;
  return cleaned;
}

export function splitTopLevel(input: string, delimiter: 'space' | 'comma'): string[] {
  const result: string[] = [];
  let current = '';
  let parenDepth = 0;
  let quoteChar: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (quoteChar) {
      current += ch;
      if (ch === quoteChar && input[i - 1] !== '\\') {
        quoteChar = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quoteChar = ch;
      current += ch;
      continue;
    }

    if (ch === '(') {
      parenDepth += 1;
      current += ch;
      continue;
    }

    if (ch === ')' && parenDepth > 0) {
      parenDepth -= 1;
      current += ch;
      continue;
    }

    const isSep =
      parenDepth === 0 &&
      (delimiter === 'comma' ? ch === ',' : /\s/.test(ch));

    if (isSep) {
      const trimmed = current.trim();
      if (trimmed) result.push(trimmed);
      current = '';
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail) result.push(tail);
  return result;
}

export function parsePx(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const cleaned = stripImportant(raw);
  if (cleaned === '0') return 0;
  const match = cleaned.match(/^(-?\d+(?:\.\d+)?)px$/i);
  if (!match) return undefined;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : undefined;
}

export function formatPx(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return `${Object.is(rounded, -0) ? 0 : rounded}px`;
}

export function parseFiniteNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const cleaned = stripImportant(raw);
  if (!/^-?\d+(?:\.\d+)?$/.test(cleaned)) return undefined;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : undefined;
}

export function parseUrlValue(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = stripImportant(raw);
  const match = cleaned.match(/^url\(([\s\S]+)\)$/i);
  if (!match) return undefined;
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

export function formatUrlValue(url: string): string {
  const escaped = url.trim().replace(/"/g, '\\"');
  return `url("${escaped}")`;
}

export function isGradientCss(raw: string | undefined): boolean {
  if (!raw) return false;
  return /^(?:linear|radial|conic|repeating-linear|repeating-radial)-gradient\(/i.test(stripImportant(raw));
}

const DIRECTION_TO_ANGLE: Record<string, number> = {
  'to top': 0,
  'to top right': 45,
  'to right top': 45,
  'to right': 90,
  'to bottom right': 135,
  'to right bottom': 135,
  'to bottom': 180,
  'to bottom left': 225,
  'to left bottom': 225,
  'to left': 270,
  'to top left': 315,
  'to left top': 315,
};

function stripColorStopPosition(stop: string): string {
  const tokens = splitTopLevel(stop, 'space');
  return tokens[0] ?? stop.trim();
}

export function parseLinearGradient(raw: string | undefined): {
  gradientCss: string;
  angle: number;
  startColor: string;
  endColor: string;
} | undefined {
  if (!raw) return undefined;
  const cleaned = stripImportant(raw);
  const match = cleaned.match(/^linear-gradient\(([\s\S]+)\)$/i);
  if (!match) return undefined;

  const args = splitTopLevel(match[1], 'comma');
  if (args.length < 2) return undefined;

  let angle = 180;
  let colorStartIndex = 0;
  const firstLower = args[0].toLowerCase().replace(/\s+/g, ' ');
  const degMatch = firstLower.match(/^(-?\d+(?:\.\d+)?)deg$/);

  if (degMatch) {
    angle = Number(degMatch[1]);
    colorStartIndex = 1;
  } else if (firstLower in DIRECTION_TO_ANGLE) {
    angle = DIRECTION_TO_ANGLE[firstLower];
    colorStartIndex = 1;
  }

  const stops = args.slice(colorStartIndex);
  if (stops.length < 2) return undefined;

  return {
    gradientCss: cleaned,
    angle,
    startColor: stripColorStopPosition(stops[0]),
    endColor: stripColorStopPosition(stops[stops.length - 1]),
  };
}

export function buildLinearGradient(angle = 90, startColor = '#ffffff', endColor = '#000000'): string {
  return `linear-gradient(${angle}deg, ${startColor}, ${endColor})`;
}

export function parseShadow(raw: string | undefined, hasSpread: boolean): ShadowValue {
  const fallback: ShadowValue = {
    enabled: false,
    offsetX: 0,
    offsetY: 2,
    blur: 4,
    ...(hasSpread ? { spread: 0, inset: false } : {}),
    color: 'rgba(0, 0, 0, 0.5)',
  };

  if (!raw) return fallback;
  const cleaned = stripImportant(raw);
  if (!cleaned || cleaned === 'none') return fallback;

  const firstLayer = splitTopLevel(cleaned, 'comma')[0];
  if (!firstLayer) return fallback;

  const tokens = splitTopLevel(firstLayer, 'space');
  let inset = false;
  const lengths: number[] = [];
  const colorParts: string[] = [];

  for (const token of tokens) {
    if (token.toLowerCase() === 'inset') {
      inset = true;
      continue;
    }
    const px = parsePx(token);
    if (px !== undefined) {
      lengths.push(px);
    } else {
      colorParts.push(token);
    }
  }

  if (lengths.length < 2) return fallback;

  return {
    enabled: true,
    offsetX: lengths[0] ?? 0,
    offsetY: lengths[1] ?? 0,
    blur: lengths[2] ?? 0,
    ...(hasSpread ? { spread: lengths[3] ?? 0, inset } : {}),
    color: colorParts.join(' ') || 'rgba(0, 0, 0, 0.5)',
  };
}

export function formatShadow(shadow: ShadowValue, hasSpread: boolean): string | null {
  if (!shadow.enabled) return null;
  const parts: string[] = [];
  if (hasSpread && shadow.inset) {
    parts.push('inset');
  }
  parts.push(formatPx(shadow.offsetX), formatPx(shadow.offsetY), formatPx(shadow.blur));
  if (hasSpread) {
    parts.push(formatPx(shadow.spread ?? 0));
  }
  parts.push(shadow.color.trim() || 'rgba(0, 0, 0, 0.5)');
  return parts.join(' ');
}

const ANGLE_TO_MASK_DIRECTION: Record<number, MaskFadeValue['direction']> = {
  0: 'to top',
  90: 'to right',
  180: 'to bottom',
  270: 'to left',
};

function extractPercent(stop: string, fallback: number): number {
  const match = stop.match(/(-?\d+(?:\.\d+)?)%/);
  return match ? Number(match[1]) : fallback;
}

export function parseMaskFade(raw: string | undefined): MaskFadeValue {
  const fallback: MaskFadeValue = {
    enabled: false,
    direction: 'to bottom',
    startPercent: 70,
    endPercent: 100,
  };

  if (!raw) return fallback;
  const cleaned = stripImportant(raw);
  if (!cleaned || cleaned === 'none') return fallback;

  const match = cleaned.match(/^linear-gradient\(([\s\S]+)\)$/i);
  if (!match) return fallback;

  const args = splitTopLevel(match[1], 'comma');
  if (args.length < 2) return fallback;

  let direction: MaskFadeValue['direction'] = 'to bottom';
  let stopIndex = 0;
  const firstLower = args[0].toLowerCase().replace(/\s+/g, ' ');

  if (firstLower === 'to bottom' || firstLower === 'to top' || firstLower === 'to right' || firstLower === 'to left') {
    direction = firstLower;
    stopIndex = 1;
  } else {
    const degMatch = firstLower.match(/^(-?\d+(?:\.\d+)?)deg$/);
    if (degMatch) {
      const normalized = ((Number(degMatch[1]) % 360) + 360) % 360;
      direction = ANGLE_TO_MASK_DIRECTION[normalized] ?? 'to bottom';
      stopIndex = 1;
    }
  }

  const stops = args.slice(stopIndex);
  if (stops.length < 2) return fallback;

  return {
    enabled: true,
    direction,
    startPercent: extractPercent(stops[0], 0),
    endPercent: extractPercent(stops[stops.length - 1], 100),
  };
}

export function formatMaskFade(mask: MaskFadeValue): string | null {
  if (!mask.enabled) return null;
  return `linear-gradient(${mask.direction}, rgba(0, 0, 0, 1) ${mask.startPercent}%, rgba(0, 0, 0, 0) ${mask.endPercent}%)`;
}

export function parseBlurPx(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const cleaned = stripImportant(raw);
  if (cleaned === 'none') return undefined;
  const match = cleaned.match(/blur\(\s*([^)]+)\s*\)/i);
  return match ? parsePx(match[1]) : undefined;
}
