import { TextField } from "@fluentui/react";
import { ISentenceEditorProps } from "./index";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";

export default function Say(props: ISentenceEditorProps) {
  const currentValue = useValue(props.sentence.content);
  const currentSpeaker = useValue(getArgByKey(props.sentence, "speaker").toString());
  const currentVocal = useValue(getArgByKey(props.sentence, "vocal").toString());
  const isNoSpeaker = useValue(false);
  const submit = () => {
    props.onSubmit(`${currentSpeaker.value}${isNoSpeaker.value ? "" : ":"}${currentValue.value}${currentVocal.value === "" ? "" : " -" + currentVocal.value};`);
  };
  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      角色：<TextField value={currentSpeaker.value}
        onChange={(ev, newValue) => {
          currentSpeaker.set(newValue ?? "");
        }}
        onBlur={submit}
      />
    </div>
    <div className={styles.editItem}>
      对话：<TextField styles={{
        root: {
          width: "600px"
        }
      }} value={currentValue.value}
      onChange={(ev, newValue) => {
        currentValue.set(newValue ?? "");
      }}
      onBlur={submit}
      />
    </div>
    <div className={styles.editItem}>
      语音：{currentVocal.value}{"\u00a0\u00a0"}
      <ChooseFile sourceBase="vocal" onChange={(newName) => {
        currentVocal.set(newName?.name ?? "");
        submit();
      }}
      extName={[".ogg", ".mp3", ".wav"]} />
    </div>
  </div>;
}
