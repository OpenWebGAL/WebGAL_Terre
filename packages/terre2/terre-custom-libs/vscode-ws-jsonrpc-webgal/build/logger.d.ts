import { Logger } from 'vscode-jsonrpc';
export declare class ConsoleLogger implements Logger {
    error(message: string): void;
    warn(message: string): void;
    info(message: string): void;
    log(message: string): void;
    debug(message: string): void;
}
