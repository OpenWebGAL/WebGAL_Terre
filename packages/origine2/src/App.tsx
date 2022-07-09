import "./App.css";
import { logger } from "./utils/logger";
import DashBoard from "./pages/dashboard/DashBoard";
import { Provider } from "react-redux";
import { origineStore } from "./store/origineStore";
import Editor from "./pages/editor/Editor";
import { useEffect } from "react";
import '@icon-park/react/styles/index.css';

function App() {
  useEffect(() => {
    logger.info("Welcome to WebGAL live editor!");
  });
  return (
    // 将编辑器的根元素占满整个视口
    <div className="App" style={{ width: "100vw", height: "100vh" }}>
      <Provider store={origineStore}>
        <DashBoard />
        <Editor />
      </Provider>
    </div>
  );
}

export default App;
