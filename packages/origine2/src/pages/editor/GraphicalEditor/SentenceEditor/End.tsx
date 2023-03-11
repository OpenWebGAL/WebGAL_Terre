import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import CommonTips from "../components/CommonTips";

export default function End(props: ISentenceEditorProps) {
  return <div className={styles.sentenceEditorContent}>
    <CommonTips text="此指令将结束游戏" />
  </div>;
}
