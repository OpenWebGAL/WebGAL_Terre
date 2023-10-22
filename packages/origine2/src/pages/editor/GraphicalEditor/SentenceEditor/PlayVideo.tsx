import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import useTrans from "@/hooks/useTrans";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { getArgByKey } from "../utils/getArgByKey";

export default function PlayVideo(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.video.options.'); 
  const fileName = useValue(props.sentence.content);
  const isSkipOff = useValue(!!getArgByKey(props.sentence, "skipOff"));
  const submit = () => {
    if(isSkipOff.value){
      props.onSubmit(`playVideo:${fileName.value} -skipOff=${isSkipOff.value};`);
    } else {
      props.onSubmit(`playVideo:${fileName.value};`);
    }
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t('file.title')}>
        <>
          {fileName.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="video" onChange={(fileDesc) => {
            fileName.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".mp4", ".webm", ".ogg"]} />
        </>
      </CommonOptions>
      <CommonOptions key="2" title={t('video.option')}>
        <TerreToggle title="" onChange={(newValue) => {
          isSkipOff.set(newValue);
          submit();
        }} onText={t('video.skipOff')} offText={t('video.skipOn')} isChecked={isSkipOff.value} />
      </CommonOptions>
    </div>
  </div>;
}
