import { MessageConnection, Logger } from 'vscode-jsonrpc';
import { IWebSocket } from './socket.js';
export declare function createWebSocketConnection(socket: IWebSocket, logger: Logger): MessageConnection;
