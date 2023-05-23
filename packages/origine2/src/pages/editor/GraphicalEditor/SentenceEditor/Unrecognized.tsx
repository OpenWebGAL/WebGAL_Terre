import useTrans from "@/hooks/useTrans";
import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";

export default function Unrecognized(props:ISentenceEditorProps){
  const t = useTrans('editor.graphical.sentences.unknown.options.');

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem} >
      <CommonOptions key="1" title={t('tip.title')}>
        <div>
          {t('tip.text')}
        </div>
      </CommonOptions>
    </div>
  </div>;
}
