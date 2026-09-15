import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { UserDataService } from '../../user-data/user-data.service';
import { ScannerService } from './scanner.service';

describe('ScannerService', () => {
  let root: string;

  beforeEach(async () => {
    root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'webgal-scanner-'));
    (UserDataService as any).state = { activeUserDataRoot: root };
  });

  afterEach(async () => {
    (UserDataService as any).state = null;
    await fs.promises.rm(root, { recursive: true, force: true });
  });

  it('returns an empty list when the third-party-ls directory is missing', async () => {
    const scanner = new ScannerService();
    await expect(scanner.scanServers()).resolves.toEqual({ servers: [] });
  });

  it('loads a valid launcher and exposes it by id', async () => {
    const serverDir = path.join(root, 'third-party-ls', 'my-lsp');
    await fs.promises.mkdir(serverDir, { recursive: true });
    await fs.promises.writeFile(
      path.join(serverDir, 'start.js'),
      `module.exports = { name: 'My LSP', start: async () => ({ reader: {}, writer: {} }) };`,
    );

    const scanner = new ScannerService();
    await expect(scanner.scanServers()).resolves.toEqual({
      servers: [{ id: 'my-lsp', name: 'My LSP' }],
    });
    expect(scanner.getLauncherById('my-lsp')).toMatchObject({ name: 'My LSP' });
  });

  it('skips a launcher without a start function', async () => {
    const serverDir = path.join(root, 'third-party-ls', 'broken');
    await fs.promises.mkdir(serverDir, { recursive: true });
    await fs.promises.writeFile(
      path.join(serverDir, 'start.js'),
      `module.exports = { name: 'Broken' };`,
    );

    const scanner = new ScannerService();
    await expect(scanner.scanServers()).resolves.toEqual({ servers: [] });
    expect(scanner.getLauncherById('broken')).toBeNull();
  });

  it('falls back to the directory name when the launcher has no name', async () => {
    const serverDir = path.join(root, 'third-party-ls', 'unnamed');
    await fs.promises.mkdir(serverDir, { recursive: true });
    await fs.promises.writeFile(
      path.join(serverDir, 'start.js'),
      `module.exports = { start: async () => ({ reader: {}, writer: {} }) };`,
    );

    const scanner = new ScannerService();
    await expect(scanner.scanServers()).resolves.toEqual({
      servers: [{ id: 'unnamed', name: 'unnamed' }],
    });
  });
});
