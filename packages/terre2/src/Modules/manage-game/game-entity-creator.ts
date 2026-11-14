import { BadRequestException } from '@nestjs/common';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';

const INITIAL_ANIMATION_CONTENT = `${JSON.stringify(
  {
    version: 2,
    keyframes: [],
  },
  null,
  2,
)}\n`;

const INITIAL_CHARACTER_CONTENT = `${JSON.stringify(
  {
    version: 1,
    canvas: {
      width: 2560,
      height: 1440,
    },
    components: [],
    presets: {},
  },
  null,
  2,
)}\n`;

function isValidSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment.trim() === segment &&
    segment !== '.' &&
    segment !== '..' &&
    !segment.endsWith('.') &&
    WebgalFsService.checkFileName(segment)
  );
}

export function normalizeGameDirName(gameName: string): string {
  const trimmed = (gameName ?? '').trim();
  if (
    !trimmed ||
    trimmed.includes('/') ||
    trimmed.includes('\\') ||
    !isValidSegment(trimmed)
  ) {
    throw new BadRequestException('Invalid game name');
  }
  return trimmed;
}

export function normalizeEntityRelativePath(
  rawName: string,
  optionalExt?: string,
): string {
  const normalized = (rawName ?? '').replace(/\\/g, '/').trim();
  const stripped = optionalExt
    ? normalized.replace(
        new RegExp(`${optionalExt.replace('.', '\\.')}$`, 'i'),
        '',
      )
    : normalized;
  const segments = stripped.split('/');
  if (!stripped || segments.some((segment) => !isValidSegment(segment))) {
    throw new BadRequestException('Invalid entity name');
  }
  return segments.join('/');
}

async function writeNewEntityFile(
  webgalFs: WebgalFsService,
  targetPath: string,
  content: string,
  errorLabel: string,
): Promise<void> {
  const created = await webgalFs.createEmptyFile(targetPath);
  if (created !== 'created') {
    throw new BadRequestException(`Failed to create ${errorLabel}`);
  }
  if (content.length > 0) {
    const updated = await webgalFs.updateTextFile(targetPath, content);
    if (updated !== 'Updated.') {
      throw new BadRequestException(`Failed to initialize ${errorLabel}`);
    }
  }
}

export async function createSceneEntity(
  webgalFs: WebgalFsService,
  gameName: string,
  sceneName: string,
): Promise<void> {
  const validGame = normalizeGameDirName(gameName);
  const relativeScene = normalizeEntityRelativePath(sceneName, '.txt');
  const targetPath = webgalFs.getPathFromRoot(
    `/public/games/${validGame}/game/scene/${relativeScene}.txt`,
  );
  if (await webgalFs.exists(targetPath)) {
    throw new BadRequestException('Scene already exists');
  }
  await writeNewEntityFile(webgalFs, targetPath, '', 'scene');
}

export async function createAnimationEntity(
  webgalFs: WebgalFsService,
  gameName: string,
  animationName: string,
  updateAnimationTable: (gameDir: string) => Promise<boolean>,
): Promise<void> {
  const validGame = normalizeGameDirName(gameName);
  const relativeAnim = normalizeEntityRelativePath(animationName, '.json');
  if (relativeAnim.toLowerCase() === 'animationtable') {
    throw new BadRequestException('Animation name is reserved');
  }
  const targetPath = webgalFs.getPathFromRoot(
    `/public/games/${validGame}/game/animation/${relativeAnim}.json`,
  );
  if (await webgalFs.exists(targetPath)) {
    throw new BadRequestException('Animation already exists');
  }
  await writeNewEntityFile(
    webgalFs,
    targetPath,
    INITIAL_ANIMATION_CONTENT,
    'animation',
  );
  await updateAnimationTable(validGame);
}

export async function createCharacterEntity(
  webgalFs: WebgalFsService,
  gameName: string,
  characterName: string,
): Promise<void> {
  const validGame = normalizeGameDirName(gameName);
  const relativeChar = normalizeEntityRelativePath(characterName);
  if (relativeChar.toLowerCase() === 'none') {
    throw new BadRequestException('Character name is reserved');
  }
  const characterDirPath = webgalFs.getPathFromRoot(
    `/public/games/${validGame}/game/figure/${relativeChar}`,
  );
  if (await webgalFs.exists(characterDirPath)) {
    throw new BadRequestException('Character already exists');
  }
  const figureJsonPath = webgalFs.getPathFromRoot(
    `/public/games/${validGame}/game/figure/${relativeChar}/figure.json`,
  );
  await writeNewEntityFile(
    webgalFs,
    figureJsonPath,
    INITIAL_CHARACTER_CONTENT,
    'character',
  );
}
