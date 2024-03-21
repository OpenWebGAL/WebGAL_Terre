import "./App.css";
import { logger } from "./utils/logger";
import DashBoard from "./pages/dashboard/DashBoard";
import Editor from "./pages/editor/Editor";
import { ReactNode, useEffect, useMemo } from "react";
import "@icon-park/react/styles/index.css";
import axios from "axios";
import { mapLspKindToMonacoKind } from "./pages/editor/TextEditor/convert";
import * as monaco from "monaco-editor";
import { lspSceneName } from "@/runtime/WG_ORIGINE_RUNTIME";
import './config/themes/theme.css';
import './assets/font-family.css';
import useEditorStore from "./store/useEditorStore";
import useHashRoute, { IPage } from "./hooks/useHashRoute";
import useLanguage from "./hooks/useLanguage";
import TemplateEditor from "./pages/templateEditor/TemplateEditor";
import GameEditorProvider from "./components/Provider/GameEditorProvider";
import TemplateEditorProvider from "./components/Provider/TemplateEditorProvider";

export const routers: { [key in IPage]: { url: string, element: ReactNode } } = {
  dashboard: {
    url: '#/dashboard',
    element: <DashBoard />,
  },
  game: {
    url: '#/game',
    element: <GameEditorProvider><Editor /></GameEditorProvider>,
  },
  template: {
    url: '#/template',
    element: <TemplateEditorProvider><TemplateEditor /></TemplateEditorProvider>,
  },
};

function App() {
  useEffect(() => {
    logger.info("Welcome to WebGAL live editor!");

    // 防止多次注册，语言在初次进入的时候注册
    monaco.languages.register({ id: "webgal" });
    /**
     * LSP
     */
    monaco.languages.registerCompletionItemProvider("webgal", {
      provideCompletionItems: (model, position) => {
        const editorValue = model.getValue();
        const params: any = {
          textDocument: {
            uri: lspSceneName.value
          },
          position: { line: position.lineNumber - 1, character: position.column - 1 }
        };

        const data = {
          editorValue, params
        };

        return new Promise(resolve => {
          axios.post("/api/lsp/compile", data).then((response) => {
            // 处理 LSP 的响应
            const result = {
              suggestions: response.data.items.map((suggestion: any) => {
                return { ...suggestion, kind: mapLspKindToMonacoKind(suggestion.kind) };
              })
            };
            resolve(result);
          });
        });
      }, triggerCharacters: ["-", "", ":", "\n"]
    });
  });

  useHashRoute();
  useLanguage();

  const page = useEditorStore.use.page();
  const subPage = useEditorStore.use.subPage();
  document.title = useMemo(() => `${(page !== 'dashboard') ? `${subPage} - ` : ''}WebGAL Terre`, [page, subPage]);

  return (
    <div className="App">
      {routers[page].element || routers.dashboard.element}
    </div>
  );
}

export default App;
