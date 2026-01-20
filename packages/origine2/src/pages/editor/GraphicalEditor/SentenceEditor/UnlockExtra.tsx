import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import ChooseFile from "../../ChooseFile/ChooseFile";
import CommonTips from "../components/CommonTips";
import {t} from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";

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
    const submitString = combineSubmitString(
      unlockType.value,
      (unlockName.value === "" ? "" : fileName.value),
      props.sentence.args,
      [
        ...(unlockName.value === "" ? [
          {key: "name", value: unlockName.value},
          {key: "series", value: unlockSeries.value},
        ] : []),
      ],
      props.sentence.comment
    );
    props.onSubmit(submitString);
  };

  return <div className={styles.sentenceEditorContent}>
    <CommonTips text={t`提示：在编辑结束后，如果发现有失效的鉴赏 CG/BGM ，在 WebGAL 游戏界面的选项中选择清除全部数据以清空。`}/>
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t`解锁鉴赏类型`}>
        <WheelDropdown
          options={extra}
          value={unlockType.value}
          onValueChange={(newValue) => {
            if(newValue?.toString() !== unlockType.value){
              fileName.set("");
            }
            unlockType.set(newValue?.toString() ?? "");
            submit();
          }}
        />
      </CommonOptions>
      <CommonOptions key="2" title={t`鉴赏资源文件`}>
        <>
          {fileName.value}{"\u00a0"}
          <ChooseFile
            title={t`选择鉴赏资源文件`}
            basePath={[unlockType.value === "unlockCg" ? "background" : "bgm"]}
            selectedFilePath={fileName.value}
            onChange={(newFile) => {
              fileName.set(newFile?.name ?? "");
              submit();
            }}
            extNames={unlockType.value === "unlockCg"
              ? extNameMap.get('image')
              : extNameMap.get('audio')}
          />
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
