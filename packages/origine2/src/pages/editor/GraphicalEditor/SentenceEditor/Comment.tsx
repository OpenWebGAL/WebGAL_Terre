import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import useTrans from "@/hooks/useTrans";

export default function Comment(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.comment.');

  const textValue = useValue(props.sentence.content);
  const submit = () => {
    props.onSubmit(`;${textValue.value}`);
  };

  return <div className={styles.sentenceEditorContent}>
    <input value={textValue.value}
      onChange={(ev) => {
        const newValue = ev.target.value;
        textValue.set(newValue ?? "");
      }}
      onBlur={submit}
      className={styles.sayInput}
      placeholder={t('options.value.title')}
    />{t('options.value.tip')}
  </div>;
}
