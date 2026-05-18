import type { IEditorState } from '@/types/editor';

export type EditorLanguage = IEditorState['language'];

const defaultLanguage: EditorLanguage = 'zhCn';

function normalizeBrowserLanguage(language: string): EditorLanguage | undefined {
  const normalizedLanguage = language.toLowerCase().replace('_', '-');

  if (normalizedLanguage === 'zh' || normalizedLanguage.startsWith('zh-') || normalizedLanguage === 'zhcn') {
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
    return defaultLanguage;
  }

  const browserLanguages = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter((language): language is string => Boolean(language));

  for (const language of browserLanguages) {
    const editorLanguage = normalizeBrowserLanguage(language);
    if (editorLanguage) {
      return editorLanguage;
    }
  }

  return defaultLanguage;
}

export function getMigrationGuideUrl(language: EditorLanguage): string {
  switch (language) {
  case 'en':
    return 'https://docs.openwebgal.com/en/migration.html';
  case 'ja':
    return 'https://docs.openwebgal.com/ja/migration.html';
  case 'zhCn':
  default:
    return 'https://docs.openwebgal.com/migration.html';
  }
}
