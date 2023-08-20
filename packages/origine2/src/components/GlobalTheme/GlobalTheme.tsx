import useTheme from '@/hooks/useTheme';
import { useEffect } from 'react';

const GlobalTheme = () => {
  const { loadThemeForFluentUI } = useTheme();

  useEffect(() => loadThemeForFluentUI(Number(window?.localStorage?.getItem('editor-theme'))) , []);

  return null;
}

export default GlobalTheme;