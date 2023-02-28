import { ISentenceEditorProps } from "./index";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonOptions from "../components/CommonOption";

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
      <input value={isNoSpeaker.value ? "" :currentSpeaker.value}
        onChange={(ev) => {
          const newValue = ev.target.value;
          currentSpeaker.set(newValue ?? "");
        }}
        onBlur={submit}
        className={styles.sayInput}
        placeholder={isNoSpeaker.value ? "旁白模式，无角色名" :"角色名，留空以继承上句"}
        disabled={isNoSpeaker.value}
      />
    </div>
    <div className={styles.editItem}>
      <textarea value={ currentValue.value}
        onChange={(ev) => {
          const newValue = ev.target.value;
          currentValue.set(newValue ?? "");
        }}
        placeholder="对话"
        onBlur={submit} className={styles.sayArea}
      />
    </div>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title="旁白模式">
        <TerreToggle title="" onChange={(newValue) => {
          isNoSpeaker.set(newValue);
          submit();
        }} onText="开启，将不显示角色名" offText="关闭，正常显示角色名" isChecked={isNoSpeaker.value} />
      </CommonOptions>
      <CommonOptions key="Vocal" title="语音">
        <>
          {currentVocal.value !== "" ? `${currentVocal.value}\u00a0\u00a0` : ""}
          <ChooseFile sourceBase="vocal" onChange={(newName) => {
            currentVocal.set(newName?.name ?? "");
            submit();
          }}
          extName={[".ogg", ".mp3", ".wav"]} />
        </>

      </CommonOptions>

    </div>
  </div>;
}
