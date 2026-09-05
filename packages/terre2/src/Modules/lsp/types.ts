import {
  Connection,
  InitializeParams,
  InitializeResult,
} from 'vscode-languageserver/node';

/**
 * 语言服务器运行模式。
 *
 * - `native`：WebGAL 内建的语言服务器，直接提供补全/诊断/语义着色。
 * - `third-party`：把协议转发给第三方语言服务器，本进程只做代理。
 */
export type LanguageServerMode = 'native' | 'third-party';

/**
 * 语言服务器的统一生命周期接口。
 *
 * `webgalLsp.ts` 只依赖这个接口，不关心具体是内建实现还是第三方代理，
 * 从而把「协议怎么进来」和「能力怎么实现」解耦。
 */
export interface LanguageServer {
  /** 绑定客户端连接并注册请求/通知处理器。 */
  attach(connection: Connection): void;

  /** 处理初始化握手，返回本服务器（或第三方服务器）的能力。 */
  initialize(params: InitializeParams): Promise<InitializeResult>;

  /** 客户端确认初始化完成后触发。 */
  initialized(): void;

  /** 释放进程、文件监视器等资源。 */
  dispose(): Promise<void>;

  getMode(): LanguageServerMode;
  getActiveId(): string;
}
