import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import { Dropdown } from "@fluentui/react";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import ChooseFile from "../../ChooseFile/ChooseFile";

export default function UnlockExtra(props: ISentenceEditorProps) {

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
    提示：在编辑结束后，如果发现有失效的鉴赏 CG/BGM ，在 WebGAL 游戏界面的选项中选择清除全部数据以清空。
    <div className={styles.editItem}>
      <CommonOptions key="1" title="解锁鉴赏类型">
        <Dropdown options={[{ key: "unlockCg", text: "CG" }, { key: "unlockBgm", text: "BGM" }]}
          selectedKey={unlockType.value} onChange={(event, option) => {
            unlockType.set(option?.key?.toString() ?? "");
            submit();
          }} />
      </CommonOptions>
      <CommonOptions key="2" title="鉴赏资源文件">
        <>
          {fileName.value}{"\u00a0"}<ChooseFile sourceBase={unlockType.value === "unlockCg" ? "background" : "bgm"}
            onChange={(newFile) => {
              fileName.set(newFile?.name ?? "");
              submit();
            }}
            extName={unlockType.value === "unlockCg" ? [".png", ".jpg", ".webp"] : [".mp3", ".ogg", ".wav"]} />
        </>
      </CommonOptions>
      <CommonOptions title="解锁名称">
        <input value={unlockName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            unlockName.set(newValue);
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{ width: "200px" }}
          placeholder="解锁的 CG 或 BGM 名称"
        />
      </CommonOptions>
    </div>
  </div>;
}
