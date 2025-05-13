import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import {getArgByKey} from "../utils/getArgByKey";
import { t } from "@lingui/macro";
import { dirNameToExtNameMap } from "../../ChooseFile/chooseFileConfig";

export default function Bgm(props: ISentenceEditorProps) {
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
      <CommonOptions key="isNoDialog" title={t`停止 BGM`}>
        <TerreToggle title="" onChange={(newValue) => {
          if(!newValue){
            bgmFile.set(t`选择背景音乐`);
          }else
            bgmFile.set('none');
          submit();
        }} onText={t`结束当前 BGM 的播放`} offText={t`正常播放 BGM`} isChecked={isNoFile} />
      </CommonOptions>
      {!isNoFile && <CommonOptions key="1" title={t`背景音乐文件`}>
        <>
          {bgmFile.value + "\u00a0\u00a0"}
          <ChooseFile basePath={['bgm']} selectedFileName={bgmFile.value} onChange={(fileDesc) => {
            bgmFile.set(fileDesc?.name ?? "");
            submit();
          }}
          extNames={dirNameToExtNameMap.get('bgm')} />
        </>
      </CommonOptions>}
      {!isNoFile && <CommonOptions title={t`BGM 音量`} key="2">
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
      </CommonOptions>}
      <CommonOptions title={t`淡入淡出`} key="3">
        <input value={enter.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            enter.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`单位毫秒。 0~ 有效`}
          style={{ width: "100%" }}
        />
      </CommonOptions>
      {!isNoFile && <CommonOptions key="4" title={t`解锁名称`}>
        <input value={unlockName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            unlockName.set(newValue);
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{ width: "200px" }}
          placeholder={t`解锁的 BGM 名称`}
        />
      </CommonOptions>}
    </div>
  </div>;
}
