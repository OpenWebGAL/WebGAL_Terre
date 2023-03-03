import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";

export default function PlayVideo(props: ISentenceEditorProps) {
  const fileName = useValue(props.sentence.content);
  const submit = () => {
    props.onSubmit(`playVideo:${fileName.value};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title="视频文件">
        <>
          {fileName.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="video" onChange={(fileDesc) => {
            fileName.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".mp4", ".webm", ".ogg"]} />
        </>
      </CommonOptions>
    </div>
  </div>;
}
