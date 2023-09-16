import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";
import {getArgByKey} from "../utils/getArgByKey";

export default function Bgm(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.bgm.');
  const bgmFile = useValue(props.sentence.content);
  const isNoFile = props.sentence.content === "";
  const volume = useValue(getArgByKey(props.sentence, "volume").toString() ?? "");
  const enter = useValue(getArgByKey(props.sentence, "enter").toString() ?? "");
  const unlockName = useValue(getArgByKey(props.sentence, "unlockname").toString() ?? "");
  const unlockSeries = useValue(getArgByKey(props.sentence, "series").toString() ?? "");
  const submit = () => {
    const volumeStr = volume.value !== "" ? ` -volume=${volume.value}` : "";
    const enterStr = enter.value !== "" ? ` -enter=${enter.value}` : "";
    if(bgmFile.value !== "none"){
      props.onSubmit(`bgm:${bgmFile.value}${volumeStr}${enterStr}${unlockName.value !== "" ? " -unlockname=" + unlockName.value : ""}${unlockSeries.value !== "" ? " -series=" + unlockSeries.value : ""};`);
    } else {
      props.onSubmit(`bgm:${bgmFile.value}${enterStr};`);
    }
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t('options.stop.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          if(!newValue){
            bgmFile.set(t('options.stop.choose'));
          }else
            bgmFile.set('none');
          submit();
        }} onText={t('options.stop.on')} offText={t('options.stop.off')} isChecked={isNoFile} />
      </CommonOptions>
      {!isNoFile && <CommonOptions key="1" title={t('options.file.title')}>
        <>
          {bgmFile.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="bgm" onChange={(fileDesc) => {
            bgmFile.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".mp3", ".ogg", ".wav"]} />
        </>
      </CommonOptions>}
      {!isNoFile && <CommonOptions title={t('options.volume.title')} key="2">
        <input value={volume.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            volume.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t('options.volume.placeholder')}
          style={{ width: "100%" }}
        />
      </CommonOptions>}
      <CommonOptions title={t('options.enter.title')} key="3">
        <input value={enter.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            enter.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t('options.enter.placeholder')}
          style={{ width: "100%" }}
        />
      </CommonOptions>
      {!isNoFile && <CommonOptions key="4" title={t('options.name.title')}>
        <input value={unlockName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            unlockName.set(newValue);
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{ width: "200px" }}
          placeholder={t('options.name.placeholder')}
        />
      </CommonOptions>}
    </div>
  </div>;
}
