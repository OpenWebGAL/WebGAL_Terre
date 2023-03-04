import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";

export default function End(props:ISentenceEditorProps){
  return <div className={styles.sentenceEditorContent}>
    <div>
      此指令将结束游戏
    </div>
  </div>;
}
