import { ReactNode } from 'react';

export const candidateFontSizes: number[] = [8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 24, 28];

export const languagesDefine = [
  { label: '简体中文', value: 'zhCn' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
];

export type SettingItemType = 'switch' | 'select' | 'input' | 'combo' | 'custom';

export interface BaseSettingOption {
  key: string;
  label?: string;
  description?: string;
  icon?: ReactNode;
  category?: string;
}

export interface SwitchSettingOption extends BaseSettingOption {
  type: 'switch';
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export interface SelectSettingOption extends BaseSettingOption {
  type: 'select';
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}

export interface InputSettingOption extends BaseSettingOption {
  type: 'input';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface ComboSettingOption extends BaseSettingOption {
  type: 'combo';
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export interface CustomSettingOption extends BaseSettingOption {
  type: 'custom';
  render: () => ReactNode;
}

export type SettingOption =
  | SwitchSettingOption
  | SelectSettingOption
  | InputSettingOption
  | ComboSettingOption
  | CustomSettingOption;

export interface SettingCategory {
  key: string;
  title: string;
  icon?: ReactNode;
  options: SettingOption[];
  order?: number;
}
