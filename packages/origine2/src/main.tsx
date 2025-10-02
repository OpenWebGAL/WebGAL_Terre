import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {initializeIcons} from '@fluentui/font-icons-mdl2';
import 'primereact/resources/themes/fluent-light/theme.css';
import "primereact/resources/primereact.min.css";
import "./primereact.scss";
import {
  BrandVariants,
  createLightTheme,
  createDarkTheme,
  FluentProvider,
  makeStyles,
  Theme
} from "@fluentui/react-components";

import {i18n} from "@lingui/core";
import {I18nProvider} from "@lingui/react";
import {messages as enMessages} from "./locales/en";
import {messages as zhCnMessages} from "./locales/zhCn";
import {messages as jaMessages} from "./locales/ja";
import useEditorStore from "./store/useEditorStore";
import { useEffect } from "react";

i18n.load({
  en: enMessages,
  zhCn: zhCnMessages,
  ja: jaMessages
});

export async function i18nActivate(locale: string) {
  console.log(`Active ${locale}`);
  i18n.activate(locale);
}

const terre: BrandVariants = {
  10: "#020306",
  20: "#111725",
  30: "#152642",
  40: "#17325A",
  50: "#163E73",
  60: "#124B8D",
  70: "#0558A8",
  80: "#2A65B4",
  90: "#4672BC",
  100: "#5D80C3",
  110: "#728ECA",
  120: "#859CD1",
  130: "#98ABD8",
  140: "#ABB9DF",
  150: "#BEC8E7",
  160: "#D0D7EE"
};

const lightTheme: Theme = {
  ...createLightTheme(terre),
};

const darkTheme: Theme = {
  ...createDarkTheme(terre),
};

darkTheme.colorBrandForeground1 = terre[110];
darkTheme.colorBrandForeground2 = terre[120];
initializeIcons();

i18n.activate('zhCn');

function Main() {
  const isDarkMode = useEditorStore.use.isDarkMode();
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  return (
    <FluentProvider theme={isDarkMode ? darkTheme : lightTheme} style={{width: '100%', height: '100%'}}>
      <I18nProvider i18n={i18n}>
        <App/>
      </I18nProvider>
    </FluentProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  // 不用 StrictMode，因为会和 react-butiful-dnd 冲突
  // <React.StrictMode>
  <Main />
  // </React.StrictMode>
);
