import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { WorkspaceEditApplier } from './workspaceEdit';

describe('WorkspaceEditApplier', () => {
  let dir: string;
  const callbacks = {
    sendDidChange: jest.fn(),
    sendDidChangeWatchedFiles: jest.fn(),
    logError: jest.fn(),
  };
  // 测试里直接把 URI 当作本地路径，避免与具体平台的 file:// 表示耦合。
  const applier = new WorkspaceEditApplier((uri) => uri, callbacks);

  beforeEach(async () => {
    jest.clearAllMocks();
    dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'webgal-workspace-edit-'));
  });

  afterEach(async () => {
    await fs.promises.rm(dir, { recursive: true, force: true });
  });

  it('applies multiple text edits from back to front', async () => {
    const file = path.join(dir, 'scene.txt');
    await fs.promises.writeFile(file, 'hello world');

    const ok = await applier.apply({
      changes: {
        [file]: [
          {
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } },
            newText: 'HELLO',
          },
          {
            range: { start: { line: 0, character: 6 }, end: { line: 0, character: 11 } },
            newText: 'WORLD',
          },
        ],
      },
    });

    expect(ok).toBe(true);
    await expect(fs.promises.readFile(file, 'utf8')).resolves.toBe('HELLO WORLD');
    expect(callbacks.sendDidChange).toHaveBeenCalledWith(file, 'HELLO WORLD', expect.any(Number));
  });

  it('applies TextDocumentEdit and bumps the version', async () => {
    const file = path.join(dir, 'scene.txt');
    await fs.promises.writeFile(file, 'abc');

    const ok = await applier.apply({
      documentChanges: [
        {
          textDocument: { uri: file, version: 3 },
          edits: [
            {
              range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } },
              newText: 'xyz',
            },
          ],
        },
      ],
    });

    expect(ok).toBe(true);
    await expect(fs.promises.readFile(file, 'utf8')).resolves.toBe('xyz');
    expect(callbacks.sendDidChange).toHaveBeenCalledWith(file, 'xyz', 4);
  });

  it('creates, renames and deletes files', async () => {
    const created = path.join(dir, 'new.txt');
    const renamed = path.join(dir, 'renamed.txt');

    await applier.apply({ documentChanges: [{ kind: 'create', uri: created }] });
    await expect(fs.promises.readFile(created, 'utf8')).resolves.toBe('');

    await applier.apply({ documentChanges: [{ kind: 'rename', oldUri: created, newUri: renamed }] });
    await expect(fs.promises.stat(renamed)).resolves.toBeDefined();

    await applier.apply({ documentChanges: [{ kind: 'delete', uri: renamed }] });
    await expect(fs.promises.stat(renamed)).rejects.toBeDefined();
  });

  it('reports failure when the target file does not exist', async () => {
    const ok = await applier.apply({
      changes: {
        [path.join(dir, 'missing.txt')]: [
          {
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            newText: 'x',
          },
        ],
      },
    });

    expect(ok).toBe(false);
    expect(callbacks.logError).toHaveBeenCalled();
  });
});
