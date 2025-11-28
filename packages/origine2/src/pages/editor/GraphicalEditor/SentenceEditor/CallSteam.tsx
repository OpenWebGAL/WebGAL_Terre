import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "@/hooks/useValue";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { t } from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";

const CALL_STEAM_COMMAND = "callSteam";

const PARAM_OPTIONS = new Map<string, string>([
  ["achievementId", t`解锁成就`],
]);

export default function CallSteam(props: ISentenceEditorProps) {
  const existingArg = props.sentence.args.find((arg) => arg.key !== "speaker");
  const selectedKey = useValue(existingArg?.key ?? "achievementId");
  const paramValue = useValue((existingArg?.value ?? "").toString());

  const submit = () => {
    const normalizedKey = selectedKey.value.trim();
    const submitString = combineSubmitString(
      props.sentence.commandRaw || CALL_STEAM_COMMAND,
      "",
      props.sentence.args.filter((arg) => arg.key !== "speaker"),
      normalizedKey ? [{ key: normalizedKey, value: paramValue.value, fullMode: true }] : [],
    );
    props.onSubmit(submitString);
  };

  const onKeyChange = (newKey?: string | number) => {
    const newKeyString = (newKey ?? "").toString();
    selectedKey.set(newKeyString);
    // 清空值以避免沿用不匹配的旧值
    paramValue.set("");
    submit();
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions title={t`选择调用参数`}>
        <WheelDropdown
          options={PARAM_OPTIONS}
          value={selectedKey.value}
          onValueChange={(newValue) => onKeyChange(newValue)}
        />
      </CommonOptions>
      <CommonOptions title={t`参数值`}>
        <input
          value={paramValue.value}
          onChange={(ev) => paramValue.set(ev.target.value ?? "")}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`填写参数值`}
          style={{ width: "100%" }}
        />
      </CommonOptions>
    </div>
  </div>;
}
