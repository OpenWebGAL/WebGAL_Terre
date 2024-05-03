import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import {t} from "@lingui/macro";

export default function Unrecognized(props:ISentenceEditorProps){

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem} >
      <CommonOptions key="1" title={t`未识别的指令`}>
        <div>
          {t`该指令没有被识别，请打开脚本编辑模式以手动编辑`}
        </div>
      </CommonOptions>
    </div>
  </div>;
}
