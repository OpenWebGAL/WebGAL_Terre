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

let initialized = false;
let clientPromise: Promise<void> | null = null;
let languageClientInstance: MonacoLanguageClient | null = null;

export const configureMonacoWorkers = async () => {
  useWorkerFactory();
};

export const runClient = async () => {
  if (clientPromise) {
    return clientPromise;
  }

  clientPromise = (async () => {
    if (initialized) {
      return;
    }
    initialized = true;

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

    const applyEditorConfig = () => {
      const isDarkMode = useEditorStore.getState().isDarkMode;
      updateUserConfiguration(`{
      "workbench.colorTheme": "${isDarkMode ? "WebGAL Black" : "WebGAL White"}",
      "editor.semanticHighlighting.enabled": "configuredByTheme",
      "editor.fontFamily": "${useEditorStore.getState().editorFontFamily}",
      "editor.fontSize": ${useEditorStore.getState().editorFontSize}
    }`);
    };

    applyEditorConfig();

    useEditorStore.subscribe((state) => {
      applyEditorConfig();
    });

    monaco.languages.register({
      id: 'webgal',
      extensions: ['.txt'],
      aliases: ['WebGAL', 'WebGAL Script'],
      mimetypes: ['application/webgalscript'],
    });

    initWebSocketAndStartClient(getWsUrl('api/lsp2'));
  })();

  return clientPromise;
};

const sendBasePathToLSP = (client: MonacoLanguageClient, gameName: string) => {
  if (!gameName || gameName.trim() === '') {
    return;
  }
  client.sendRequest('textDocument/setBasePath', { basePath: `games/${gameName}/game/` })
    .catch(err => console.error('[LSP] setBasePath request FAILED:', err));
};

/** parameterized version , support all languageId */
export const initWebSocketAndStartClient = (url: string): WebSocket => {
  const webSocket = new WebSocket(url);
  webSocket.onopen = () => {
    const socket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const languageClient = createLanguageClient({
      // @ts-ignore
      reader, // @ts-ignore
      writer,
    });
    languageClientInstance = languageClient;
    languageClient.onRequest('textDocument/completion', () => {
      vscode.commands.executeCommand('editor.action.triggerSuggest', { auto: true });
    });
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

    const currentSubPage = useEditorStore.getState().subPage;
    if (currentSubPage && currentSubPage.trim() !== '') {
      sendBasePathToLSP(languageClient, currentSubPage);
    }

    setActiveLanguageServer(useEditorStore.getState().activeLanguageServer);
  };
  return webSocket;
};

export const scanLanguageServers = async (): Promise<Array<{ id: string; name: string }>> => {
  if (!languageClientInstance) {
    return [];
  }
  const response = await languageClientInstance.sendRequest<{
    servers: Array<{ id: string; name: string }>;
  }>('$\/scanLanguageServers');
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
  if (!languageClientInstance) {
    return;
  }
  const targetId = id ?? 'native';
  useEditorStore.getState().updateActiveLanguageServer(targetId);
  await languageClientInstance.sendRequest('$/setActiveLanguageServer', { id: targetId });

  const subPage = useEditorStore.getState().subPage;
  if (subPage && subPage.trim() !== '') {
    sendBasePathToLSP(languageClientInstance, subPage);
  }
};

export const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: 'Sample Language Client',
    clientOptions: {
      documentSelector: ['webgal'],
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
