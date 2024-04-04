import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import {t} from "@lingui/macro";

export default function Comment(props: ISentenceEditorProps) {

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
      placeholder={t`注释`}
    />{t`注释仅在编辑时可见，游戏中不会执行`}
  </div>;
}
