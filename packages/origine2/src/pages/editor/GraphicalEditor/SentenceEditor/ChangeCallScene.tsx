import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import { useValue } from "../../../../hooks/useValue";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";

export default function ChangeCallScene(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.changeCallScene.');
  const isCallScene = useValue(props.sentence.command === commandType.callScene);
  const fileName = useValue(props.sentence.content);
  const submit = () => {
    props.onSubmit(`${isCallScene.value ? "callScene" : "changeScene"}:${fileName.value}`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t('options.file.title')}>
        <>
          {fileName.value}{'\u00a0'}
          <ChooseFile sourceBase="scene" onChange={(file) => {
            fileName.set(file?.name ?? "");
            submit();
          }} extName={[".txt"]} />
        </>
      </CommonOptions>
      <CommonOptions key="1" title={t('options.call.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isCallScene.set(newValue);
          submit();
        }} onText={t('options.call.on')}
        offText={t('options.call.off')} isChecked={isCallScene.value} />
      </CommonOptions>
    </div>
  </div>;
}
