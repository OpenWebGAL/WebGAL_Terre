import { constants } from 'fs';
import * as fsp from 'fs/promises';
import { join } from 'path';
import {
  TemplateConfigDto,
  TemplateScreenSlotDto,
  TemplateScreensResponseDto,
  TemplateScreenVariantDto,
} from './manage-template.dto';

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

export type UiScreenId = (typeof UI_SCREEN_IDS)[number];

interface BuiltInVariantMeta {
  variantId: string;
  name: string;
}

const SAVE_LOAD_PRESETS: readonly BuiltInVariantMeta[] = [
  { variantId: 'grid-2x5', name: '网格样式 (2×5)' },
  { variantId: 'list-vertical', name: '纵向列表' },
  { variantId: 'split-preview', name: '分栏预览' },
];

export const SCREEN_PRESET_REGISTRY: Record<
  UiScreenId,
  readonly BuiltInVariantMeta[]
> = {
  title: [
    { variantId: 'default', name: '默认样式 (Refine 2026)' },
    { variantId: 'classic', name: '经典底栏' },
    { variantId: 'editorial-right', name: '右侧书卷' },
  ],
  textbox: [
    { variantId: 'default', name: '默认样式 (Refine 2026)' },
    { variantId: 'classic', name: '经典胶囊 (WebGAL Classic)' },
    { variantId: 'black', name: '暗黑半透 (WebGAL Black)' },
    { variantId: 'bare', name: '无样式基底' },
  ],
  choose: [
    { variantId: 'default', name: '默认样式' },
    { variantId: 'sleek-dark', name: '暗夜浮光' },
  ],
  save: SAVE_LOAD_PRESETS,
  load: SAVE_LOAD_PRESETS,
  options: [
    { variantId: 'tabbed-classic', name: '分页标签' },
    { variantId: 'single-scroll', name: '单页滚动' },
  ],
  flowchart: [{ variantId: 'default', name: '默认样式' }],
  menuPanel: [{ variantId: 'default', name: '默认样式' }],
  backlog: [{ variantId: 'default', name: '默认样式' }],
  extra: [
    { variantId: 'gallery-classic', name: '经典鉴赏' },
    { variantId: 'split-tabs', name: '分栏鉴赏' },
  ],
  bottomControlPanel: [{ variantId: 'default', name: '默认样式' }],
  globalDialog: [{ variantId: 'default', name: '默认样式' }],
};

export function isUiScreenId(value: string): value is UiScreenId {
  return (UI_SCREEN_IDS as readonly string[]).includes(value);
}

export function parseSemverCore(
  version?: string | null,
): { major: number; minor: number; patch: number } | null {
  if (typeof version !== 'string') return null;
  const match = version.trim().match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function isCustomUiTemplate(
  cfg?: Partial<TemplateConfigDto> | null,
): boolean {
  if (!cfg || cfg.uiMode === 'legacy') return false;
  const ver = parseSemverCore(cfg['webgal-version']);
  if (!ver || ver.major < 4 || (ver.major === 4 && ver.minor < 7)) {
    return false;
  }
  return (
    cfg.uiMode === 'custom' ||
    (cfg.screens != null && Object.keys(cfg.screens).length > 0)
  );
}

export function isLegacyTemplate(
  cfg?: Partial<TemplateConfigDto> | null,
): boolean {
  return !isCustomUiTemplate(cfg);
}

export function getDefaultTemplateScreensConfig(): Record<UiScreenId, string> {
  return UI_SCREEN_IDS.reduce((acc, screen) => {
    acc[screen] = SCREEN_PRESET_REGISTRY[screen][0].variantId;
    return acc;
  }, {} as Record<UiScreenId, string>);
}

export function isBuiltInVariant(
  screen: UiScreenId,
  variantId: string,
): boolean {
  return SCREEN_PRESET_REGISTRY[screen].some((v) => v.variantId === variantId);
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    const stat = await fsp.stat(targetPath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function readManifestName(variantDir: string): Promise<string | null> {
  try {
    const raw = await fsp.readFile(
      join(variantDir, 'webgal-screen.json'),
      'utf8',
    );
    const parsed = JSON.parse(raw) as { name?: unknown };
    return typeof parsed.name === 'string' && parsed.name.trim().length > 0
      ? parsed.name.trim()
      : null;
  } catch {
    return null;
  }
}

async function inspectScreenSlot(
  templateRoot: string,
  screen: UiScreenId,
  configuredVariant?: string,
): Promise<TemplateScreenSlotDto> {
  const presets = SCREEN_PRESET_REGISTRY[screen];
  const screenDir = join(templateRoot, 'screens', screen);
  const diskVariants = new Map<
    string,
    { hasEntryJs: boolean; name?: string }
  >();

  try {
    const entries = await fsp.readdir(screenDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const variantRoot = join(screenDir, entry.name);
      const [hasEntryJs, manifestName] = await Promise.all([
        fileExists(join(variantRoot, 'index.js')),
        readManifestName(variantRoot),
      ]);
      diskVariants.set(entry.name, {
        hasEntryJs,
        name: manifestName ?? undefined,
      });
    }
  } catch {
    // 存量旧模板或尚未创建 screens/<screen> 目录时只展示内置预制变体
  }

  const variants: TemplateScreenVariantDto[] = presets.map((preset) => {
    const disk = diskVariants.get(preset.variantId);
    diskVariants.delete(preset.variantId);
    return {
      variantId: preset.variantId,
      name: disk?.name ?? preset.name,
      builtIn: true,
      hasEntryJs: disk?.hasEntryJs ?? false,
      scssPath: `screens/${screen}/${preset.variantId}/style.scss`,
    };
  });

  for (const [variantId, disk] of diskVariants.entries()) {
    variants.push({
      variantId,
      name: disk.name ?? variantId,
      builtIn: false,
      hasEntryJs: disk.hasEntryJs,
      scssPath: `screens/${screen}/${variantId}/style.scss`,
    });
  }

  const activeVariant =
    configuredVariant && configuredVariant.trim().length > 0
      ? configuredVariant.trim()
      : presets[0].variantId;

  return { screen, activeVariant, variants };
}

export async function inspectTemplateScreens(
  templateRoot: string,
  config: TemplateConfigDto,
): Promise<TemplateScreensResponseDto> {
  const slots = await Promise.all(
    UI_SCREEN_IDS.map((screen) =>
      inspectScreenSlot(templateRoot, screen, config.screens?.[screen]),
    ),
  );
  const customUi = isCustomUiTemplate(config);
  return {
    uiMode: customUi ? 'custom' : 'legacy',
    isLegacy: !customUi,
    screens: slots,
  };
}

const BUILTIN_SCREEN_ASSET_FILES = [
  'index.js',
  'webgal-screen.json',
  'style.scss',
] as const;

export async function copyMissingBuiltInScreenAssets(
  templateRoot: string,
  defaultTemplateRoot: string,
): Promise<void> {
  for (const screen of UI_SCREEN_IDS) {
    for (const preset of SCREEN_PRESET_REGISTRY[screen]) {
      const srcDir = join(
        defaultTemplateRoot,
        'screens',
        screen,
        preset.variantId,
      );
      const destDir = join(templateRoot, 'screens', screen, preset.variantId);
      const hadEntryJs = await fileExists(join(destDir, 'index.js'));
      let destDirEnsured = false;

      for (const fileName of BUILTIN_SCREEN_ASSET_FILES) {
        const srcPath = join(srcDir, fileName);
        if (!(await fileExists(srcPath))) continue;
        const destPath = join(destDir, fileName);
        if (!destDirEnsured) {
          await fsp.mkdir(destDir, { recursive: true });
          destDirEnsured = true;
        }
        try {
          await fsp.copyFile(srcPath, destPath, constants.COPYFILE_EXCL);
        } catch (error) {
          if ((error as NodeJS.ErrnoException)?.code !== 'EEXIST') {
            throw error;
          }
          // 兼容旧阶段仅生成空白 style.scss 且尚无 index.js 的存量测试模板
          if (
            fileName === 'style.scss' &&
            !hadEntryJs &&
            (await fsp.readFile(destPath, 'utf8')).trim() === ''
          ) {
            await fsp.copyFile(srcPath, destPath);
          }
        }
      }
    }
  }
}
