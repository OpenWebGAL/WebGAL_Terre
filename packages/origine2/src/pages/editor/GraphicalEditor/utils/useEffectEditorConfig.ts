import { useMemo } from 'react';
import { t } from '@lingui/macro';

/**
 * 所有支持的效果参数键名
 * 按功能分类：变换、基础效果、颜色调整、泛光、倒角、滤镜
 */
export type EffectKey =
  // 变换
  | 'x'
  | 'y'
  | 'rotation'
  | 'scaleX'
  | 'scaleY'
  // 效果
  | 'alpha'
  | 'blur'
  // 颜色调整
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'gamma'
  | 'colorRed'
  | 'colorGreen'
  | 'colorBlue'
  // 泛光
  | 'bloom'
  | 'bloomBrightness'
  | 'bloomBlur'
  | 'bloomThreshold'
  // 倒角
  | 'bevel'
  | 'bevelThickness'
  | 'bevelRotation'
  | 'bevelSoftness'
  | 'bevelRed'
  | 'bevelGreen'
  | 'bevelBlue'
  // 滤镜
  | 'oldFilm'
  | 'dotFilm'
  | 'reflectionFilm'
  | 'glitchFilm'
  | 'rgbFilm'
  | 'godrayFilm';

/**
 * 效果参数的配置信息接口
 * 用于定义每个参数的路径、显示名称、输入类型等元信息
 */
export interface EffectConfig {
  path: string;
  label?: string;
  placeholder?: string;
  type?: 'number' | 'checkbox' | 'dropdown';
}

/** 所有效果参数的键值对类型，值为数值或undefined */
export type EffectFields = Record<EffectKey, number | undefined>;

export const useEffectEditorConfig = () => {
  return useMemo(() => {
    /**
     * 所有效果参数的配置映射表
     * 键为EffectKey，值为该参数的配置信息
     */
    const effectConfig: Record<EffectKey, EffectConfig> = {
      // 变换
      x: { path: 'position.x', label: t`X轴位移`, placeholder: t`默认值0` },
      y: { path: 'position.y', label: t`Y轴位移`, placeholder: t`默认值0` },
      rotation: { path: 'rotation', label: t`旋转（弧度）`, placeholder: t`默认值0` },
      scaleX: { path: 'scale.x', label: t`X轴缩放`, placeholder: t`默认值1` },
      scaleY: { path: 'scale.y', label: t`Y轴缩放`, placeholder: t`默认值1` },
      // 效果
      alpha: { path: 'alpha', label: t`透明度（0-1）`, placeholder: t`默认值1` },
      blur: { path: 'blur', label: t`高斯模糊`, placeholder: t`默认值0` },
      // 颜色调整
      brightness: { path: 'brightness', label: t`亮度`, placeholder: t`默认值1` },
      contrast: { path: 'contrast', label: t`对比度`, placeholder: t`默认值1` },
      saturation: { path: 'saturation', label: t`饱和度`, placeholder: t`默认值1` },
      gamma: { path: 'gamma', label: t`伽马值`, placeholder: t`默认值1` },
      colorRed: { path: 'colorRed' },
      colorGreen: { path: 'colorGreen' },
      colorBlue: { path: 'colorBlue' },
      // 泛光
      bloom: { path: 'bloom', label: t`强度`, placeholder: t`默认值0` },
      bloomBrightness: { path: 'bloomBrightness', label: t`亮度`, placeholder: t`默认值1` },
      bloomBlur: { path: 'bloomBlur', label: t`模糊`, placeholder: t`默认值0` },
      bloomThreshold: { path: 'bloomThreshold', label: t`阈值`, placeholder: t`默认值0` },
      // 倒角
      bevel: { path: 'bevel', label: t`透明度（0-1）`, placeholder: t`默认值0` },
      bevelThickness: { path: 'bevelThickness', label: t`厚度`, placeholder: t`默认值0` },
      bevelRotation: { path: 'bevelRotation', label: t`旋转（角度）`, placeholder: t`默认值0` },
      bevelSoftness: { path: 'bevelSoftness', label: t`软化（0-1）`, placeholder: t`默认值0` },
      bevelRed: { path: 'bevelRed' },
      bevelGreen: { path: 'bevelGreen' },
      bevelBlue: { path: 'bevelBlue' },
      // 滤镜
      oldFilm: { path: 'oldFilm', label: t`老电影滤镜`, type: 'dropdown' },
      dotFilm: { path: 'dotFilm', label: t`点状电影滤镜`, type: 'dropdown' },
      reflectionFilm: { path: 'reflectionFilm', label: t`反射电影滤镜`, type: 'dropdown' },
      glitchFilm: { path: 'glitchFilm', label: t`故障电影滤镜`, type: 'dropdown' },
      rgbFilm: { path: 'rgbFilm', label: t`RGB电影滤镜`, type: 'dropdown' },
      godrayFilm: { path: 'godrayFilm', label: t`光辉电影滤镜`, type: 'dropdown' },
    } as const;
    /** 效果参数的分组配置（按功能分类展示） */
    const fieldGroups = [
      { title: t`变换`, keys: ['x', 'y', 'rotation', 'scaleX', 'scaleY'] },
      { title: t`效果`, keys: ['alpha', 'blur'] },
      { title: t`颜色调整`, keys: ['brightness', 'contrast', 'saturation', 'gamma'] },
      { title: t`泛光`, keys: ['bloom', 'bloomBrightness', 'bloomBlur', 'bloomThreshold'] },
      { title: t`倒角`, keys: ['bevel', 'bevelThickness', 'bevelRotation', 'bevelSoftness'] },
      { title: t`滤镜`, keys: ['oldFilm', 'dotFilm', 'reflectionFilm', 'glitchFilm', 'rgbFilm', 'godrayFilm'] },
    ] as const;
    return { effectConfig, fieldGroups };
  }, []);
};
