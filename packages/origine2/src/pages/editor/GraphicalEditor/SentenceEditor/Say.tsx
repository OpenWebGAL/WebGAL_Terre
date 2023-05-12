import { ISentenceEditorProps } from "./index";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonOptions from "../components/CommonOption";
import useTrans from "@/hooks/useTrans";

export default function Say(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.say.options.');
  const currentValue = useValue(props.sentence.content);
  const currentSpeaker = useValue(getArgByKey(props.sentence, "speaker").toString());
  const currentVocal = useValue(getArgByKey(props.sentence, "vocal").toString());
  const isNoSpeaker = useValue(props.sentence.commandRaw === "");
  const submit = () => {
    props.onSubmit(`${isNoSpeaker.value ? "" : currentSpeaker.value}${isNoSpeaker.value || currentSpeaker.value !== "" ? ":" : ""}${currentValue.value}${currentVocal.value === "" ? "" : " -" + currentVocal.value};`);
  };
  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <input value={isNoSpeaker.value ? "" : currentSpeaker.value}
        onChange={(ev) => {
          const newValue = ev.target.value;
          currentSpeaker.set(newValue ?? "");
        }}
        onBlur={submit}
        className={styles.sayInput}
        placeholder={isNoSpeaker.value ? t('speaker.placeholder.voiceover') : t('speaker.placeholder.role')}
        disabled={isNoSpeaker.value}
      />
    </div>
    <div className={styles.editItem}>
      <textarea value={currentValue.value}
        onChange={(ev) => {
          const newValue = ev.target.value;
          currentValue.set(newValue ?? "");
        }}
        placeholder={t('dialogue.placeholder')}
        onBlur={submit} className={styles.sayArea}
      />
    </div>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t('voiceover.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isNoSpeaker.set(newValue);
          submit();
        }} onText={t('voiceover.on')} offText={t('voiceover.off')} isChecked={isNoSpeaker.value} />
      </CommonOptions>
      <CommonOptions key="Vocal" title={t('vocal.title')}>
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
