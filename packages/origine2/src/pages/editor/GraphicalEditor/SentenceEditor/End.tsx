import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import CommonTips from "../components/CommonTips";
import useTrans from "@/hooks/useTrans";

export default function End(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.end.');

  return <div className={styles.sentenceEditorContent}>
    <CommonTips text={t('tip')} />
  </div>;
}
