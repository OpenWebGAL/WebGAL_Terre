/* ----------------------------------------------------------------------------
 * Copyright (c) 2024 OpenWebGAL
 * Modified from https://github.com/TypeFox/monaco-languageclient/blob/main/
 * packages/examples/src/bare/client.ts
 *
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 * ------------------------------------------------------------------------- */
import * as vscode from 'vscode';
import * as monaco from 'monaco-editor';
import { initServices } from 'monaco-languageclient/vscode/services';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import getConfigurationServiceOverride, {
  updateUserConfiguration,
} from '@codingame/monaco-vscode-configuration-service-override';
import './extension';
import { getWsUrl } from '@/utils/getWsUrl';
import useEditorStore, { registerSubPageChangedCallback } from '@/store/useEditorStore';

// ----- 存储工具：持久化当前选择的 LSP ID -----
const STORAGE_KEY = 'webgal-active-lsp-id';

export const saveActiveLspId = (id: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore
  }
};

export const loadActiveLspId = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? 'native';
  } catch {
    return 'native';
  }
};
// ------------------------------------------

let initialized = false;
let servicesInitPromise: Promise<void> | null = null;
let startPromise: Promise<void> | null = null;
let languageClientInstance: MonacoLanguageClient | null = null;
let currentSocket: WebSocket | null = null;
let currentLanguageServerId = 'native';

export const configureMonacoWorkers = async () => {
  useWorkerFactory();
};

/**
 * 把当前主题/字体等配置写入 vscode 配置服务。
 * 编辑器挂载、页面从后台恢复等时机都需要重新调用，避免主题被覆盖或丢失。
 */
export const applyEditorConfig = () => {
  const isDarkMode = useEditorStore.getState().isDarkMode;
  updateUserConfiguration(`{
    "workbench.colorTheme": "${isDarkMode ? 'WebGAL Black' : 'WebGAL White'}",
    "editor.semanticHighlighting.enabled": "configuredByTheme",
    "editor.fontFamily": "${useEditorStore.getState().editorFontFamily}",
    "editor.fontSize": ${useEditorStore.getState().editorFontSize}
  }`);
};

const initMonacoServices = async () => {
  await initServices({
    serviceConfig: {
      userServices: {
        ...getThemeServiceOverride(),
        ...getTextmateServiceOverride(),
        ...getConfigurationServiceOverride(),
      },
      debugLogging: true,
    },
  });

  applyEditorConfig();

  useEditorStore.subscribe(() => {
    applyEditorConfig();
  });

  monaco.languages.register({
    id: 'webgal',
    extensions: ['.txt'],
    aliases: ['WebGAL', 'WebGAL Script'],
    mimetypes: ['application/webgalscript'],
  });

  initialized = true;
};

/**
 * 保证 vscode 服务（主题、textmate 高亮等）已初始化。
 * 幂等：多次调用共享同一个 Promise，编辑器挂载前 await 它即可。
 */
export const ensureMonacoServices = (): Promise<void> => {
  if (!servicesInitPromise) {
    servicesInitPromise = initMonacoServices().catch((err) => {
      // 初始化失败时清掉缓存，允许下次重试。
      servicesInitPromise = null;
      throw err;
    });
  }
  return servicesInitPromise;
};

export const runClient = async (languageServerId?: string) => {
  await ensureMonacoServices();

  // 优先使用传入的 ID，否则从存储加载
  const targetId = languageServerId ?? loadActiveLspId();
  // 同步 store（便于 UI 展示）
  useEditorStore.getState().updateActiveLanguageServer(targetId);
  return restartClient(targetId);
};

const stopClient = async () => {
  if (languageClientInstance) {
    try {
      await languageClientInstance.stop();
    } catch {
      // ignore shutdown errors
    }
    languageClientInstance = null;
  }

  if (currentSocket) {
    try {
      currentSocket.close();
    } catch {
      // ignore
    }
    currentSocket = null;
  }
};

const restartClient = async (languageServerId: string) => {
  if (languageClientInstance && currentLanguageServerId === languageServerId) {
    return;
  }
  if (startPromise) {
    return startPromise;
  }

  startPromise = (async () => {
    await stopClient();
    currentLanguageServerId = languageServerId;
    const { webSocket, startPromise: wsStart } = initWebSocketAndStartClient(
      getWsUrl('api/lsp2'),
      languageServerId,
    );
    currentSocket = webSocket;
    await wsStart;
  })();

  startPromise.finally(() => {
    startPromise = null;
  });

  return startPromise;
};

const sendBasePathToLSP = (client: MonacoLanguageClient, gameName: string) => {
  if (!gameName || gameName.trim() === '') {
    return;
  }
  client.sendRequest('textDocument/setBasePath', { basePath: `games/${gameName}/game/` })
    .catch(err => console.error('[LSP] setBasePath request FAILED:', err));
};

export const initWebSocketAndStartClient = (url: string, languageServerId: string): { webSocket: WebSocket; startPromise: Promise<void> } => {
  const webSocket = new WebSocket(url);

  let resolveStart: () => void;
  let rejectStart: (err: any) => void;
  const startPromise = new Promise<void>((resolve, reject) => {
    resolveStart = resolve;
    rejectStart = reject;
  });

  webSocket.onopen = () => {
    const socket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const languageClient = createLanguageClient(
      {
        // @ts-ignore
        reader,
        // @ts-ignore
        writer,
      },
      languageServerId,
    );

    languageClientInstance = languageClient;

    languageClient.onRequest('textDocument/completion', () => {
      vscode.commands.executeCommand('editor.action.triggerSuggest', { auto: true });
    });

    // 注册子页面变化回调，用于发送 basePath（切换项目时使用，不刷新页面）
    registerSubPageChangedCallback((subPage) => {
      sendBasePathToLSP(languageClient, subPage);
    });

    reader.onClose(() => {
      if (languageClientInstance === languageClient) {
        languageClientInstance = null;
      }
      languageClient.stop();
    });

    languageClient.start();

    const ready = (languageClient as any).onReady?.();
    if (ready instanceof Promise) {
      ready.then(resolveStart).catch(rejectStart);
    } else {
      resolveStart();
    }

    // 初次连接时，如果当前有打开的项目，发送 basePath
    const currentSubPage = useEditorStore.getState().subPage;
    if (currentSubPage && currentSubPage.trim() !== '') {
      sendBasePathToLSP(languageClient, currentSubPage);
    }
  };

  webSocket.onerror = (event) => {
    rejectStart(new Error(`LSP websocket error: ${event}`));
  };

  return { webSocket, startPromise };
};

export const scanLanguageServers = async (): Promise<Array<{ id: string; name: string }>> => {
  if (!languageClientInstance) {
    return [];
  }
  const response = await languageClientInstance.sendRequest<{
    servers: Array<{ id: string; name: string }>;
  }>('$/scanLanguageServers');
  return response?.servers ?? [];
};

export const getActiveLanguageServer = async () => {
  if (!languageClientInstance) {
    return { mode: 'native', activeId: 'native' };
  }
  return languageClientInstance.sendRequest<{
    mode: string;
    activeId: string | null;
  }>('$/getActiveLanguageServer');
};

export const setActiveLanguageServer = async (id?: string) => {
  const targetId = id ?? 'native';
  // 保存到 localStorage
  saveActiveLspId(targetId);
  // 更新 store（UI 立即响应）
  useEditorStore.getState().updateActiveLanguageServer(targetId);
  // 刷新页面，重新初始化整个应用，使用新 LSP
  window.location.reload();
};

export const createLanguageClient = (transports: MessageTransports, languageServerId: string): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: 'Sample Language Client',
    clientOptions: {
      documentSelector: ['webgal'],
      initializationOptions: {
        languageServerId,
      },
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.Restart }),
      },
    },
    connectionProvider: {
      get: () => {
        return Promise.resolve(transports);
      },
    },
  });
};
