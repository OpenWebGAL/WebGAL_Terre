import { useMemo } from 'react';
import { EffectKey, useEffectEditorConfig } from '@/pages/editor/GraphicalEditor/utils/useEffectEditorConfig';

export interface IAnimationProperty {
  path: string;
  /** 时间轴上显示的名称 */
  label: string;
  /** 添加属性菜单中显示的名称（菜单已按分组显示，因此不带分组名） */
  shortLabel: string;
  /** 属性的默认值，即 baseTransform 中的值 */
  defaultValue: number;
  step: number;
  /** 显示时保留的小数位数 */
  precision: number;
}

export interface IPropertyGroup {
  title: string;
  properties: IAnimationProperty[];
}

/** 效果编辑器的分组里没有颜色通道，这里插到对应属性后面 */
const COLOR_CHANNEL_KEYS: Partial<Record<EffectKey, EffectKey[]>> = {
  gamma: ['colorRed', 'colorGreen', 'colorBlue'],
  bevelSoftness: ['bevelRed', 'bevelGreen', 'bevelBlue'],
};

/** 泛光、倒角的参数名（强度、厚度……）离开分组就看不懂，在时间轴上显示时带上分组名 */
const GROUP_PREFIXED_KEYS: EffectKey[] = ['bloom', 'bevel'];

/**
 * 可动画的属性及其显示信息，复用效果编辑器的配置
 */
export function useAnimationProperties() {
  const { effectConfig, fieldGroups } = useEffectEditorConfig();

  return useMemo(() => {
    const groups: IPropertyGroup[] = fieldGroups.map((group) => {
      const groupKeys: readonly EffectKey[] = group.keys;
      const isPrefixed = GROUP_PREFIXED_KEYS.includes(groupKeys[0]);
      const keys = groupKeys.flatMap((key) => [key, ...(COLOR_CHANNEL_KEYS[key] ?? [])]);
      return {
        title: group.title,
        properties: keys.map((key) => {
          const config = effectConfig[key];
          const label = config.label ?? key;
          const precision = config.slider?.toFixed ?? 0;
          return {
            path: config.path,
            label: isPrefixed ? `${group.title} · ${label}` : label,
            shortLabel: label,
            defaultValue: config.slider?.defaultValue ?? 0,
            step: precision === 0 ? 1 : 0.01,
            precision,
          };
        }),
      };
    });
    const propertyMap = new Map(groups.flatMap((group) => group.properties.map((property) => [property.path, property])));

    /** 文件里可能有这里不认识的属性（如 shockwaveFilter），按路径原样显示 */
    const getProperty = (path: string): IAnimationProperty =>
      propertyMap.get(path) ?? { path, label: path, shortLabel: path, defaultValue: 0, step: 0.01, precision: 3 };

    return { groups, getProperty };
  }, [effectConfig, fieldGroups]);
}
