import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import ChooseFile from "../../ChooseFile/ChooseFile";
import CommonTips from "../components/CommonTips";
import { Dropdown, Option } from "@fluentui/react-components";
import {t} from "@lingui/macro";

export default function UnlockExtra(props: ISentenceEditorProps) {

  const extra = new Map([
    ["unlockCg", t`CG`],
    ["unlockBgm", t`BGM`],
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
    <CommonTips text={t`提示：在编辑结束后，如果发现有失效的鉴赏 CG/BGM ，在 WebGAL 游戏界面的选项中选择清除全部数据以清空。`}/>
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t`解锁鉴赏类型`}>
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
      <CommonOptions key="2" title={t`鉴赏资源文件`}>
        <>
          {fileName.value}{"\u00a0"}<ChooseFile sourceBase={unlockType.value === "unlockCg" ? "background" : "bgm"}
            onChange={(newFile) => {
              fileName.set(newFile?.name ?? "");
              submit();
            }}
            extName={unlockType.value === "unlockCg" ? [".png", ".jpg", ".webp"] : [".mp3", ".ogg", ".wav"]} />
        </>
      </CommonOptions>
      <CommonOptions title={t`解锁名称`}>
        <input value={unlockName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            unlockName.set(newValue);
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{ width: "200px" }}
          placeholder={t`解锁的 CG 或 BGM 名称`}
        />
      </CommonOptions>
    </div>
  </div>;
}
