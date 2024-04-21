/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as monaco from 'monaco-editor';
import { initServices } from 'monaco-languageclient/vscode/services';
// monaco-editor does not supply json highlighting with the json worker,
// that's why we use the textmate extension from VSCode
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
// import '@codingame/monaco-vscode-theme-defaults-default-extension';
// import '@codingame/monaco-vscode-json-default-extension';
// import './external/vscode-webgal-highlighting';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getConfigurationServiceOverride, {
  updateUserConfiguration,
  configurationRegistry,
} from '@codingame/monaco-vscode-configuration-service-override';
import './extension';
import {getWsUrl} from "@/utils/getWsUrl";

let initialized = false;

// as we don't do deltas, for performance reasons, don't compute semantic tokens for documents above that limit
const CONTENT_LENGTH_LIMIT = 100000;

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
}`);

  monaco.languages.register({
    id: 'webgal',
    extensions: ['.txt'],
    aliases: ['WebGAL', 'WebGAL Script'],
    mimetypes: ['application/webgalscript'],
  });

  initWebSocketAndStartClient(getWsUrl('api/lsp2'));
};

/** parameterized version , support all languageId */
export const initWebSocketAndStartClient = (url: string): WebSocket => {
  const webSocket = new WebSocket(url);
  webSocket.onopen = () => {
    const socket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const languageClient = createLanguageClient({// @ts-ignore
      reader,// @ts-ignore
      writer,
    });
    languageClient.start();
    reader.onClose(() => languageClient.stop());
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
        closed: () => ({ action: CloseAction.DoNotRestart }),
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
