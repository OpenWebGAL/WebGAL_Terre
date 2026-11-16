import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConsoleLogger } from '@nestjs/common';
import * as asar from '@electron/asar';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import { basename, dirname, join, resolve } from 'path';
import { ManageGameService } from './manage-game.service';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';

jest.mock('trash', () => ({ default: jest.fn() }));

describe('ManageGameService', () => {
  let service: ManageGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageGameService,
        {
          provide: ConsoleLogger,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
        {
          provide: WebgalFsService,
          useValue: {
            deleteFileOrDirectory: (target: string) =>
              fs.rm(target, { recursive: true, force: true }),
          },
        },
      ],
    }).compile();

    service = module.get<ManageGameService>(ManageGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ASAR native dependencies', () => {
    let testRoot: string;

    beforeEach(async () => {
      testRoot = await fs.mkdtemp(join(tmpdir(), 'terre-asar-'));
    });

    afterEach(async () => {
      await fs.rm(testRoot, { recursive: true, force: true });
    });

    it.each(['regular-export', '.webgal_terre/Exported_Games/新的游戏'])(
      'keeps native dependencies unpacked and portable under %s',
      async (exportRoot) => {
        const resourcesDir = join(
          testRoot,
          exportRoot,
          'WebGAL.app',
          'Contents',
          'Resources',
        );
        const appDir = join(resourcesDir, 'app');
        const asarPath = join(resourcesDir, 'app.asar');
        const nativeFiles = [
          join('osx', 'steamworksjs.darwin-arm64.node'),
          join('osx', 'libsteam_api.dylib'),
          join('linux64', 'steamworksjs.linux-x64-gnu.node'),
          join('linux64', 'libsteam_api.so'),
          join('win64', 'steamworksjs.win32-x64-msvc.node'),
          join('win64', 'steam_api64.dll'),
        ].map((file) => join('node_modules', 'steamworks.js', 'dist', file));
        for (const file of nativeFiles) {
          const target = join(appDir, file);
          await fs.mkdir(dirname(target), { recursive: true });
          await fs.writeFile(target, file);
        }
        const indexPath = join('node_modules', 'steamworks.js', 'index.js');
        await fs.writeFile(join(appDir, indexPath), 'module.exports = {};');
        await fs.mkdir(join(appDir, 'public'));
        await fs.writeFile(
          join(appDir, 'public', 'index.html'),
          '<html></html>',
        );

        const pack = (
          service as unknown as {
            packElectronAppAsar: (
              source: string,
              destination: string,
            ) => Promise<void>;
          }
        ).packElectronAppAsar.bind(service);
        await pack(appDir, asarPath);

        for (const file of nativeFiles) {
          expect(asar.statFile(asarPath, file)).toMatchObject({
            unpacked: true,
          });
          expect(
            await fs.readFile(join(`${asarPath}.unpacked`, file), 'utf8'),
          ).toBe(file);
        }
        for (const file of [indexPath, join('public', 'index.html')]) {
          expect(asar.statFile(asarPath, file)).not.toHaveProperty(
            'unpacked',
            true,
          );
        }
        await expect(fs.stat(appDir)).rejects.toMatchObject({ code: 'ENOENT' });

        // 归档和原生库一起迁移后，依赖仍可从对应的解包目录读取。
        const movedAsar = join(testRoot, 'moved', 'app.asar');
        await fs.mkdir(dirname(movedAsar));
        await fs.rename(asarPath, movedAsar);
        await fs.rename(`${asarPath}.unpacked`, `${movedAsar}.unpacked`);
        for (const file of nativeFiles) {
          expect(asar.extractFile(movedAsar, file).toString()).toBe(file);
        }
      },
    );
  });

  describe('createGame', () => {
    const logger = {
      log: jest.fn(),
      error: jest.fn(),
    } as unknown as ConsoleLogger;
    let creationService: ManageGameService;
    let webgalFs: {
      getDirInfo: jest.Mock;
      getPathFromRoot: jest.Mock;
      mkdir: jest.Mock;
      copy: jest.Mock;
      replaceTextFile: jest.Mock;
      deleteFileOrDirectory: jest.Mock;
    };

    beforeEach(() => {
      webgalFs = {
        getDirInfo: jest.fn().mockResolvedValue([]),
        getPathFromRoot: jest.fn((path: string) => path),
        mkdir: jest.fn().mockResolvedValue(undefined),
        copy: jest.fn().mockResolvedValue(true),
        replaceTextFile: jest.fn().mockResolvedValue(undefined),
        deleteFileOrDirectory: jest.fn().mockResolvedValue(true),
      };
      creationService = new ManageGameService(
        logger,
        webgalFs as unknown as WebgalFsService,
      );
    });

    it.each([
      'MyGame.',
      'MyGame ',
      'MyGame...',
      'MyGame. ',
      '.',
      '..',
      '',
      '   ',
      'bad/name',
      undefined,
      null,
      123,
    ])(
      'rejects invalid directory %j before accessing the filesystem',
      async (gameDir) => {
        await expect(
          creationService.createGame({
            gameName: 'My game',
            gameDir: gameDir as string,
          }),
        ).rejects.toThrow(BadRequestException);

        expect(webgalFs.getDirInfo).not.toHaveBeenCalled();
        expect(webgalFs.mkdir).not.toHaveBeenCalled();
        expect(webgalFs.copy).not.toHaveBeenCalled();
        expect(webgalFs.replaceTextFile).not.toHaveBeenCalled();
      },
    );

    it.each(['MyGame', 'My.Game', 'My Game', '.MyGame', '物語', 'قصة'])(
      'creates a project with valid directory %j and preserves its display title',
      async (gameDir) => {
        await expect(
          creationService.createGame({
            gameName: 'A story.',
            gameDir,
            ignoreTemplate: true,
          }),
        ).resolves.toBe(true);

        expect(webgalFs.mkdir).toHaveBeenCalledWith('/public/games', gameDir);
        expect(webgalFs.replaceTextFile).toHaveBeenCalledWith(
          `/public/games/${gameDir}/game/config.txt`,
          /Game_name:.*?;/,
          'Game_name:A story.;',
        );
      },
    );

    it('returns the directory validation error for a direct API caller', async () => {
      await expect(
        creationService.createGame({ gameName: 'My game', gameDir: 'MyGame ' }),
      ).rejects.toMatchObject({
        response: {
          statusCode: 400,
          message: 'Game directory names cannot end with a dot or a space.',
        },
      });

      await expect(
        creationService.createGame({
          gameName: 'My game',
          gameDir: undefined as unknown as string,
        }),
      ).rejects.toMatchObject({
        response: {
          statusCode: 400,
          message: 'Game directory name is required.',
        },
      });
    });

    it('still rejects an existing directory without writing to it', async () => {
      webgalFs.getDirInfo.mockResolvedValue([{ name: 'MyGame', isDir: true }]);

      await expect(
        creationService.createGame({ gameName: 'My game', gameDir: 'mygame' }),
      ).resolves.toBe(false);
      expect(webgalFs.mkdir).not.toHaveBeenCalled();
      expect(webgalFs.copy).not.toHaveBeenCalled();
    });

    it('creates and reads a real project with dots, spaces and Unicode in its directory', async () => {
      const testRoot = await fs.mkdtemp(join(tmpdir(), 'terre-project-name-'));
      try {
        const gameDir = 'My.Game 物語';
        const template = join(
          testRoot,
          'assets/templates/WebGAL_Template/game',
        );
        const games = join(testRoot, 'public/games');
        await fs.mkdir(template, { recursive: true });
        await fs.mkdir(games, { recursive: true });
        await fs.writeFile(
          join(template, 'config.txt'),
          'Game_name:Template;\n',
        );

        const realFs = new WebgalFsService(logger);
        jest
          .spyOn(realFs, 'getPathFromRoot')
          .mockImplementation((path: string) => join(testRoot, path));
        const realService = new ManageGameService(logger, realFs);

        await expect(
          realService.createGame({
            gameName: 'A story.',
            gameDir,
            ignoreTemplate: true,
          }),
        ).resolves.toBe(true);
        expect(await fs.readdir(games)).toEqual([gameDir]);
        expect(
          await fs.readFile(join(games, gameDir, 'game/config.txt'), 'utf8'),
        ).toBe('Game_name:A story.;\n');
      } finally {
        if (
          resolve(dirname(testRoot)) !== resolve(tmpdir()) ||
          !basename(testRoot).startsWith('terre-project-name-')
        ) {
          throw new Error('Unexpected test directory');
        }
        await fs.rm(testRoot, { recursive: true, force: true });
      }
    });
  });
});
