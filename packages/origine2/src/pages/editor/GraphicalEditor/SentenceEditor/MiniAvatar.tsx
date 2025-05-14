import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import {t} from "@lingui/macro";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";

export default function MiniAvatar(props: ISentenceEditorProps) {
  const fileName = useValue(props.sentence.content);
  const isNoFile = props.sentence.content === "";
  const submit = () => {
    props.onSubmit(`miniAvatar:${fileName.value};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t`关闭小头像`}>
        <TerreToggle title="" onChange={(newValue) => {
          if(!newValue){
            fileName.set(t`选择小头像`);
          }else
            fileName.set("none");
          submit();
        }} onText={t`关闭小头像`} offText={t`展示小头像`} isChecked={isNoFile} />
      </CommonOptions>
      {!isNoFile && <CommonOptions key="1" title={t`小头像文件`}>
        <>
          {fileName.value + "\u00a0\u00a0"}
          <ChooseFile basePath={['figure']} selectedFileName={fileName.value} onChange={(fileDesc) => {
            fileName.set(fileDesc?.name ?? "");
            submit();
          }}
          extNames={extNameMap.get('figure')?.filter(item => item !== '.json' && item !== '.jpg')} />
        </>
      </CommonOptions>}
    </div>
  </div>;
}
