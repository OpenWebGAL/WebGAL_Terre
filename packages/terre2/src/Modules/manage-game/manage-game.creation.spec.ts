import { BadRequestException, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import { basename, dirname, join, resolve } from 'path';
import { ManageGameService } from './manage-game.service';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';

jest.mock('trash', () => ({ default: jest.fn() }));

describe('ManageGameService project creation', () => {
  const logger = {
    log: jest.fn(),
    error: jest.fn(),
  } as unknown as ConsoleLogger;
  let service: ManageGameService;
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
    service = new ManageGameService(
      logger,
      webgalFs as unknown as WebgalFsService,
    );
  });

  it.each(['MyGame.', 'MyGame ', 'MyGame...', 'MyGame. ', '.', '..'])(
    'rejects directory %j before accessing the filesystem',
    async (gameDir) => {
      await expect(
        service.createGame({ gameName: 'My game', gameDir }),
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
        service.createGame({
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
      service.createGame({ gameName: 'My game', gameDir: 'MyGame ' }),
    ).rejects.toMatchObject({
      response: {
        statusCode: 400,
        message: 'Game directory names cannot end with a dot or a space.',
      },
    });
  });

  it('still rejects an existing directory without writing to it', async () => {
    webgalFs.getDirInfo.mockResolvedValue([{ name: 'MyGame', isDir: true }]);

    await expect(
      service.createGame({ gameName: 'My game', gameDir: 'mygame' }),
    ).resolves.toBe(false);
    expect(webgalFs.mkdir).not.toHaveBeenCalled();
    expect(webgalFs.copy).not.toHaveBeenCalled();
  });

  it('creates and reads a real project with dots, spaces and Unicode in its directory', async () => {
    const testRoot = await fs.mkdtemp(join(tmpdir(), 'terre-project-name-'));
    try {
      const gameDir = 'My.Game 物語';
      const template = join(testRoot, 'assets/templates/WebGAL_Template/game');
      const games = join(testRoot, 'public/games');
      await fs.mkdir(template, { recursive: true });
      await fs.mkdir(games, { recursive: true });
      await fs.writeFile(join(template, 'config.txt'), 'Game_name:Template;\n');

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
