import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeIcons } from '@fluentui/font-icons-mdl2';
initializeIcons();

// 不用 StrictMode，因为会和 react-butiful-dnd 冲突
ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
