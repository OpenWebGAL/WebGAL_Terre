import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";

export default function ChangeBg(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.changeBg.');
  const isNoFile = props.sentence.content === "";
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const bgFile = useValue(props.sentence.content);
  const submit = () => {
    const isGoNextStr = isGoNext.value ? " -next" : "";
    props.onSubmit(`changeBg:${bgFile.value}${isGoNextStr};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t('options.hide.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            bgFile.set(t('options.hide.choose'));
          } else
            bgFile.set("none");
          submit();
        }} onText={t('options.hide.on')} offText={t('options.hide.off')} isChecked={isNoFile} />
      </CommonOptions>
      {!isNoFile && <CommonOptions key="1" title={t('options.file.title')}>
        <>
          {bgFile.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="background" onChange={(fileDesc) => {
            bgFile.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".png", ".jpg", ".webp"]} />
        </>
      </CommonOptions>}
      <CommonOptions key="2" title={t('$editor.graphical.sentences.common.options.goNext.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t('$editor.graphical.sentences.common.options.goNext.on')} offText={t('$editor.graphical.sentences.common.options.goNext.off')} isChecked={isGoNext.value} />
      </CommonOptions>
    </div>
  </div>;
}
