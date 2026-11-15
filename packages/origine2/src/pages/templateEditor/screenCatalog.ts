import { t } from '@lingui/macro';

export const UI_SCREEN_IDS = [
  'title',
  'textbox',
  'choose',
  'save',
  'load',
  'options',
  'flowchart',
  'menuPanel',
  'backlog',
  'extra',
  'bottomControlPanel',
  'globalDialog',
] as const;

export type TemplateScreenId = (typeof UI_SCREEN_IDS)[number];

export const DEFAULT_SCREEN_VARIANTS: Record<TemplateScreenId, string> = {
  title: 'default',
  textbox: 'default',
  choose: 'default',
  save: 'grid-2x5',
  load: 'grid-2x5',
  options: 'tabbed-classic',
  flowchart: 'default',
  menuPanel: 'default',
  backlog: 'default',
  extra: 'gallery-classic',
  bottomControlPanel: 'default',
  globalDialog: 'default',
};

export interface TemplateScreenVariantMeta {
  variantId: string;
  name: string;
  builtIn: boolean;
  hasEntryJs: boolean;
  scssPath: string;
}

export interface TemplateScreenEntryMeta {
  screen: string;
  activeVariant: string;
  variants: TemplateScreenVariantMeta[];
}

export interface TemplateScreensInfo {
  uiMode: 'legacy' | 'custom';
  screens: TemplateScreenEntryMeta[];
}

export function getScreenDisplayName(screen: TemplateScreenId): string {
  const labels: Record<TemplateScreenId, string> = {
    title: t`标题界面`,
    textbox: t`文本框`,
    choose: t`分支选择`,
    save: t`存档界面`,
    load: t`读档界面`,
    options: t`设置界面`,
    flowchart: t`流程图`,
    menuPanel: t`菜单浮层`,
    backlog: t`历史记录`,
    extra: t`鉴赏界面`,
    bottomControlPanel: t`底部快捷栏`,
    globalDialog: t`全局弹窗`,
  };
  return labels[screen];
}

export function isCustomUiTemplate(
  config?: { uiMode?: string; screens?: Record<string, string> } | null,
): boolean {
  if (!config) return false;
  if (config.uiMode === 'custom') return true;
  return Boolean(config.screens && Object.keys(config.screens).length > 0);
}

/**
 * 根据资源文件所在目录组装 CSS url(...) 值，支持界面子目录与模板公共 assets 目录
 */
export function buildTemplateAssetCssUrl(
  filePath: string,
  templateDir: string,
  scssPath?: string | null,
): string {
  const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const prefix = `templates/${templateDir}/`;
  const relToTemplate = normalized.startsWith(prefix) ? normalized.slice(prefix.length) : normalized;

  if (scssPath) {
    const scssDir = scssPath.includes('/') ? scssPath.slice(0, scssPath.lastIndexOf('/')) : '';
    if (scssDir && relToTemplate.startsWith(`${scssDir}/`)) {
      return `url("./${relToTemplate.slice(scssDir.length + 1)}")`;
    }
  }
  return `url("./game/template/${relToTemplate}")`;
}

export function extractAssetDisplayName(cssUrl?: string): string {
  if (!cssUrl) return '';
  const match = cssUrl.match(/url\(["']?([^"')]+)["']?\)/);
  const raw = match ? match[1] : cssUrl;
  const parts = raw.split('/');
  return parts[parts.length - 1] || raw;
}
