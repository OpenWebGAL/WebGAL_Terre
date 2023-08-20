import { useSelector } from 'react-redux';
import { theme, setTheme } from '@/store/statusReducer';
import { useDispatch } from 'react-redux';
import { fluentUIDarkTheme, fluentUILightTheme, systemTheme } from '@/utils/theme';
import { loadTheme } from "@fluentui/react";
import { logger } from '@/utils/logger';

const useTheme = () => {
  const dispatch = useDispatch();
  /* 
   * 获取主题对应键的颜色值(16进制)
   */
  const getColorFromTheme= (colorKey: string, currentTheme: theme) => {
    switch (currentTheme) {
    case theme.light:
      return systemTheme.colors?.modes?.['light']?.[colorKey] as string
    case theme.dark:
      return systemTheme.colors?.modes?.['dark']?.[colorKey] as string
    default:
      return systemTheme.colors?.modes?.['light']?.[colorKey] as string
    }
  }
  /* 
   * 获取主题名称
   */
  const getThemeName = (themeIndex: theme): string => {
    switch (themeIndex) {
    case theme.light:
      return 'light';
    case theme.dark:
      return 'dark';
    }
  }
  /* 
   * 为 Fluent UI 加载主题(全局)
   */
  const loadThemeForFluentUI = (currentTheme: theme) => {
    const checkSelectedTheme = () => {
      switch (currentTheme) {
      case theme.light:
        return fluentUILightTheme;
      case theme.dark:
        return fluentUIDarkTheme;
      default:
        return fluentUILightTheme;
      }
    };
    loadTheme(checkSelectedTheme());
    dispatch(setTheme(currentTheme));
    const themeName = getThemeName(currentTheme);
    logger.info('设置 Flunet UI 颜色主题: ' + themeName);
  };

  return {
    getThemeName,
    getColorFromTheme,
    loadThemeForFluentUI,
  }
}

export default useTheme;