import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import ChooseFile from "../../ChooseFile/ChooseFile";
import CommonTips from "../components/CommonTips";
import useTrans from "@/hooks/useTrans";
import { Dropdown, Option } from "@fluentui/react-components";

export default function UnlockExtra(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.unlockCg.options.');

  const extra = new Map([
    ["unlockCg", t('type.options.cg')],
    ["unlockBgm", t('type.options.bgm')],
  ]);

  const unlockType = useValue(props.sentence.command === commandType.unlockCg ? "unlockCg" : "unlockBgm");
  const fileName = useValue(props.sentence.content);
  const unlockName = useValue(getArgByKey(props.sentence, "name").toString() ?? "");
  const unlockSeries = useValue(getArgByKey(props.sentence, "series").toString() ?? "");
  const submit = () => {
    if (unlockName.value === "") {
      props.onSubmit(`${unlockType.value}:;`);
    }
    props.onSubmit(`${unlockType.value}:${fileName.value}${unlockName.value !== "" ? " -name=" + unlockName.value : ""}${unlockSeries.value !== "" ? " -series=" + unlockSeries.value : ""};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <CommonTips text={t('tips.afterEdit')}/>
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t('type.title')}>
        <Dropdown
          value={extra.get(unlockType.value)}
          selectedOptions={[unlockType.value]}
          onOptionSelect={(event, data) => {
            if(data.optionValue?.toString() !== unlockType.value){
              fileName.set("");
            }
            unlockType.set(data.optionValue?.toString() ?? "");
            submit();
          }}
          style={{ minWidth: 0 }}
        >
          {Array.from(extra.entries()).map(([key, value]) => <Option key={key} value={key}>{value}</Option>)}
        </Dropdown>
      </CommonOptions>
      <CommonOptions key="2" title={t('file.title')}>
        <>
          {fileName.value}{"\u00a0"}<ChooseFile sourceBase={unlockType.value === "unlockCg" ? "background" : "bgm"}
            onChange={(newFile) => {
              fileName.set(newFile?.name ?? "");
              submit();
            }}
            extName={unlockType.value === "unlockCg" ? [".png", ".jpg", ".webp"] : [".mp3", ".ogg", ".wav"]} />
        </>
      </CommonOptions>
      <CommonOptions title={t('name.title')}>
        <input value={unlockName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            unlockName.set(newValue);
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{ width: "200px" }}
          placeholder={t('name.placeholder')}
        />
      </CommonOptions>
    </div>
  </div>;
}
