import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import { en } from "./translations/en";
import { zhCn } from "./translations/zh-cn";
import { jp } from "./translations/jp";
import 'primereact/resources/themes/fluent-light/theme.css';
import "primereact/resources/primereact.min.css";
import "./primereact.scss";
import './common.scss';

function initTranslation() {
  i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
      resources: {
        en: { translation: en },
        zhCn: { translation: zhCn },
        jp: { translation: jp },
      },
      lng: 'zhCn', // if you're using a language detector, do not define the lng option
      fallbackLng: 'zhCn',

      interpolation: {
        escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
      },
    })
    .then(() => console.log('WebGAL i18n Ready!'));
}

initTranslation();
initializeIcons();

// 不用 StrictMode，因为会和 react-butiful-dnd 冲突
ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
