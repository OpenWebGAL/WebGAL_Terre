import "./App.css";
import { logger } from "./utils/logger";
import DashBoard from "./pages/dashboard/DashBoard";
import Editor from "./pages/editor/Editor";
import { useEffect } from "react";
import "@icon-park/react/styles/index.css";
import axios from "axios";
import { mapLspKindToMonacoKind } from "./pages/editor/TextEditor/convert";
import * as monaco from "monaco-editor";
import { lspSceneName } from "@/runtime/WG_ORIGINE_RUNTIME";
import './config/themes/theme.css';
import './assets/font-family.css';
import useEditorStore from "./store/useEditorStore";
import useHashRoute from "./hooks/useHashRoute";
import useLanguage from "./hooks/useLanguage";
import GameEditorContextProvider from "./components/ContextProvider/GameEditorContextProvider";
import TemplateEditorContextProvider from "./components/ContextProvider/GameEditorContextProvider copy";
import TemplateEditor from "./pages/templateEditor/TemplateEditor";

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

  const editor = useEditorStore.use.editor();
  const currentEdit = useEditorStore.use.currentEdit();

  const checkRoute = () => {
    if (editor === 'game' && currentEdit.length !== 0) {
      return 'game-editor';
    } else if (editor === 'template' && currentEdit.length !== 0) {
      return  'template-editor';
    } else {
      return 'dashBoard';
    }
  };

  const routers = {
    'dashBoard': <DashBoard />,
    'game-editor': <GameEditorContextProvider><Editor /></GameEditorContextProvider>,
    'template-editor': <TemplateEditorContextProvider><TemplateEditor /></TemplateEditorContextProvider>,
  };

  return (
    <div className="App">
      {routers[checkRoute()]}
    </div>
  );
}

export default App;
