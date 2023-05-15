import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";

export default function MiniAvatar(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.miniAvatar.options.');
  const fileName = useValue(props.sentence.content);
  const isNoFile = props.sentence.content === "";
  const submit = () => {
    props.onSubmit(`miniAvatar:${fileName.value};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t('close.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          if(!newValue){
            fileName.set(t('close.choose'));
          }else
            fileName.set("none");
          submit();
        }} onText={t('close.on')} offText={t('close.off')} isChecked={isNoFile} />
      </CommonOptions>
      {!isNoFile && <CommonOptions key="1" title={t('file.title')}>
        <>
          {fileName.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
            fileName.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".png", ".webp"]} />
        </>
      </CommonOptions>}
    </div>
  </div>;
}
