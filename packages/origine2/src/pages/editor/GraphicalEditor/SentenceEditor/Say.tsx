import { TextField } from "@fluentui/react";
import { ISentenceEditorProps } from "./index";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";

export default function Say(props: ISentenceEditorProps) {
  const currentValue = useValue(props.sentence.content);
  const currentSpeaker = useValue(getArgByKey(props.sentence, "speaker").toString());
  const currentVocal = useValue(getArgByKey(props.sentence, "vocal").toString());
  const isNoSpeaker = useValue(props.sentence.commandRaw === "");
  const submit = () => {
    props.onSubmit(`${isNoSpeaker.value ? "" : currentSpeaker.value}${isNoSpeaker.value || currentSpeaker.value !== "" ? ":" : ""}${currentValue.value}${currentVocal.value === "" ? "" : " -" + currentVocal.value};`);
  };
  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      角色：<TextField value={currentSpeaker.value}
        onChange={(ev, newValue) => {
          currentSpeaker.set(newValue ?? "");
        }}
        onBlur={submit}
      />
      {`\u00a0提示：留空角色名可以继承先前的角色名`}
    </div>
    <div className={styles.editItem}>
      对话：<TextField key={currentValue.value} styles={{
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
    <div className={styles.editItem}>
      旁白模式：
      <TerreToggle title="" onChange={(newValue) => {
        isNoSpeaker.set(newValue);
        submit();
      }} onText="开启，将不显示角色名" offText="关闭，正常显示角色名" isChecked={isNoSpeaker.value} />
    </div>
  </div>;
}
