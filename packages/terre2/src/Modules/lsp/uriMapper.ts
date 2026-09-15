import { pathToFileURL } from 'url';
import * as path from 'path';
import { UserDataService } from '../user-data/user-data.service';

/**
 * 客户端侧的 URI 与第三方 LSP 期望的 `file://` URI 之间往往不一致：
 * 客户端可能用相对路径、`games/<name>/game/...` 之类的业务路径，甚至去掉
 * `file://` 前缀。这里负责双向映射，保证转发给第三方 LSP 的 URI 是它认识的
 * 绝对 `file://` URI，而第三方回传的 URI 也能还原成客户端能定位的样子。
 */
export class UriMapper {
  private readonly uriMap = new Map<string, string>();
  private readonly reverseUriMap = new Map<string, string>();

  /** 客户端 URI -> 第三方 LSP 的 `file://` URI。 */
  toFileUri(originalUri: string): string {
    let fileUri = this.uriMap.get(originalUri);
    if (!fileUri) {
      fileUri = normalizeUri(originalUri);
      if (fileUri !== originalUri) {
        this.uriMap.set(originalUri, fileUri);
        this.reverseUriMap.set(fileUri, originalUri);
      }
    }
    return fileUri;
  }

  /** 第三方 LSP 回传的 `file://` URI -> 客户端 URI。 */
  toClientUri(fileUri: string): string {
    return this.reverseUriMap.get(fileUri) || fileUri;
  }

  /** 把 `file://` URI 或普通路径转成本地文件系统绝对路径。 */
  stripFileProtocol(uriPath: string): string {
    if (!uriPath) return '';
    let p = uriPath.replace(/^file:\/\/\/?/, '');
    try {
      p = decodeURI(p);
    } catch {
      /* 保留原样 */
    }
    if (process.platform === 'win32') {
      if (p.startsWith('/')) p = p.substring(1);
      p = p.replace(/\//g, '\\');
    }
    return p;
  }

  clear(): void {
    this.uriMap.clear();
    this.reverseUriMap.clear();
  }
}

/** 把一条业务路径解析成 `file://` URI。basePath 为空时返回 null。 */
export function resolveWorkspaceUri(basePath: string): string | null {
  if (!basePath || !basePath.trim()) return null;
  const absolutePath = path.resolve(
    UserDataService.getState().activeUserDataRoot,
    basePath,
  );
  return pathToFileURL(absolutePath).toString();
}

function normalizeUri(originalUri: string): string {
  if (originalUri.startsWith('file://')) {
    const pathPart = originalUri.replace(/^file:\/\/\/?/, '');
    if (/^[A-Za-z]:[\\/]/i.test(pathPart) || pathPart.startsWith('/')) {
      try {
        const decoded = decodeURI(pathPart);
        if (/^[A-Za-z]:[\\/]/i.test(decoded) || decoded.startsWith('/')) {
          return originalUri;
        }
      } catch {
        /* fall through to relative resolution */
      }
    }
  }

  const state = UserDataService.getState();
  let relativePath = originalUri.replace(/^file:\/\/\/?/, '').replace(/^\/+/, '');
  if (originalUri.includes('://') && !originalUri.startsWith('file://')) {
    relativePath = originalUri.split('://')[1] || '';
  }
  if (!relativePath) return originalUri;

  let decodedRelativePath = relativePath;
  try {
    decodedRelativePath = decodeURI(relativePath);
  } catch {
    /* keep raw */
  }

  const absolutePath = path.resolve(state.activeUserDataRoot, decodedRelativePath);
  return pathToFileURL(absolutePath).toString();
}
