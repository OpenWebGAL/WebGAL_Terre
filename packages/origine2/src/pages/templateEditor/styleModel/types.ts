export type PseudoState = 'default' | 'hover' | 'active' | 'selected' | 'disabled';

export const PSEUDO_STATES: readonly PseudoState[] = ['default', 'hover', 'active', 'selected', 'disabled'];

export interface LayoutFields {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}

export interface GradientColorStop {
  color: string;
  position?: number;
  rawPosition?: string;
}

export interface ColorOrGradientValue {
  mode: 'none' | 'solid' | 'gradient' | 'custom';
  solidColor?: string;
  gradientCss?: string;
  angle?: number;
  stops?: GradientColorStop[];
  startColor?: string;
  endColor?: string;
  rawCss?: string;
}

export interface TextStrokeValue {
  enabled: boolean;
  widthPx: number;
  color: string;
}

export interface ShadowValue {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread?: number;
  color: string;
  inset?: boolean;
}

export interface BackgroundFillValue {
  mode: 'none' | 'solid' | 'gradient' | 'image' | 'custom';
  solidColor?: string;
  gradientCss?: string;
  angle?: number;
  stops?: GradientColorStop[];
  startColor?: string;
  endColor?: string;
  imageUrl?: string;
  size?: string;
  repeat?: string;
  position?: string;
  rawCss?: string;
}

export interface BorderImage9SliceValue {
  enabled: boolean;
  imageUrl: string;
  sliceTop: number;
  sliceRight: number;
  sliceBottom: number;
  sliceLeft: number;
  fill: boolean;
  widthPx: number;
  repeat: 'stretch' | 'repeat' | 'round';
}

export interface MaskFadeValue {
  enabled: boolean;
  direction: 'to bottom' | 'to top' | 'to right' | 'to left';
  startPercent: number;
  endPercent: number;
}

export interface BackdropBlurValue {
  enabled: boolean;
  blurPx: number;
  tintColor?: string;
}

export interface BorderBoxValue {
  radiusPx?: number;
  borderWidthPx?: number;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'double';
  borderColor?: string;
}

export interface SimpleStyleModel {
  textFill: ColorOrGradientValue;
  fontSizePx?: number;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacingPx?: number;
  textStroke: TextStrokeValue;
  textShadow: ShadowValue;
  background: BackgroundFillValue;
  boxShadow: ShadowValue;
  border: BorderBoxValue;
  borderImage: BorderImage9SliceValue;
  maskFade: MaskFadeValue;
  backdropBlur: BackdropBlurValue;
  opacity?: number;
}

export interface PartRawRuleMap {
  default: Record<string, string>;
  hover: Record<string, string>;
  active: Record<string, string>;
  selected: Record<string, string>;
  disabled: Record<string, string>;
}
