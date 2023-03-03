import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";

export default function Bgm(props: ISentenceEditorProps) {
  const bgmFile = useValue(props.sentence.content);
  const isNoFile = props.sentence.content === "";
  const submit = () => {
    props.onSubmit(`bgm:${bgmFile.value};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title="停止 BGM">
        <TerreToggle title="" onChange={(newValue) => {
          if(!newValue){
            bgmFile.set('选择背景音乐');
          }else
            bgmFile.set("none");
          submit();
        }} onText="结束当前 BGM 的播放" offText="正常播放 BGM" isChecked={isNoFile} />
      </CommonOptions>
      {!isNoFile && <CommonOptions key="1" title="背景音乐文件">
        <>
          {bgmFile.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="bgm" onChange={(fileDesc) => {
            bgmFile.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".mp3", ".ogg", ".wav"]} />
        </>
      </CommonOptions>}
    </div>
  </div>;
}
