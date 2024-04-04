import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { t } from "@lingui/macro";

export default function PlayEffect(props: ISentenceEditorProps) {
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
      <CommonOptions key="isNoDialog" title={t`关闭效果音`}>
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            fileName.set(t`选择效果音文件`);
          } else
            fileName.set("none");
          submit();
        }} onText={t`关闭效果音`} offText={t`播放效果音`} isChecked={isNoFile} />
      </CommonOptions>
      {!isNoFile &&<CommonOptions key="1" title={t`效果音文件`}>
        <>
          {fileName.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="vocal" onChange={(fileDesc) => {
            fileName.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".mp3", ".ogg", ".wav"]} />
        </>
      </CommonOptions>}
      <CommonOptions title={t`效果音 音量`} key="2">
        <input value={volume.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            volume.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`百分比。 0-100 有效`}
          style={{ width: "100%" }}
        />
      </CommonOptions>
      <CommonOptions title={t`效果音 ID（输入以使效果音循环，后面再用这个 id 来关闭）`} key="3">
        <input value={id.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            id.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`效果音 ID`}
          style={{ width: "100%" }}
        />
      </CommonOptions>
    </div>
  </div>;
}
