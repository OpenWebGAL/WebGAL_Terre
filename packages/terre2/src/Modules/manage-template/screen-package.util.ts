import { BadRequestException } from '@nestjs/common';
import AdmZip = require('adm-zip');
import * as fsp from 'fs/promises';
import { basename, dirname, join, relative, resolve, sep } from 'path';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';
import { isBuiltInVariant, UiScreenId } from './screen-registry';

interface NormalizedZipEntry {
  relPath: string;
  buffer: Buffer;
}

interface ExtractScreenPackageOptions {
  buffer: Buffer;
  originalname?: string;
  templateRoot: string;
  screen: UiScreenId;
  requestedVariantId?: string;
}

export interface ExtractScreenPackageResult {
  variantId: string;
  scssPath: string;
}

function isUnsafeZipPath(rawPath: string): boolean {
  const normalized = rawPath.replace(/\\/g, '/');
  return (
    normalized.includes('\0') ||
    normalized.startsWith('/') ||
    /^[a-zA-Z]:($|\/)/.test(normalized) ||
    WebgalFsService.hasInvalidPathSegments(normalized)
  );
}

function shouldIgnoreEntry(normalizedPath: string): boolean {
  const trimmed = normalizedPath.replace(/^\/+/, '');
  return (
    trimmed.length === 0 ||
    trimmed === '__MACOSX' ||
    trimmed.startsWith('__MACOSX/') ||
    trimmed.endsWith('/.DS_Store') ||
    trimmed === '.DS_Store'
  );
}

function sanitizeVariantCandidate(raw?: string): string {
  if (!raw) return '';
  const cleaned = raw
    .trim()
    .replace(/[\/\\\:\*\?"\<\>\|.\0]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (
    !cleaned ||
    cleaned === '.' ||
    cleaned === '..' ||
    cleaned === 'undefined' ||
    cleaned === 'null'
  ) {
    return '';
  }
  return cleaned;
}

function normalizeZipEntries(buffer: Buffer): {
  entries: NormalizedZipEntry[];
  singleTopDir?: string;
} {
  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
  } catch {
    throw new BadRequestException('Invalid screen zip package.');
  }

  const rawFiles: NormalizedZipEntry[] = [];
  for (const entry of zip.getEntries()) {
    const normalized = entry.entryName.replace(/\\/g, '/').replace(/\/+/g, '/');
    if (isUnsafeZipPath(normalized)) {
      throw new BadRequestException('Zip contains unsafe entry path.');
    }
    if (entry.isDirectory || shouldIgnoreEntry(normalized)) continue;
    rawFiles.push({
      relPath: normalized.replace(/^(\.\/)+/, ''),
      buffer: entry.getData(),
    });
  }

  if (rawFiles.length === 0) {
    throw new BadRequestException('Screen zip package is empty.');
  }

  const topSegments = new Set(rawFiles.map((f) => f.relPath.split('/')[0]));
  const allNested = rawFiles.every((f) => f.relPath.includes('/'));
  const singleTopDir =
    allNested && topSegments.size === 1 ? [...topSegments][0] : undefined;

  const entries = singleTopDir
    ? rawFiles.map((f) => ({
        relPath: f.relPath.slice(singleTopDir.length + 1),
        buffer: f.buffer,
      }))
    : rawFiles;

  if (!entries.some((f) => f.relPath === 'index.js')) {
    throw new BadRequestException(
      'Screen package must contain index.js at root or inside a single top-level folder.',
    );
  }

  return { entries, singleTopDir };
}

function readManifestVariantId(entries: NormalizedZipEntry[]): string {
  const manifestEntry = entries.find((f) => f.relPath === 'webgal-screen.json');
  if (!manifestEntry) return '';
  try {
    const parsed = JSON.parse(manifestEntry.buffer.toString('utf8')) as {
      id?: unknown;
      name?: unknown;
    };
    if (typeof parsed.id === 'string') return parsed.id;
    if (typeof parsed.name === 'string') return parsed.name;
  } catch {
    // 忽略非合法 JSON 清单，使用回退名称
  }
  return '';
}

async function resolveUniqueVariantId(
  screenDir: string,
  screen: UiScreenId,
  baseId: string,
): Promise<string> {
  const isAvailable = async (candidate: string): Promise<boolean> => {
    if (isBuiltInVariant(screen, candidate)) return false;
    try {
      await fsp.access(join(screenDir, candidate));
      return false;
    } catch {
      return true;
    }
  };

  if (await isAvailable(baseId)) return baseId;
  for (let index = 2; index < 10000; index += 1) {
    const candidate = `${baseId}-${index}`;
    if (await isAvailable(candidate)) return candidate;
  }
  throw new BadRequestException('Failed to allocate unique variantId.');
}

function isInsideRoot(targetPath: string, rootPath: string): boolean {
  const rel = relative(resolve(rootPath), resolve(targetPath));
  return rel !== '' && !rel.startsWith('..') && !rel.includes(`..${sep}`);
}

export async function extractScreenPackage(
  options: ExtractScreenPackageOptions,
): Promise<ExtractScreenPackageResult> {
  const { entries, singleTopDir } = normalizeZipEntries(options.buffer);

  const fileBaseName = options.originalname
    ? basename(options.originalname, '.zip')
    : '';
  const baseCandidate =
    sanitizeVariantCandidate(options.requestedVariantId) ||
    sanitizeVariantCandidate(singleTopDir) ||
    sanitizeVariantCandidate(readManifestVariantId(entries)) ||
    sanitizeVariantCandidate(fileBaseName) ||
    'custom-screen';

  const screenDir = join(options.templateRoot, 'screens', options.screen);
  await fsp.mkdir(screenDir, { recursive: true });

  const variantId = await resolveUniqueVariantId(
    screenDir,
    options.screen,
    baseCandidate,
  );
  const variantRoot = join(screenDir, variantId);
  await fsp.mkdir(variantRoot, { recursive: true });

  try {
    for (const file of entries) {
      const targetPath = join(variantRoot, file.relPath);
      if (!isInsideRoot(targetPath, variantRoot)) {
        throw new BadRequestException(
          'Screen package entry escapes target dir.',
        );
      }
      await fsp.mkdir(dirname(targetPath), { recursive: true });
      await fsp.writeFile(targetPath, file.buffer);
    }

    const scssFilePath = join(variantRoot, 'style.scss');
    try {
      await fsp.access(scssFilePath);
    } catch {
      await fsp.writeFile(scssFilePath, '');
    }
  } catch (error) {
    await fsp
      .rm(variantRoot, { recursive: true, force: true })
      .catch(() => undefined);
    throw error;
  }

  return {
    variantId,
    scssPath: `screens/${options.screen}/${variantId}/style.scss`,
  };
}
