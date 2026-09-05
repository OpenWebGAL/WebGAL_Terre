import * as chokidar from 'chokidar';
import { FileWatcherRegistry } from './fileWatcherRegistry';

jest.mock('chokidar', () => ({
  watch: jest.fn(),
}));

interface FakeWatcher {
  on: jest.Mock;
  close: jest.Mock;
}

function makeWatcher(): FakeWatcher {
  return {
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  };
}

describe('FileWatcherRegistry', () => {
  const onEvent = jest.fn();
  const logError = jest.fn();
  const stripFileProtocol = jest.fn((uri: string) => uri.replace(/^file:\/\//, ''));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a watcher and maps events to FileChangeType', () => {
    const watcher = makeWatcher();
    (chokidar.watch as jest.Mock).mockReturnValue(watcher);

    const registry = new FileWatcherRegistry({
      getWorkspaceUri: () => 'file:///root',
      getBasePath: () => '',
      stripFileProtocol,
      onEvent,
      logError,
    });

    registry.register('id1', ['**/*.txt'], 7);

    expect(chokidar.watch).toHaveBeenCalledWith(
      ['**/*.txt'],
      expect.objectContaining({ cwd: '/root' }),
    );

    const changeHandler = watcher.on.mock.calls.find(([event]) => event === 'change')?.[1];
    changeHandler('sub/file.txt');
    expect(onEvent).toHaveBeenCalledWith({ uri: expect.stringContaining('file.txt'), type: 2 });
  });

  it('respects the WatchKind bitmask', () => {
    const watcher = makeWatcher();
    (chokidar.watch as jest.Mock).mockReturnValue(watcher);

    const registry = new FileWatcherRegistry({
      getWorkspaceUri: () => 'file:///root',
      getBasePath: () => '',
      stripFileProtocol,
      onEvent,
      logError,
    });

    // 只关心删除（WatchKind.Delete = 4）
    registry.register('id1', ['**/*'], 4);

    const addHandler = watcher.on.mock.calls.find(([event]) => event === 'add')?.[1];
    const unlinkHandler = watcher.on.mock.calls.find(([event]) => event === 'unlink')?.[1];

    addHandler('x.txt');
    expect(onEvent).not.toHaveBeenCalled();

    unlinkHandler('x.txt');
    expect(onEvent).toHaveBeenCalledWith({ uri: expect.stringContaining('x.txt'), type: 3 });
  });

  it('queues registrations until a workspace is available', () => {
    let workspaceUri: string | null = null;
    const registry = new FileWatcherRegistry({
      getWorkspaceUri: () => workspaceUri,
      getBasePath: () => '',
      stripFileProtocol,
      onEvent,
      logError,
    });

    registry.register('id1', ['**/*']);
    expect(chokidar.watch).not.toHaveBeenCalled();

    workspaceUri = 'file:///root';
    registry.processPending();
    expect(chokidar.watch).toHaveBeenCalled();
  });

  it('closes the watcher on unregister', () => {
    const watcher = makeWatcher();
    (chokidar.watch as jest.Mock).mockReturnValue(watcher);

    const registry = new FileWatcherRegistry({
      getWorkspaceUri: () => 'file:///root',
      getBasePath: () => '',
      stripFileProtocol,
      onEvent,
      logError,
    });

    registry.register('id1', ['**/*']);
    registry.unregister('id1');

    expect(watcher.close).toHaveBeenCalled();
  });

  it('recreates watchers when the workspace changes', () => {
    const first = makeWatcher();
    const second = makeWatcher();
    (chokidar.watch as jest.Mock).mockReturnValueOnce(first).mockReturnValueOnce(second);

    let workspaceUri = 'file:///root';
    const registry = new FileWatcherRegistry({
      getWorkspaceUri: () => workspaceUri,
      getBasePath: () => '',
      stripFileProtocol,
      onEvent,
      logError,
    });

    registry.register('id1', ['**/*']);
    expect(chokidar.watch).toHaveBeenCalledTimes(1);

    workspaceUri = 'file:///other-root';
    registry.reinitialize();

    expect(first.close).toHaveBeenCalled();
    expect(chokidar.watch).toHaveBeenCalledTimes(2);
  });
});
