import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleLogger } from '@nestjs/common';
import * as asar from '@electron/asar';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
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
});
