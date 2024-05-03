import "./App.css";
import { logger } from "./utils/logger";
import DashBoard from "./pages/dashboard/DashBoard";
import Editor from "./pages/editor/Editor";
import {ReactNode, useEffect, useMemo, useState} from "react";
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
import {eventBus} from "@/utils/eventBus";

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

  // 建立 WS 连接
  useEffect(()=>{
    try {
      const loc: string = window.location.hostname;
      const protocol: string = window.location.protocol;
      const port: string = window.location.port; // 获取端口号

      // 默认情况下，不需要在URL中明确指定标准HTTP(80)和HTTPS(443)端口
      let defaultPort = '';
      if (port && port !== '80' && port !== '443') {
        // 如果存在非标准端口号，将其包含在URL中
        defaultPort = `:${port}`;
      }

      if (protocol !== 'http:' && protocol !== 'https:') {
        return;
      }

      // 根据当前协议构建WebSocket URL，并包括端口号（如果有）
      let wsUrl = `ws://${loc}${defaultPort}/api/webgalsync`;
      if (protocol === 'https:') {
        wsUrl = `wss://${loc}${defaultPort}/api/webgalsync`;
      }

      console.log('正在启动socket连接位于：' + wsUrl);
      const socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        console.log('socket已连接');
        socket.send('WebGAL Origine 已和 Terre 建立连接');
      };
      socket.onmessage = e => {
        eventBus.emit('get-ws-message',e.data);
      };
      // @ts-ignore
      window['currentWs'] = socket;
    } catch (e) {
      console.warn('ws连接失败');
    }
  },[]);

  useHashRoute();
  useLanguage();

  const page = useEditorStore.use.page();
  const subPage = useEditorStore.use.subPage();
  document.title = useMemo(() => `${(page !== 'dashboard') ? `${subPage} - ` : ''}WebGAL Terre`, [page, subPage]);
  const language = useEditorStore.use.language();
  const [appKeyLang,setAppKeyLang] = useState(language);

  useEffect(() => {
    setAppKeyLang(language);
  }, [language]);

  return (
    <div className="App" key={appKeyLang}>
      {routers[page].element || routers.dashboard.element}
    </div>
  );
}

export default App;
