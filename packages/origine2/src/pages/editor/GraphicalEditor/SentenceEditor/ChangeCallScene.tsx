import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import { useValue } from "../../../../hooks/useValue";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { t } from "@lingui/macro";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";

export default function ChangeCallScene(props: ISentenceEditorProps) {
  const isCallScene = useValue(props.sentence.command === commandType.callScene);
  const fileName = useValue(props.sentence.content);
  const submit = () => {
    const submitString = combineSubmitString(
      isCallScene.value ? "callScene" : "changeScene",
      fileName.value,
      props.sentence.args,
      [],
    );
    props.onSubmit(submitString);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t`场景文件`}>
        <>
          {fileName.value}{'\u00a0'}
          <ChooseFile title={t`选择场景文件`} basePath={['scene']} selectedFilePath={fileName.value} onChange={(file) => {
            fileName.set(file?.name ?? "");
            submit();
          }} extNames={extNameMap.get('scene')} />
        </>
      </CommonOptions>
      <CommonOptions key="2" title={t`调用/切换场景`}>
        <TerreToggle title="" onChange={(newValue) => {
          isCallScene.set(newValue);
          submit();
        }} onText={t`调用场景，新场景结束后返回父场景`}
        offText={t`切换场景，新场景直接替换父场景`} isChecked={isCallScene.value} />
      </CommonOptions>
    </div>
  </div>;
}
