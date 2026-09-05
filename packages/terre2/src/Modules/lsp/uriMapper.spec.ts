import * as os from 'os';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { UserDataService } from '../user-data/user-data.service';
import { resolveWorkspaceUri, UriMapper } from './uriMapper';

const activeUserDataRoot = path.join(os.tmpdir(), 'webgal-uri-mapper-spec');

beforeAll(() => {
  (UserDataService as any).state = { activeUserDataRoot };
});

afterAll(() => {
  (UserDataService as any).state = null;
});

describe('UriMapper', () => {
  it('maps a relative path to a file URL and back to the client URI', () => {
    const mapper = new UriMapper();
    const fileUri = mapper.toFileUri('games/demo/game/scene.txt');

    expect(fileUri).toBe(
      pathToFileURL(path.resolve(activeUserDataRoot, 'games/demo/game/scene.txt')).toString(),
    );
    expect(mapper.toClientUri(fileUri)).toBe('games/demo/game/scene.txt');
  });

  it('keeps absolute file URLs unchanged', () => {
    const mapper = new UriMapper();
    const abs = pathToFileURL(path.resolve(activeUserDataRoot, 'a.txt')).toString();
    expect(mapper.toFileUri(abs)).toBe(abs);
  });

  it('strips the file protocol down to a native path', () => {
    const mapper = new UriMapper();
    const absPath = path.resolve(activeUserDataRoot, 'games/demo/game/scene.txt');
    expect(mapper.stripFileProtocol(pathToFileURL(absPath).toString())).toBe(absPath);
  });
});

describe('resolveWorkspaceUri', () => {
  it('resolves a base path against the active user data root', () => {
    expect(resolveWorkspaceUri('games/demo/game/')).toBe(
      pathToFileURL(path.resolve(activeUserDataRoot, 'games/demo/game/')).toString(),
    );
  });

  it('returns null for an empty base path', () => {
    expect(resolveWorkspaceUri('')).toBeNull();
    expect(resolveWorkspaceUri('   ')).toBeNull();
  });
});
