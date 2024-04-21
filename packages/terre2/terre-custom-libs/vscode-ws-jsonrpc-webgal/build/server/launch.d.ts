/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import * as net from 'net';
import * as stream from 'stream';
import * as cp from 'child_process';
import { IConnection } from './connection.js';
import { IWebSocket, IWebSocketConnection } from '../socket/socket.js';
export declare function createServerProcess(serverName: string, command: string, args?: string[], options?: cp.SpawnOptions): IConnection | undefined;
export declare function createWebSocketConnection(socket: IWebSocket): IWebSocketConnection;
export declare function createProcessSocketConnection(process: cp.ChildProcess, outSocket: net.Socket, inSocket?: net.Socket): IConnection;
export declare function createSocketConnection(outSocket: net.Socket, inSocket: net.Socket, onDispose: () => void): IConnection;
export declare function createProcessStreamConnection(process: cp.ChildProcess): IConnection | undefined;
export declare function createStreamConnection(outStream: stream.Readable, inStream: stream.Writable, onDispose: () => void): IConnection;
