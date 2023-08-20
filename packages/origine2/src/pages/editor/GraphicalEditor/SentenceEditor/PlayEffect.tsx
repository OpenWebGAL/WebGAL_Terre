import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";

export default function PlayEffect(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.soundEffect.options.');
  const fileName = useValue(props.sentence.content);
  const isNoFile = props.sentence.content === "";
  const id = useValue(getArgByKey(props.sentence, "id").toString() ?? "");
  const volume = useValue(getArgByKey(props.sentence, "volume").toString() ?? "");
  const submit = () => {
    const idStr = id.value !== "" ? ` -id=${id.value}` : "";
    const volumeStr = volume.value !== "" ? ` -volume=${volume.value}` : "";
    props.onSubmit(`playEffect:${fileName.value}${volumeStr}${idStr};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t('stop.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            fileName.set(t('stop.choose'));
          } else
            fileName.set("none");
          submit();
        }} onText={t('stop.on')} offText={t('stop.off')} isChecked={isNoFile} />
      </CommonOptions>
      {!isNoFile &&<CommonOptions key="1" title={t('file.title')}>
        <>
          {fileName.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="vocal" onChange={(fileDesc) => {
            fileName.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".mp3", ".ogg", ".wav"]} />
        </>
      </CommonOptions>}
      <CommonOptions title={t('volume.title')} key="2">
        <input value={volume.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            volume.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t('volume.placeholder')}
          style={{ width: "100%" }}
        />
      </CommonOptions>
      <CommonOptions title={t('id.title')} key="3">
        <input value={id.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            id.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t('id.placeholder')}
          style={{ width: "100%" }}
        />
      </CommonOptions>
    </div>
  </div>;
}
