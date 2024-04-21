import { Disposable } from 'vscode-jsonrpc';
export declare class DisposableCollection implements Disposable {
    protected readonly disposables: Disposable[];
    dispose(): void;
    push(disposable: Disposable): Disposable;
}
