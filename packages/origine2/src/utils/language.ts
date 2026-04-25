import type { IEditorState } from '@/types/editor';

export type EditorLanguage = IEditorState['language'];

const fallbackLanguage: EditorLanguage = 'zhCn';
const unsupportedBrowserFallbackLanguage: EditorLanguage = 'en';

function normalizeBrowserLanguage(language: string): EditorLanguage | undefined {
  const normalizedLanguage = language.toLowerCase().replace('_', '-');

  if (normalizedLanguage === 'zhcn' || normalizedLanguage.startsWith('zh')) {
    return 'zhCn';
  }
  if (normalizedLanguage === 'ja' || normalizedLanguage.startsWith('ja-')) {
    return 'ja';
  }
  if (normalizedLanguage === 'en' || normalizedLanguage.startsWith('en-')) {
    return 'en';
  }

  return undefined;
}

export function getDefaultLanguage(): EditorLanguage {
  if (typeof navigator === 'undefined') {
    return fallbackLanguage;
  }

  const browserLanguages = [
    ...Array.from(navigator.languages ?? []),
    navigator.language,
  ].filter((language): language is string => Boolean(language));

  for (const language of browserLanguages) {
    const editorLanguage = normalizeBrowserLanguage(language);
    if (editorLanguage) {
      return editorLanguage;
    }
  }

  return unsupportedBrowserFallbackLanguage;
}
