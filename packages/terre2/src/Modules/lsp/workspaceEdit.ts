import { TextEdit, WorkspaceEdit } from 'vscode-languageserver/node';
import * as fs from 'fs';

export interface WorkspaceEditCallbacks {
  sendDidChange(uri: string, text: string, version: number): void;
  sendDidChangeWatchedFiles(changes: { uri: string; type: number }[]): void;
  logError(msg: string): void;
}

/**
 * 服务端应用 `workspace/applyEdit`：把第三方 LSP 返回的编辑真正落到文件系统，
 * 再把文档变化回传给客户端，让编辑器和磁盘保持一致。
 *
 * 文本编辑按位置从后往前应用，避免前面的编辑影响后面的偏移量。
 */
export class WorkspaceEditApplier {
  constructor(
    private readonly stripFileProtocol: (uri: string) => string,
    private readonly callbacks: WorkspaceEditCallbacks,
  ) {}

  async apply(edit: WorkspaceEdit): Promise<boolean> {
    if (!edit.changes && !edit.documentChanges) return false;

    // 简单变更：{ uri: TextEdit[] }
    if (edit.changes) {
      for (const [uri, edits] of Object.entries(edit.changes)) {
        const filePath = this.stripFileProtocol(uri);
        try {
          let content = await fs.promises.readFile(filePath, 'utf8');
          content = this.applyTextEdits(content, edits);
          await fs.promises.writeFile(filePath, content, 'utf8');
          this.callbacks.sendDidChange(uri, content, Date.now());
        } catch (err) {
          this.callbacks.logError(`Failed to apply edit on ${filePath}: ${err}`);
          return false;
        }
      }
    }

    // documentChanges：TextDocumentEdit / CreateFile / RenameFile / DeleteFile
    if (edit.documentChanges) {
      for (const change of edit.documentChanges) {
        if ('textDocument' in change) {
          const { uri, version } = change.textDocument;
          const filePath = this.stripFileProtocol(uri);
          try {
            let content = await fs.promises.readFile(filePath, 'utf8');
            content = this.applyTextEdits(content, change.edits);
            await fs.promises.writeFile(filePath, content, 'utf8');
            this.callbacks.sendDidChange(uri, content, (version ?? 0) + 1);
          } catch (err) {
            this.callbacks.logError(`Failed to apply text edit on ${filePath}: ${err}`);
            return false;
          }
        } else if ('kind' in change) {
          const fileChange = change as any;
          try {
            if (fileChange.kind === 'create') {
              await fs.promises.writeFile(
                this.stripFileProtocol(fileChange.uri),
                '',
                'utf8',
              );
              this.callbacks.sendDidChangeWatchedFiles([
                { uri: fileChange.uri, type: 1 },
              ]);
            } else if (fileChange.kind === 'delete') {
              await fs.promises.unlink(this.stripFileProtocol(fileChange.uri));
              this.callbacks.sendDidChangeWatchedFiles([
                { uri: fileChange.uri, type: 3 },
              ]);
            } else if (fileChange.kind === 'rename') {
              await fs.promises.rename(
                this.stripFileProtocol(fileChange.oldUri),
                this.stripFileProtocol(fileChange.newUri),
              );
              this.callbacks.sendDidChangeWatchedFiles([
                { uri: fileChange.oldUri, type: 3 },
                { uri: fileChange.newUri, type: 1 },
              ]);
            }
          } catch (err) {
            this.callbacks.logError(
              `Failed to apply file operation ${fileChange.kind} on ${fileChange.uri ?? fileChange.oldUri}: ${err}`,
            );
            return false;
          }
        }
      }
    }

    return true;
  }

  private applyTextEdits(original: string, edits: TextEdit[]): string {
    let result = original;
    const sorted = [...edits].sort((a, b) => {
      const aStart = a.range.start.line * 100000 + a.range.start.character;
      const bStart = b.range.start.line * 100000 + b.range.start.character;
      return bStart - aStart;
    });

    for (const edit of sorted) {
      const startOffset = this.offsetAt(result, edit.range.start);
      const endOffset = this.offsetAt(result, edit.range.end);
      result = result.substring(0, startOffset) + edit.newText + result.substring(endOffset);
    }
    return result;
  }

  private offsetAt(
    text: string,
    position: { line: number; character: number },
  ): number {
    const lines = text.split('\n');
    let offset = 0;
    for (let i = 0; i < position.line && i < lines.length; i++) {
      offset += lines[i].length + 1; // +1 for newline
    }
    return offset + position.character;
  }
}
