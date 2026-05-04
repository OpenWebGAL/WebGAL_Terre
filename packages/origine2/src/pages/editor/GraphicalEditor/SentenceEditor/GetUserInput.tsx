import CommonOptions from "../components/CommonOption";
import {ISentenceEditorProps} from "./index";
import styles from "./sentenceEditor.module.scss";
import {useValue} from "@/hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import { t } from "@lingui/macro";
import { combineSubmitString } from "@/utils/combineSubmitString";

const argText = (value: string | boolean | number, zeroAsEmpty = false) =>
  (zeroAsEmpty && value === 0 ? "" : (value ?? "").toString());

const regexRange = "{1,12}";

export default function GetUserInput(props: ISentenceEditorProps) {
  const titleFromArgs = getArgByKey(props.sentence, "title");
  const title = useValue(argText(titleFromArgs, true));
  const buttonTextFromArgs = getArgByKey(props.sentence, "buttonText");
  const buttonText = useValue(argText(buttonTextFromArgs, true));
  const defaultValueFromArgs = getArgByKey(props.sentence, "defaultValue");
  const defaultValue = useValue(argText(defaultValueFromArgs));
  const rule = useValue(argText(getArgByKey(props.sentence, "rule"), true));
  const ruleFlag = useValue(argText(getArgByKey(props.sentence, "ruleFlag"), true));
  const ruleText = useValue(argText(getArgByKey(props.sentence, "ruleText"), true));
  const ruleButtonText = useValue(argText(getArgByKey(props.sentence, "ruleButtonText"), true));
  const varKey = useValue(props.sentence.content);
  const submit = () => {
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      varKey.value,
      props.sentence.args,
      [
        {key: "title", value: title.value},
        {key: "buttonText", value: buttonText.value},
        {key: "defaultValue", value: defaultValue.value},
        {key: "rule", value: rule.value},
        {key: "ruleFlag", value: ruleFlag.value},
        {key: "ruleText", value: ruleText.value},
        {key: "ruleButtonText", value: ruleButtonText.value},
      ],
      props.sentence.inlineComment,
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
      <CommonOptions title={t`默认值`} key="4">
        <input value={defaultValue.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            defaultValue.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{width: "100%"}}
        />
      </CommonOptions>
      <CommonOptions title={t`输入校验正则`} key="5">
        <input value={rule.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            rule.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`例如：^.${regexRange}$`}
          style={{width: "100%"}}
        />
      </CommonOptions>
      <CommonOptions title={t`正则标记`} key="6">
        <input value={ruleFlag.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            ruleFlag.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`例如：i`}
          style={{width: "100%"}}
        />
      </CommonOptions>
      <CommonOptions title={t`校验失败提示`} key="7">
        <input value={ruleText.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            ruleText.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`可用 $0 表示当前输入`}
          style={{width: "100%"}}
        />
      </CommonOptions>
      <CommonOptions title={t`提示按钮文本`} key="8">
        <input value={ruleButtonText.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            ruleButtonText.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder="OK"
          style={{width: "100%"}}
        />
      </CommonOptions>
    </div>
  </div>;
}
