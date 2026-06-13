import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "@/hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import TerreToggle from "@/components/terreToggle/TerreToggle";
import { t } from "@lingui/macro";
import { combineSubmitString } from "@/utils/combineSubmitString";

export default function Wait(props: ISentenceEditorProps) {
  const duration = useValue(props.sentence.content);
  const nobreak = useValue(getArgByKey(props.sentence, "nobreak") === true);

  const submit = () => {
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      duration.value,
      props.sentence.args,
      [
        { key: "nobreak", value: nobreak.value },
      ],
      props.sentence.inlineComment,
    );
    props.onSubmit(submitString);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions title={t`等待时间（单位为毫秒）`}>
        <input
          value={duration.value}
          onChange={(ev) => duration.set(ev.target.value ?? "")}
          onBlur={submit}
          className={styles.sayInput}
          style={{ width: "100%" }}
        />
      </CommonOptions>
      <CommonOptions title={t`禁止跳过`}>
        <TerreToggle
          title=""
          onChange={(newValue) => {
            nobreak.set(newValue);
            submit();
          }}
          onText={t`禁止跳过`}
          offText={t`允许跳过`}
          isChecked={nobreak.value}
        />
      </CommonOptions>
    </div>
  </div>;
}
