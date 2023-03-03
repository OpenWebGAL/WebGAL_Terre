import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";

export default function PlayEffect(props: ISentenceEditorProps) {
  const fileName = useValue(props.sentence.content);
  const submit = () => {
    props.onSubmit(`playEffect:${fileName.value};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title="效果音文件">
        <>
          {fileName.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="vocal" onChange={(fileDesc) => {
            fileName.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".mp3", ".ogg", ".wav"]} />
        </>
      </CommonOptions>
    </div>
  </div>;
}
