import CommonOptions from "../components/CommonOption";
import {ISentenceEditorProps} from "./index";
import styles from "./sentenceEditor.module.scss";
import {useValue} from "@/hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import { t } from "@lingui/macro";
import { combineSubmitString } from "@/utils/combineSubmitString";

export default function GetUserInput(props: ISentenceEditorProps) {
  const titleFromArgs = getArgByKey(props.sentence, "title");
  const title = useValue(((titleFromArgs === 0 ? '' : titleFromArgs) ?? '').toString());
  const buttonTextFromArgs = getArgByKey(props.sentence, "buttonText");
  const buttonText = useValue(((buttonTextFromArgs === 0 ? '' : buttonTextFromArgs) ?? '').toString());
  const varKey = useValue(props.sentence.content);
  const submit = () => {
    console.log(varKey.value, title.value, buttonText.value);
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      varKey.value,
      props.sentence.args,
      [
        {key: "title", value: title.value},
        {key: "buttonText", value: buttonText.value},
      ],
    );
    props.onSubmit(submitString);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions title={t`写入变量`} key="1">
        <input value={varKey.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            varKey.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{width: "100%"}}
        />
      </CommonOptions>
      <CommonOptions title={t`对话框标题`} key="2">
        <input value={title.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            title.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{width: "100%"}}
        />
      </CommonOptions>
      <CommonOptions title={t`确认按钮文本`} key="3">
        <input value={buttonText.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            buttonText.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{width: "100%"}}
        />
      </CommonOptions>
    </div>
  </div>;
}
