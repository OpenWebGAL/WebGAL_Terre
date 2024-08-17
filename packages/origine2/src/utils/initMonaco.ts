import {logger} from "@/utils/logger";
import {loader} from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {configureMonacoWorkers, runClient} from "@/webgalscript/lsp";

export function initMonaco(){

  logger.info('Welcome to WebGAL live editor!');
  configureMonacoWorkers().then();
  runClient().then(() => console.log('<App/>: LSP client started'));

  loader.config({ monaco });
  loader.init();
}
