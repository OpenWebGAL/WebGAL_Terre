import { BadRequestException } from '@nestjs/common';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';
import {
  createAnimationEntity,
  createCharacterEntity,
  createSceneEntity,
} from './game-entity-creator';

describe('game-entity-creator', () => {
  const createFsMock = (existingPaths: string[] = []) => {
    const existing = new Set(existingPaths);
    const written = new Map<string, string>();
    const mock = {
      getPathFromRoot: jest.fn((raw: string) => `/root${raw}`),
      exists: jest.fn(async (target: string) => existing.has(target)),
      createEmptyFile: jest.fn(async (target: string) => {
        existing.add(target);
        written.set(target, '');
        return 'created';
      }),
      updateTextFile: jest.fn(async (target: string, content: string) => {
        written.set(target, content);
        return 'Updated.';
      }),
    };
    return { fsMock: mock as unknown as WebgalFsService, written };
  };

  describe('createSceneEntity', () => {
    it('creates an empty .txt scene and strips duplicate .txt suffix', async () => {
      const { fsMock, written } = createFsMock();
      await createSceneEntity(fsMock, 'demo', 'chapter1/ep1.txt');
      expect(
        written.get('/root/public/games/demo/game/scene/chapter1/ep1.txt'),
      ).toBe('');
    });

    it('rejects existing scenes and traversal paths', async () => {
      const { fsMock } = createFsMock([
        '/root/public/games/demo/game/scene/start.txt',
      ]);
      await expect(createSceneEntity(fsMock, 'demo', 'start')).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        createSceneEntity(fsMock, 'demo', '../escape'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createAnimationEntity', () => {
    it('creates a valid v2 animation JSON and updates animationTable', async () => {
      const { fsMock, written } = createFsMock();
      const updateAnimationTable = jest.fn(async () => true);

      await createAnimationEntity(
        fsMock,
        'demo',
        'ui/fadeIn.json',
        updateAnimationTable,
      );

      const content = written.get(
        '/root/public/games/demo/game/animation/ui/fadeIn.json',
      );
      expect(JSON.parse(content ?? '')).toEqual({
        version: 2,
        keyframes: [],
      });
      expect(updateAnimationTable).toHaveBeenCalledWith('demo');
    });

    it('rejects reserved animationTable name', async () => {
      const { fsMock } = createFsMock();
      await expect(
        createAnimationEntity(
          fsMock,
          'demo',
          'animationTable',
          async () => true,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createCharacterEntity', () => {
    it('creates character directory and v1 figure.json', async () => {
      const { fsMock, written } = createFsMock();
      await createCharacterEntity(fsMock, 'demo', 'heroines/sae');

      const content = written.get(
        '/root/public/games/demo/game/figure/heroines/sae/figure.json',
      );
      expect(JSON.parse(content ?? '')).toEqual({
        version: 1,
        canvas: { width: 2560, height: 1440 },
        components: [],
        presets: {},
      });
    });

    it('rejects existing character directory or reserved none', async () => {
      const { fsMock } = createFsMock([
        '/root/public/games/demo/game/figure/sae',
      ]);
      await expect(
        createCharacterEntity(fsMock, 'demo', 'sae'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        createCharacterEntity(fsMock, 'demo', 'none'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
