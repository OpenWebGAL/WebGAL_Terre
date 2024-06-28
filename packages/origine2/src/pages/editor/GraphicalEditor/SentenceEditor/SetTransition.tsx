import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import ChooseFile from "../../ChooseFile/ChooseFile";
import CommonOptions from "../components/CommonOption";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonTips from "../components/CommonTips";
import { Dropdown, Option } from "@fluentui/react-components";
import {t} from "@lingui/macro";

type PresetTarget = "fig-left" | "fig-center" | "fig-right" | "bg-main";

export default function SetTransition(props: ISentenceEditorProps) {
  const enterFileName = useValue(getArgByKey(props.sentence, 'enter'));
  const exitFileName = useValue(getArgByKey(props.sentence, 'exit'));
  const target = useValue(getArgByKey(props.sentence, "target")?.toString() ?? "");
  const presetTargets = new Map<PresetTarget, string>([
    [ "fig-left", t`左侧立绘` ],
    [ "fig-center", t`中间立绘` ],
    [ "fig-right", t`右侧立绘` ],
    [ "bg-main", t`背景图片` ],
  ]);
  const isPresetTarget = Array.from(presetTargets.keys()).includes(target.value as PresetTarget);
  const isUsePreset = useValue(isPresetTarget);
  const submit = () => {
    props.onSubmit(`setTransition: -target=${target.value} -enter=${enterFileName.value} -exit=${exitFileName.value};`);
  };
  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t`选择进入动画`}>
        <>
          {enterFileName.value}{"\u00a0"}
          <ChooseFile sourceBase="animation" onChange={(file) => {
            enterFileName.set((file?.name ?? "").replaceAll(".json", ""));
            submit();
          }} extName={[".json"]} hiddenFiles={['animationTable.json']} />
        </>
      </CommonOptions>
      <CommonOptions key="1.1" title={t`选择退出动画`}>
        <>
          {exitFileName.value}{"\u00a0"}
          <ChooseFile sourceBase="animation" onChange={(file) => {
            exitFileName.set((file?.name ?? "").replaceAll(".json", ""));
            submit();
          }} extName={[".json"]} hiddenFiles={['animationTable.json']} />
        </>
      </CommonOptions>
      <CommonOptions key="2" title={t`使用预设目标`}>
        <TerreToggle title="" onChange={(newValue) => {
          isUsePreset.set(newValue);
        }} onText={t`使用预设的作用目标，如果设置了id则不生效`} offText={t`手动输入 ID`}
        isChecked={isUsePreset.value} />
      </CommonOptions>
      {isUsePreset.value && <CommonOptions key="3" title={t`选择预设目标`}>
        <Dropdown
          value={presetTargets.get(target.value as PresetTarget)}
          selectedOptions={[target.value]}
          onOptionSelect={(event, data) => {
            target.set(data.optionValue?.toString() ?? "");
            submit();
          }}
          style={{ minWidth: 0 }}
        >
          {Array.from(presetTargets.entries()).map(([key, text]) => <Option key={key} value={key}>{text}</Option>)}
        </Dropdown>
      </CommonOptions>}
      {!isUsePreset.value && <CommonOptions key="4" title={t`输入目标 ID`}>
        <input value={target.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            target.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`立绘 ID`}
          style={{ width: "100%" }}
        />
      </CommonOptions>}
    </div>
  </div>;
}
