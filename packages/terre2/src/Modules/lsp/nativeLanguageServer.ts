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

interface ExampleSettings {
  maxNumberOfProblems: number;
}

/**
 * WebGAL 内建语言服务器：直接解析脚本，提供补全、诊断与语义着色。
 * 控制类请求（扫描第三方服务器、切换等）由基类统一处理。
 */
export class NativeLanguageServer extends BaseLanguageServer {
  private hasWorkspaceFolderCapability = false;
  private hasDiagnosticRelatedInformationCapability = false;
  private hasConfigurationCapability = false;
  private globalSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
  private documentSettings = new Map<string, Thenable<ExampleSettings>>();

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

    connection.onDidChangeConfiguration((change) => {
      if (this.hasConfigurationCapability) {
        this.documentSettings.clear();
      } else {
        this.globalSettings = <ExampleSettings>(
          (change.settings.languageServerExample || this.globalSettings)
        );
      }
      this.documents.all().forEach(this.validateTextDocument.bind(this));
    });

    connection.onDidCloseTextDocument((params) => {
      this.documentSettings.delete(params.textDocument.uri);
    });

    this.documents.onDidChangeContent(async (change) => {
      await this.validateTextDocument(change.document);
    });

    this.documents.onDidChangeContent(async (params) => {
      checkTriggerCompletion(params, () => {
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
    const clientCapabilities = params.capabilities;
    this.hasWorkspaceFolderCapability = !!(
      clientCapabilities.workspace && !!clientCapabilities.workspace.workspaceFolders
    );
    this.hasDiagnosticRelatedInformationCapability = !!(
      clientCapabilities.textDocument &&
      clientCapabilities.textDocument.publishDiagnostics &&
      clientCapabilities.textDocument.publishDiagnostics.relatedInformation
    );
    this.hasConfigurationCapability = !!(
      clientCapabilities.workspace && !!clientCapabilities.workspace.configuration
    );

    const serverCapabilities: InitializeResult = {
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

    if (this.hasWorkspaceFolderCapability) {
      serverCapabilities.capabilities.workspace = {
        workspaceFolders: {
          supported: true,
        },
      };
    }

    return serverCapabilities;
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

  private getDocumentSettings(resource: string): Thenable<ExampleSettings> {
    if (!this.hasConfigurationCapability) {
      return Promise.resolve(this.globalSettings);
    }
    let result = this.documentSettings.get(resource);
    if (!result && this.connection) {
      result = this.connection.workspace.getConfiguration({
        scopeUri: resource,
        section: 'languageServerExample',
      });
      this.documentSettings.set(resource, result);
    }
    return result ?? Promise.resolve(this.globalSettings);
  }

  private async validateTextDocument(textDocument: TextDocument): Promise<void> {
    const settings = await this.getDocumentSettings(textDocument.uri);
    const diagnostics: Diagnostic[] = collectDiagnostics(
      textDocument.getText(),
      textDocument.uri,
    );
    this.connection?.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }
}
