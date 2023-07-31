import { ISentenceEditorProps } from "./index";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonOptions from "../components/CommonOption";
import useTrans from "@/hooks/useTrans";
import { DefaultButton } from "@fluentui/react";
import { cloneDeep } from "lodash";
import CommonTips from "../components/CommonTips";

export default function Say(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.say.options.');
  const currentValue = useValue(props.sentence.content.split("|"));
  const currentSpeaker = useValue(getArgByKey(props.sentence, "speaker").toString());
  const currentVocal = useValue(getArgByKey(props.sentence, "vocal").toString());
  const isNoSpeaker = useValue(props.sentence.commandRaw === "");

  const submit = () => {
    props.onSubmit(`${isNoSpeaker.value ? "" : currentSpeaker.value}${isNoSpeaker.value || currentSpeaker.value !== "" ? ":" : ""}${currentValue.value.join("|")}${currentVocal.value === "" ? "" : " -" + currentVocal.value};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <CommonTips text={t('tips.edit')}/>
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
    {currentValue.value.map((text, index) => (
      <div key={index} style={{display:"flex",padding:'0 0 6px 0'}}>
        <textarea value={text}
          onChange={(ev) => {
            const newValue = ev.target.value;
            const newList = cloneDeep(currentValue.value);
            newList[index] = newValue;
            currentValue.set(newList);
          }}
          onBlur={submit}
          className={styles.sayArea}
          placeholder={t('dialogue.placeholder')}
          style={{ width: "400px" }}
        />
        <div style={{padding:'0 0 0 8px'}}/>
        <DefaultButton onClick={()=>{
          const newList = cloneDeep(currentValue.value);
          newList.splice(index,1);
          currentValue.set(newList);
          submit();
        }}>{t('$common.delete')}</DefaultButton>
      </div>
    ))}
    <DefaultButton onClick={()=>{
      const newList = cloneDeep(currentValue.value);
      if (newList.length < 3) {
        newList.push('');
      }
      currentValue.set(newList);
      submit();
    }}>{t('add.button')}</DefaultButton>
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