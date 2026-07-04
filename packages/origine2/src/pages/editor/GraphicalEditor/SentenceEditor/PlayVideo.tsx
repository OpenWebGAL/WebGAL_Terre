import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { getArgByKey } from "../utils/getArgByKey";
import { t } from "@lingui/macro";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";

export default function PlayVideo(props: ISentenceEditorProps) {
  const fileName = useValue(props.sentence.content);
  const isSkipOff = useValue(!!getArgByKey(props.sentence, "skipOff"));
  const submit = () => {
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      fileName.value,
      props.sentence.args,
      [
        {key: "skipOff", value: isSkipOff.value},
      ],
      props.sentence.inlineComment,
    );
    props.onSubmit(submitString);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t`视频文件`}>
        <>
          {fileName.value + "\u00a0\u00a0"}
          <ChooseFile title={t`选择视频文件`} basePath={['video']} selectedFilePath={fileName.value} onChange={(fileDesc) => {
            fileName.set(fileDesc?.name ?? "");
            submit();
          }}
          extNames={extNameMap.get('video')} />
        </>
      </CommonOptions>
      <CommonOptions key="2" title={t`视频跳过`}>
        <TerreToggle title="" onChange={(newValue) => {
          isSkipOff.set(newValue);
          submit();
        }} onText={t`禁止跳过视频`} offText={t`启用视频跳过`} isChecked={isSkipOff.value} />
      </CommonOptions>
    </div>
  </div>;
}
