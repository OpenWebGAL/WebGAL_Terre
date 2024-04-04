import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import {t} from "@lingui/macro";

export default function Template(props:ISentenceEditorProps){


  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem} >
      <CommonOptions key="1" title={t`编辑组件`}>
        <div>{t`在这里放置编辑组件`}</div>
      </CommonOptions>
    </div>
  </div>;
}
