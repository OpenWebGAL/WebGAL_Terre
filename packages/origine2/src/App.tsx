import "./App.css";
import {logger} from "./utils/logger";
import DashBoard from "./pages/dashboard/DashBoard";
import {Provider} from "react-redux";
import {origineStore, persistor} from "./store/origineStore";
import Editor from "./pages/editor/Editor";
import {useEffect} from "react";
import "@icon-park/react/styles/index.css";
import axios from "axios";
import {mapLspKindToMonacoKind} from "./pages/editor/TextEditor/convert";
import * as monaco from "monaco-editor";
import Translation from "./components/translation/Translation";
import {lspSceneName} from "@/runtime/WG_ORIGINE_RUNTIME";
import './config/themes/theme.css';
import {PersistGate} from 'redux-persist/integration/react';
import './assets/font-family.css';

function App() {
  useEffect(() => {
    logger.info("Welcome to WebGAL live editor!");

    // 防止多次注册，语言在初次进入的时候注册
    monaco.languages.register({id: "webgal"});
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
          position: {line: position.lineNumber - 1, character: position.column - 1}
        };

        const data = {
          editorValue, params
        };

        return new Promise(resolve => {
          axios.post("/api/lsp/compile", data).then((response) => {
            // 处理 LSP 的响应
            const result = {
              suggestions: response.data.items.map((suggestion: any) => {
                return {...suggestion, kind: mapLspKindToMonacoKind(suggestion.kind)};
              })
            };
            resolve(result);
          });
        });
      }, triggerCharacters: ["-", "", ":", "\n"]
    });
  });

  return (
    // 将编辑器的根元素占满整个视口
    <div className="App">
      <Provider store={origineStore}>
        <PersistGate loading={null} persistor={persistor}>
          <Translation/>
          <DashBoard/>
          <Editor/>
        </PersistGate>
      </Provider>
    </div>
  );
}

export default App;
