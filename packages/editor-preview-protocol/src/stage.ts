export interface Point2D {
  x?: number
  y?: number
}

export type FilterFlag = 0 | 1

export interface Transform {
  position?: Point2D
  scale?: Point2D
  rotation?: number

  alpha?: number
  blur?: number

  brightness?: number
  contrast?: number
  saturation?: number
  gamma?: number
  colorRed?: number
  colorGreen?: number
  colorBlue?: number

  bloom?: number
  bloomBrightness?: number
  bloomBlur?: number
  bloomThreshold?: number

  bevel?: number
  bevelThickness?: number
  bevelRotation?: number
  bevelSoftness?: number
  bevelRed?: number
  bevelGreen?: number
  bevelBlue?: number

  oldFilm?: FilterFlag
  dotFilm?: FilterFlag
  reflectionFilm?: FilterFlag
  glitchFilm?: FilterFlag
  rgbFilm?: FilterFlag
  godrayFilm?: FilterFlag

  shockwaveFilter?: number
  radiusAlphaFilter?: number
}
