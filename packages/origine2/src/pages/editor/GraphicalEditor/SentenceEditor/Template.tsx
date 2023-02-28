import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";

export default function Template(props:ISentenceEditorProps){
  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem} >
      <CommonOptions key="1" title="编辑组件">
        <div>在这里放置编辑组件</div>
      </CommonOptions>
    </div>
  </div>;
}
