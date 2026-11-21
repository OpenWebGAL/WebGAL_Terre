import * as fsp from 'fs/promises';
import { dirname, join } from 'path';
import { version_number } from '../../version';
import { TemplateConfigDto } from './manage-template.dto';
import {
  migrateLegacyChooseScss,
  migrateLegacyTextboxScss,
  migrateLegacyTitleScss,
} from './legacy-scss-mapper';
import {
  copyMissingBuiltInScreenAssets,
  getDefaultTemplateScreensConfig,
} from './screen-registry';

const LEGACY_DIRS = ['Stage', 'UI'] as const;

async function pathExists(target: string): Promise<boolean> {
  try {
    await fsp.stat(target);
    return true;
  } catch {
    return false;
  }
}

async function readOptionalText(target: string): Promise<string | null> {
  try {
    return await fsp.readFile(target, 'utf8');
  } catch {
    return null;
  }
}

async function archiveLegacyDirectories(templateRoot: string): Promise<void> {
  let backupRoot = join(templateRoot, 'legacy-backup');
  if (await pathExists(backupRoot)) {
    backupRoot = join(templateRoot, `legacy-backup-${Date.now()}`);
  }

  for (const dirName of LEGACY_DIRS) {
    const srcDir = join(templateRoot, dirName);
    if (!(await pathExists(srcDir))) continue;
    const destDir = join(backupRoot, dirName);
    await fsp.mkdir(dirname(destDir), { recursive: true });
    try {
      await fsp.rename(srcDir, destDir);
    } catch {
      await fsp.cp(srcDir, destDir, { recursive: true });
      await fsp.rm(srcDir, { recursive: true, force: true });
    }
  }
}

async function appendStyleOverride(
  scssPath: string,
  overrideBlock: string,
): Promise<void> {
  if (!overrideBlock.trim()) return;
  await fsp.mkdir(dirname(scssPath), { recursive: true });
  const existing = (await readOptionalText(scssPath)) ?? '';
  if (existing.includes('/* Migrated from legacy template */')) return;
  const nextText = `${existing.trimEnd()}\n${overrideBlock}`;
  await fsp.writeFile(scssPath, nextText, 'utf8');
}

export async function migrateLegacyTemplateDirectory(
  templateRoot: string,
  defaultTemplateRoot: string,
): Promise<TemplateConfigDto> {
  const configPath = join(templateRoot, 'template.json');
  const rawConfig = await readOptionalText(configPath);
  const parsedConfig: Partial<TemplateConfigDto> = rawConfig
    ? (JSON.parse(rawConfig) as Partial<TemplateConfigDto>)
    : {};

  const [legacyTitleScss, legacyTextboxScss, legacyChooseScss] =
    await Promise.all([
      readOptionalText(join(templateRoot, 'UI', 'Title', 'title.scss')),
      readOptionalText(join(templateRoot, 'Stage', 'TextBox', 'textbox.scss')),
      readOptionalText(join(templateRoot, 'Stage', 'Choose', 'choose.scss')),
    ]);

  await archiveLegacyDirectories(templateRoot);
  await copyMissingBuiltInScreenAssets(templateRoot, defaultTemplateRoot);

  if (legacyTitleScss) {
    await appendStyleOverride(
      join(templateRoot, 'screens', 'title', 'default', 'style.scss'),
      migrateLegacyTitleScss(legacyTitleScss),
    );
  }
  if (legacyTextboxScss) {
    await appendStyleOverride(
      join(templateRoot, 'screens', 'textbox', 'default', 'style.scss'),
      migrateLegacyTextboxScss(legacyTextboxScss),
    );
  }
  if (legacyChooseScss) {
    await appendStyleOverride(
      join(templateRoot, 'screens', 'choose', 'default', 'style.scss'),
      migrateLegacyChooseScss(legacyChooseScss),
    );
  }

  const nextScreens = {
    ...getDefaultTemplateScreensConfig(),
    ...(parsedConfig.screens ?? {}),
  };

  const upgradedConfig: TemplateConfigDto = {
    ...parsedConfig,
    name: parsedConfig.name || 'Upgraded Template',
    'webgal-version': version_number,
    uiMode: 'custom',
    screens: nextScreens,
  };

  await fsp.writeFile(
    configPath,
    JSON.stringify(upgradedConfig, undefined, 2),
    'utf8',
  );
  return upgradedConfig;
}
