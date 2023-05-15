import useTrans from "@/hooks/useTrans";
import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";

export default function Template(props:ISentenceEditorProps){
  const t = useTrans('editor.graphical.components.template.');

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem} >
      <CommonOptions key="1" title={t('title')}>
        <div>{t('text')}</div>
      </CommonOptions>
    </div>
  </div>;
}
