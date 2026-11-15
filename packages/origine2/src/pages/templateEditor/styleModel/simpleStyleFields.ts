import { patchRuleDeclarations, readRuleDeclarations } from './cssAstAdapter';
import {
  extractBackgroundGradientOrColor,
  isTextBackgroundClip,
  parseBorderBox,
  parseBorderImage9Slice,
} from './shorthandResolver';
import {
  BackdropBlurValue,
  BackgroundFillValue,
  ColorOrGradientValue,
  PseudoState,
  SimpleStyleModel,
  TextStrokeValue,
} from './types';
import {
  buildLinearGradient,
  formatMaskFade,
  formatPx,
  formatShadow,
  formatUrlValue,
  parseBlurPx,
  parseFiniteNumber,
  parseLinearGradient,
  isGradientCss,
  parseMaskFade,
  parsePx,
  parseShadow,
  sanitizeNoViewportUnit,
  splitTopLevel,
  stripImportant,
} from './valueParsers';

type StyleUpdater<K extends keyof SimpleStyleModel> = (
  decls: Record<string, string>,
  value: SimpleStyleModel[K],
) => Record<string, string | null | undefined>;

function parseTextFill(decls: Record<string, string>): ColorOrGradientValue {
  if (isTextBackgroundClip(decls)) {
    const rawBg = decls.background ? stripImportant(decls.background) : undefined;
    const rawImage = decls['background-image'] ? stripImportant(decls['background-image']) : undefined;
    const candidate = (rawImage && rawImage.toLowerCase() !== 'none' ? rawImage : undefined)
      ?? (rawBg && rawBg.toLowerCase() !== 'none' ? rawBg : undefined);
    if (candidate) {
      const parsed = parseLinearGradient(candidate);
      if (parsed) {
        return {
          mode: 'gradient',
          angle: parsed.angle,
          stops: parsed.stops,
          startColor: parsed.startColor,
          endColor: parsed.endColor,
        };
      }
      return { mode: 'custom', rawCss: candidate };
    }
  }

  const rawColor = decls.color ? stripImportant(decls.color) : undefined;
  if (rawColor && rawColor.toLowerCase() !== 'transparent') {
    return { mode: 'solid', solidColor: rawColor };
  }

  return { mode: 'none' };
}

function parseTextStroke(decls: Record<string, string>): TextStrokeValue {
  const raw = decls['-webkit-text-stroke'] ? stripImportant(decls['-webkit-text-stroke']) : undefined;
  if (raw && raw.toLowerCase() !== 'none') {
    const tokens = splitTopLevel(raw, 'space');
    const widthPx = parsePx(tokens[0]);
    if (widthPx !== undefined && widthPx > 0) {
      return {
        enabled: true,
        widthPx,
        color: tokens.slice(1).join(' ') || '#000000',
      };
    }
  }

  const widthFallback = parsePx(decls['-webkit-text-stroke-width']);
  if (widthFallback !== undefined && widthFallback > 0) {
    return {
      enabled: true,
      widthPx: widthFallback,
      color: decls['-webkit-text-stroke-color'] ? stripImportant(decls['-webkit-text-stroke-color']) : '#000000',
    };
  }

  return { enabled: false, widthPx: 2, color: '#000000' };
}

function isComplexBackgroundValue(raw: string | undefined): boolean {
  if (!raw) return false;
  const lower = raw.toLowerCase();
  if (lower === 'none' || lower === 'transparent') return false;
  const layers = splitTopLevel(raw, 'comma');
  if (layers.length > 1) return true;
  const tokens = splitTopLevel(layers[0], 'space');
  return tokens.some((token) => isGradientCss(token)) && !parseLinearGradient(layers[0]);
}

function parseBackgroundFill(decls: Record<string, string>): BackgroundFillValue {
  if (isTextBackgroundClip(decls)) {
    return { mode: 'none' };
  }

  const rawBg = decls.background ? stripImportant(decls.background) : undefined;
  const rawImage = decls['background-image'] ? stripImportant(decls['background-image']) : undefined;

  if (isComplexBackgroundValue(rawImage)) {
    return { mode: 'custom', rawCss: rawImage };
  }
  if (isComplexBackgroundValue(rawBg)) {
    return { mode: 'custom', rawCss: rawBg };
  }
  if (rawBg && rawBg.toLowerCase() !== 'none' && rawImage && rawImage.toLowerCase() !== 'none') {
    return { mode: 'custom', rawCss: `${rawBg}; background-image: ${rawImage}` };
  }

  const bg = extractBackgroundGradientOrColor(decls);
  if (bg.imageUrl) {
    return {
      mode: 'image',
      imageUrl: bg.imageUrl,
      size: bg.size ?? 'cover',
      repeat: bg.repeat ?? 'no-repeat',
      position: bg.position ?? 'center',
    };
  }

  if (bg.gradient) {
    const parsed = parseLinearGradient(bg.gradient);
    if (!parsed) {
      return { mode: 'custom', rawCss: bg.gradient };
    }
    return {
      mode: 'gradient',
      angle: parsed.angle,
      stops: parsed.stops,
      startColor: parsed.startColor,
      endColor: parsed.endColor,
    };
  }

  if (rawImage && rawImage.toLowerCase() !== 'none') {
    return { mode: 'custom', rawCss: rawImage };
  }

  if (bg.solidColor) {
    return { mode: 'solid', solidColor: bg.solidColor };
  }

  return { mode: 'none' };
}

function parseBackdropBlur(decls: Record<string, string>): BackdropBlurValue {
  const blurPx = parseBlurPx(decls['backdrop-filter']) ?? parseBlurPx(decls['-webkit-backdrop-filter']);
  const tintColor = !isTextBackgroundClip(decls)
    ? (decls['background-color']
      ? stripImportant(decls['background-color'])
      : extractBackgroundGradientOrColor(decls).solidColor)
    : undefined;

  return {
    enabled: blurPx !== undefined && blurPx > 0,
    blurPx: blurPx ?? 12,
    tintColor,
  };
}

export function parsePartSimpleStyle(
  scssText: string,
  selector: string,
  state: PseudoState,
): SimpleStyleModel {
  const decls = readRuleDeclarations(scssText, selector, state);

  return {
    textFill: parseTextFill(decls),
    fontSizePx: parsePx(decls['font-size']),
    fontWeight: decls['font-weight'] ? stripImportant(decls['font-weight']) : undefined,
    lineHeight: sanitizeNoViewportUnit(decls['line-height']),
    letterSpacingPx: parsePx(decls['letter-spacing']),
    textStroke: parseTextStroke(decls),
    textShadow: parseShadow(decls['text-shadow'], false),
    background: parseBackgroundFill(decls),
    boxShadow: parseShadow(decls['box-shadow'], true),
    border: parseBorderBox(decls),
    borderImage: parseBorderImage9Slice(decls),
    maskFade: parseMaskFade(decls['mask-image'] ?? decls['-webkit-mask-image']),
    backdropBlur: parseBackdropBlur(decls),
    opacity: parseFiniteNumber(decls.opacity),
  };
}

function clearTextClipResiduals(decls: Record<string, string>): Record<string, string | null> {
  if (!isTextBackgroundClip(decls)) return {};
  return {
    background: null,
    'background-image': null,
    'background-clip': null,
    '-webkit-background-clip': null,
    '-webkit-text-fill-color': null,
  };
}

const STYLE_UPDATERS: { [K in keyof SimpleStyleModel]-?: StyleUpdater<K> } = {
  textFill: (decls, value) => {
    if (value.mode === 'custom') {
      return {};
    }

    if (value.mode === 'none') {
      return {
        color: null,
        '-webkit-text-fill-color': null,
        ...clearTextClipResiduals(decls),
      };
    }

    if (value.mode === 'solid') {
      return {
        ...clearTextClipResiduals(decls),
        color: value.solidColor?.trim() || '#ffffff',
        '-webkit-text-fill-color': null,
      };
    }

    const angle = value.angle ?? 90;
    const grad = value.stops && value.stops.length >= 2
      ? buildLinearGradient(angle, value.stops)
      : (value.startColor || value.endColor)
        ? buildLinearGradient(angle, value.startColor ?? '#ffffff', value.endColor ?? '#90caf9')
        : (value.gradientCss?.trim() || buildLinearGradient(angle, '#ffffff', '#90caf9'));

    return {
      color: 'transparent',
      '-webkit-text-fill-color': 'transparent',
      background: grad,
      'background-image': null,
      'background-clip': 'text',
      '-webkit-background-clip': 'text',
    };
  },

  fontSizePx: (_decls, value) => ({
    'font-size': typeof value === 'number' && Number.isFinite(value) ? formatPx(value) : null,
  }),

  fontWeight: (_decls, value) => ({
    'font-weight': value?.trim() ? value.trim() : null,
  }),

  lineHeight: (_decls, value) => ({
    'line-height': sanitizeNoViewportUnit(value) ?? null,
  }),

  letterSpacingPx: (_decls, value) => ({
    'letter-spacing': typeof value === 'number' && Number.isFinite(value) ? formatPx(value) : null,
  }),

  textStroke: (_decls, value) => {
    if (!value.enabled || value.widthPx <= 0) {
      return {
        '-webkit-text-stroke': null,
        '-webkit-text-stroke-width': null,
        '-webkit-text-stroke-color': null,
        'paint-order': null,
      };
    }

    return {
      '-webkit-text-stroke': `${formatPx(value.widthPx)} ${value.color.trim() || '#000000'}`,
      '-webkit-text-stroke-width': null,
      '-webkit-text-stroke-color': null,
      'paint-order': 'stroke fill',
    };
  },

  textShadow: (_decls, value) => ({
    'text-shadow': formatShadow(value, false),
  }),

  background: (decls, value) => {
    if (value.mode === 'custom') {
      return {};
    }

    const clearClip: Record<string, string | null> = isTextBackgroundClip(decls)
      ? {
        'background-clip': null,
        '-webkit-background-clip': null,
        '-webkit-text-fill-color': null,
        ...(stripImportant(decls.color ?? '').toLowerCase() === 'transparent' ? { color: null } : {}),
      }
      : {};

    if (value.mode === 'none') {
      if (isTextBackgroundClip(decls)) return {};
      return {
        background: null,
        'background-color': null,
        'background-image': null,
        'background-size': null,
        'background-position': null,
        'background-repeat': null,
      };
    }

    if (value.mode === 'solid') {
      return {
        ...clearClip,
        background: value.solidColor?.trim() || 'transparent',
        'background-color': null,
        'background-image': null,
        'background-size': null,
        'background-position': null,
        'background-repeat': null,
      };
    }

    if (value.mode === 'gradient') {
      const angle = value.angle ?? 180;
      const grad = value.stops && value.stops.length >= 2
        ? buildLinearGradient(angle, value.stops)
        : (value.startColor || value.endColor)
          ? buildLinearGradient(angle, value.startColor ?? 'rgba(0, 0, 0, 0.7)', value.endColor ?? 'rgba(0, 0, 0, 0.2)')
          : (value.gradientCss?.trim() || buildLinearGradient(angle, 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.2)'));
      return {
        ...clearClip,
        background: grad,
        'background-color': null,
        'background-image': null,
        'background-size': null,
        'background-position': null,
        'background-repeat': null,
      };
    }

    const imageUrl = value.imageUrl?.trim();
    return {
      ...clearClip,
      background: null,
      'background-image': imageUrl ? formatUrlValue(imageUrl) : null,
      'background-size': sanitizeNoViewportUnit(value.size) ?? 'cover',
      'background-position': sanitizeNoViewportUnit(value.position) ?? 'center',
      'background-repeat': value.repeat?.trim() || 'no-repeat',
    };
  },

  boxShadow: (_decls, value) => ({
    'box-shadow': formatShadow(value, true),
  }),

  border: (decls, value) => {
    const updates: Record<string, string | null> = {
      'border-radius': typeof value.radiusPx === 'number' && Number.isFinite(value.radiusPx)
        ? formatPx(value.radiusPx)
        : null,
    };

    const hasBorderImage = parseBorderImage9Slice(decls).enabled;
    const hasBorderProps =
      value.borderStyle !== undefined ||
      value.borderWidthPx !== undefined ||
      value.borderColor !== undefined;

    if (!hasBorderProps) {
      updates.border = null;
      if (!hasBorderImage) {
        updates['border-width'] = null;
        updates['border-style'] = null;
        updates['border-color'] = null;
      }
      return updates;
    }

    if (value.borderStyle === 'none') {
      updates.border = 'none';
      updates['border-width'] = null;
      updates['border-style'] = null;
      updates['border-color'] = null;
      return updates;
    }

    if (hasBorderImage) {
      if (typeof value.borderWidthPx === 'number') updates['border-width'] = formatPx(value.borderWidthPx);
      if (value.borderColor?.trim()) updates['border-color'] = value.borderColor.trim();
      return updates;
    }

    const width = formatPx(value.borderWidthPx ?? 1);
    const style = value.borderStyle ?? 'solid';
    const color = value.borderColor?.trim() || '#ffffff';
    updates.border = `${width} ${style} ${color}`;
    updates['border-width'] = null;
    updates['border-style'] = null;
    updates['border-color'] = null;
    return updates;
  },

  borderImage: (decls, value) => {
    const imageUrl = value.imageUrl.trim();
    if (!value.enabled || !imageUrl) {
      const existingColor = stripImportant(decls['border-color'] ?? '').toLowerCase();
      const shouldClearBorder = !existingColor || existingColor === 'transparent';
      return {
        ...(shouldClearBorder
          ? {
            'border-style': null,
            'border-width': null,
            'border-color': null,
          }
          : {}),
        'border-image': null,
        'border-image-source': null,
        'border-image-slice': null,
        'border-image-width': null,
        'border-image-repeat': null,
      };
    }

    const slice = `${value.sliceTop} ${value.sliceRight} ${value.sliceBottom} ${value.sliceLeft}${value.fill ? ' fill' : ''}`;
    const width = formatPx(Math.max(0, value.widthPx));
    const preservedColor = decls['border-color']
      ? undefined
      : (parseBorderBox(decls).borderColor ?? 'transparent');
    return {
      border: null,
      'border-style': 'solid',
      'border-width': width,
      ...(preservedColor ? { 'border-color': preservedColor } : {}),
      'border-image': null,
      'border-image-source': formatUrlValue(imageUrl),
      'border-image-slice': slice,
      'border-image-width': width,
      'border-image-repeat': value.repeat,
    };
  },

  maskFade: (_decls, value) => {
    const formatted = formatMaskFade(value);
    return {
      'mask-image': formatted,
      '-webkit-mask-image': formatted,
    };
  },

  backdropBlur: (decls, value) => {
    if (!value.enabled) {
      return {
        'backdrop-filter': null,
        '-webkit-backdrop-filter': null,
      };
    }

    const filter = `blur(${formatPx(Math.max(0, value.blurPx))})`;
    const updates: Record<string, string | null> = {
      'backdrop-filter': filter,
      '-webkit-backdrop-filter': filter,
    };

    const tint = value.tintColor?.trim();
    if (tint) {
      updates['background-color'] = tint;
      const bg = extractBackgroundGradientOrColor(decls);
      if (decls.background && !bg.gradient && !bg.imageUrl) {
        updates.background = null;
      }
    }
    return updates;
  },

  opacity: (_decls, value) => ({
    opacity: typeof value === 'number' && Number.isFinite(value)
      ? String(Math.round(value * 1000) / 1000)
      : null,
  }),
};

// eslint-disable-next-line max-params
export function applyPartSimpleStylePatch<K extends keyof SimpleStyleModel>(
  scssText: string,
  selector: string,
  state: PseudoState,
  group: K,
  value: SimpleStyleModel[K],
): string {
  const decls = readRuleDeclarations(scssText, selector, state);
  const updater = STYLE_UPDATERS[group] as StyleUpdater<K>;
  const updates = updater(decls, value);
  return patchRuleDeclarations({ scssText, selector, state, updates });
}
