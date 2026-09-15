import {logger} from "@/utils/logger";
import {loader} from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {configureMonacoWorkers, runClient, ensureMonacoServices} from "@/webgalscript/lsp";

let monacoReadyPromise: Promise<void> | null = null;

function setupMonaco(): Promise<void> {
  return (async () => {
    await configureMonacoWorkers();
    await ensureMonacoServices();
  })();
}

/**
 * 返回一个在 Monaco 的 vscode 服务（主题、textmate 高亮、worker）就绪后 resolve 的 Promise。
 * 编辑器组件在挂载前 await 它，避免「编辑器先于服务创建」导致白底黑字、无高亮。
 */
export function getMonacoReady(): Promise<void> {
  if (!monacoReadyPromise) {
    monacoReadyPromise = setupMonaco();
  }
  return monacoReadyPromise;
}

export function initMonaco(){
  logger.info('Welcome to WebGAL live editor!');
  getMonacoReady();
  runClient().then(() => console.log('<App/>: LSP client started'));
  loader.config({ monaco });
  loader.init();
}
