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

export const configureMonacoWorkers = async () => {
  useWorkerFactory();
};

export const runClient = async () => {
  if (initialized) {
    return Promise.resolve();
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

  updateUserConfiguration(`{
    "workbench.colorTheme": "WebGAL White",
    "editor.semanticHighlighting.enabled": "configuredByTheme",
    "editor.fontFamily": "${useEditorStore.getState().editorFontFamily}",
    "editor.fontSize": ${useEditorStore.getState().editorFontSize},
  }`);

  monaco.languages.register({
    id: 'webgal',
    extensions: ['.txt'],
    aliases: ['WebGAL', 'WebGAL Script'],
    mimetypes: ['application/webgalscript'],
  });

  initWebSocketAndStartClient(getWsUrl('api/lsp2'));
};

const sendBasePathToLSP = (client: MonacoLanguageClient, gameName: string) => {
  client.sendRequest('textDocument/setBasePath', { basePath: `games/${gameName}/game/` });
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
    languageClient.onRequest('textDocument/completion', () => {
      console.log('received completion request from server');
      vscode.commands.executeCommand('editor.action.triggerSuggest', { auto: true });
    });
    registerSubPageChangedCallback((subPage) => {
      sendBasePathToLSP(languageClient, subPage);
    });
    reader.onClose(() => languageClient.stop());
    languageClient.start();

    sendBasePathToLSP(languageClient, useEditorStore.getState().subPage);
  };
  return webSocket;
};

export const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: 'Sample Language Client',
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ['webgal'],
      // disable the default error handler
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.Restart }),
      },
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: () => {
        return Promise.resolve(transports);
      },
    },
  });
};
