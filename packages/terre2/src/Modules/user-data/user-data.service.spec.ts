import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { UserDataService } from './user-data.service';
import { TERRE_VERSION } from '../../version';

describe('UserDataService', () => {
  const testRoot = path.join(
    process.cwd(),
    'tmp',
    'user-data-service-spec',
    `run-${Date.now()}`,
  );

  afterEach(async () => {
    jest.restoreAllMocks();
    (UserDataService as any).state = null;
    await fs.rm(testRoot, { recursive: true, force: true });
  });

  it('uses the home directory as the default user data root on every platform', () => {
    const home = path.join(testRoot, 'home');
    jest.spyOn(os, 'homedir').mockReturnValue(home);

    expect((UserDataService as any).getDefaultUserDataRoot()).toBe(
      path.join(home, '.webgal_terre'),
    );
  });

  it('creates managed user data directories even when the data root is empty', async () => {
    const activeUserDataRoot = path.join(testRoot, '.webgal_terre');
    (UserDataService as any).state = {
      appRoot: testRoot,
      configRoot: activeUserDataRoot,
      configPath: path.join(activeUserDataRoot, 'config.json'),
      defaultUserDataRoot: activeUserDataRoot,
      configuredUserDataRoot: activeUserDataRoot,
      activeUserDataRoot,
      portableDataRoot: path.join(testRoot, 'data'),
      isPortable: false,
      hasPortableDataDir: false,
      config: { version: TERRE_VERSION },
    };

    await (UserDataService as any).ensureStateDirectories();

    await expect(
      fs.stat(path.join(activeUserDataRoot, 'games')),
    ).resolves.toBeDefined();
    await expect(
      fs.stat(path.join(activeUserDataRoot, 'templates')),
    ).resolves.toBeDefined();
    await expect(
      fs.stat(path.join(activeUserDataRoot, 'derivative-engines')),
    ).resolves.toBeDefined();
    await expect(
      fs.stat(path.join(activeUserDataRoot, 'Exported_Games')),
    ).resolves.toBeDefined();
  });

  it('normalizes config version to the current Terre version', async () => {
    const configPath = path.join(testRoot, 'config.json');
    const customPath = path.join(testRoot, 'custom-data');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(
      configPath,
      JSON.stringify({ version: 1, userDataPath: customPath }),
    );

    const config = await (UserDataService as any).readConfig(configPath);

    expect(config).toEqual({
      version: TERRE_VERSION,
      userDataPath: customPath,
    });
  });
});
