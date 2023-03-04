import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import ChooseFile from "../../ChooseFile/ChooseFile";
import CommonOptions from "../components/CommonOption";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { Dropdown } from "@fluentui/react";

export default function SetAnimation(props: ISentenceEditorProps) {
  const fileName = useValue(props.sentence.content);
  const target = useValue(getArgByKey(props.sentence, "target")?.toString() ?? "");
  const isPresetTarget = ["bg-main", "fig-left", "fig-center", "fig-right"].includes(target.value);
  const isUsePreset = useValue(isPresetTarget);
  const submit = () => {
    props.onSubmit(`setAnimation:${fileName.value} -target=${target.value};`);
  };
  return <div className={styles.sentenceEditorContent}>
    <div>
      提示：先设置立绘/背景，再应用动画，否则找不到目标。
    </div>

    <div>
      选择一个动画文件以应用，其中 animationTable 是动画定义，不要选择。
    </div>
    <div className={styles.editItem}>
      <CommonOptions key="1" title="选择动画">
        <>
          {fileName.value}{"\u00a0"}
          <ChooseFile sourceBase="animation" onChange={(file) => {
            fileName.set((file?.name ?? "").replaceAll(".json", ""));
            submit();
          }} extName={[".json"]} />
        </>
      </CommonOptions>
      <CommonOptions key="2" title="使用预设目标">
        <TerreToggle title="" onChange={(newValue) => {
          isUsePreset.set(newValue);
        }} onText="使用预设的作用目标，如果设置了id则不生效" offText="手动输入 ID"
        isChecked={isUsePreset.value} />
      </CommonOptions>
      {isUsePreset.value && <CommonOptions key="3" title="选择预设目标">
        <Dropdown styles={{ dropdown: { width: "100px" } }} onChange={(event, option, index) => {
          target.set(option?.key.toString() ?? "");
          submit();
        }} options={[
          { key: "fig-left", text: "左侧立绘" },
          { key: "fig-center", text: "中间立绘" },
          { key: "fig-right", text: "右侧立绘" },
          { key: "bg-main", text: "背景图片" }
        ]} selectedKey={target.value} />
      </CommonOptions>}
      {!isUsePreset.value && <CommonOptions key="3" title="输入目标 ID">
        <input value={target.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            target.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder="立绘 ID"
          style={{ width: "100%" }}
        />
      </CommonOptions>}
    </div>
  </div>;
}
