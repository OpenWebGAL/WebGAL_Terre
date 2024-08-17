import {logger} from "@/utils/logger";
import {loader} from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {configureMonacoWorkers, runClient} from "@/webgalscript/lsp";
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

export function initMonaco(){

  logger.info('Welcome to WebGAL live editor!');
  configureMonacoWorkers().then();
  runClient().then(() => console.log('<App/>: LSP client started'));
  // @ts-ignore
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        // eslint-disable-next-line new-cap
        return new jsonWorker();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        // eslint-disable-next-line new-cap
        return new cssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        // eslint-disable-next-line new-cap
        return new htmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        // eslint-disable-next-line new-cap
        return new tsWorker();
      }
      // eslint-disable-next-line new-cap
      return new editorWorker();
    },
  };

  loader.config({ monaco });
  loader.init();
}
