import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";

export default function ChangeBg(props: ISentenceEditorProps) {

  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const bgFile = useValue(props.sentence.content);
  const submit = () => {
    const isGoNextStr = isGoNext.value ? " -next" : "";
    props.onSubmit(`changeBg:${bgFile.value}${isGoNextStr};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title="背景文件">
        <>
          {bgFile.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="background" onChange={(fileDesc) => {
            bgFile.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".png", ".jpg", ".webp"]} />
        </>
      </CommonOptions>
      <CommonOptions key="2" title="连续执行下一句">
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText="本句执行后执行下一句" offText="本句执行后等待" isChecked={isGoNext.value} />
      </CommonOptions>
    </div>
  </div>;
}
