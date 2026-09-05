import {
  Connection,
  CompletionItem,
  CompletionParams,
  Diagnostic,
  InitializeParams,
  InitializeResult,
  SemanticTokensParams,
  TextDocuments,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  makeSemanticTokensFullResponse,
  tokenModifierMap,
  tokenTypeMap,
} from './semanticToken';
import { checkTriggerCompletion, complete } from './completion';
import { collectDiagnostics } from './diagnostics';
import { BaseLanguageServer } from './baseLanguageServer';

/**
 * WebGAL 内建语言服务器：直接解析脚本，提供补全、诊断与语义着色。
 * 控制类请求（扫描第三方服务器、切换等）由基类统一处理。
 */
export class NativeLanguageServer extends BaseLanguageServer {
  constructor(documents: TextDocuments<TextDocument>) {
    super(documents);
  }

  attach(connection: Connection): void {
    super.attach(connection);

    connection.onRequest(
      'textDocument/semanticTokens/full',
      async (params: SemanticTokensParams) =>
        makeSemanticTokensFullResponse(
          params,
          this.documents.get(params.textDocument.uri),
        ),
    );

    this.documents.onDidChangeContent((change) => {
      this.validateTextDocument(change.document);
      checkTriggerCompletion(change, () => {
        connection.sendRequest('textDocument/completion');
      });
    });

    connection.onCompletion(
      async (params: CompletionParams): Promise<CompletionItem[]> => {
        const document = this.documents.get(params.textDocument.uri);
        return await complete(params, document, this.basePath);
      },
    );

    connection.onCompletionResolve((item: CompletionItem): CompletionItem => item);
  }

  async initialize(params: InitializeParams): Promise<InitializeResult> {
    const hasWorkspaceFolderCapability = Boolean(
      params.capabilities.workspace?.workspaceFolders,
    );

    const capabilities: InitializeResult = {
      capabilities: {
        textDocumentSync: 1,
        completionProvider: {
          resolveProvider: true,
          triggerCharacters: ['-', ':', '{', '/'],
        },
        semanticTokensProvider: {
          full: true,
          range: false,
          documentSelector: null,
          legend: {
            tokenTypes: Array.from(tokenTypeMap.keys()),
            tokenModifiers: Array.from(tokenModifierMap.keys()),
          },
        },
      },
    };

    if (hasWorkspaceFolderCapability) {
      capabilities.capabilities.workspace = {
        workspaceFolders: { supported: true },
      };
    }

    return capabilities;
  }

  initialized(): void {
    // 内建实现无需额外动作。
  }

  async dispose(): Promise<void> {
    // 内建实现没有需要显式释放的资源。
  }

  getMode() {
    return 'native' as const;
  }

  getActiveId() {
    return 'native';
  }

  private validateTextDocument(textDocument: TextDocument): void {
    const diagnostics: Diagnostic[] = collectDiagnostics(
      textDocument.getText(),
      textDocument.uri,
    );
    this.connection?.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }
}
