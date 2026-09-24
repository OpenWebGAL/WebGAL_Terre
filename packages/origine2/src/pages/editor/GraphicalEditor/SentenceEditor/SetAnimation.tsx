import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import ChooseFile from "../../ChooseFile/ChooseFile";
import CommonOptions from "../components/CommonOption";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonTips from "../components/CommonTips";
import { t } from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";
import { getTransformFromArgs, isTransformFromDefault, TransformFromOption } from "../components/TransformFromOption";
import { usePresetTargetOptions } from "@/hooks/usePresetTargetOptions";

export default function SetAnimation(props: ISentenceEditorProps) {
  const fileName = useValue(props.sentence.content);
  const target = useValue(getArgByKey(props.sentence, "target")?.toString() ?? "");
  const presetTargets = usePresetTargetOptions();
  const isPresetTarget = Array.from(presetTargets.keys()).includes(target.value);
  const isUsePreset = useValue(isPresetTarget);
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const isFromDefault = useValue(isTransformFromDefault(props.sentence));
  const keep = useValue(getArgByKey(props.sentence, 'keep') === true);
  const parallel = useValue(getArgByKey(props.sentence, 'parallel') === true);
  
  const submit = () => {
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      fileName.value,
      props.sentence.args,
      [
        {key: "target", value: target.value},
        ...getTransformFromArgs(isFromDefault.value),
        {key: "keep", value: keep.value},
        {key: "parallel", value: parallel.value},
        {key: "next", value: isGoNext.value},
      ],
      props.sentence.inlineComment,
    );
    props.onSubmit(submitString);
  };
  return <div className={styles.sentenceEditorContent}>
    <CommonTips text={t`提示：先设置立绘/背景，再应用动画，否则找不到目标。`} />
    {/* <CommonTips text={t`选择一个动画文件以应用，其中 animationTable 是动画定义，不要选择。`} /> */}
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t`选择动画`}>
        <>
          {fileName.value}{"\u00a0"}
          <ChooseFile title={t`选择动画文件`} basePath={['animation']} selectedFilePath={`${fileName.value}.json`} onChange={(file) => {
            fileName.set((file?.name ?? "").replaceAll(".json", ""));
            submit();
          }} extNames={extNameMap.get('json')} hiddenFiles={['animationTable.json']} />
        </>
      </CommonOptions>
      <CommonOptions key="2" title={t`使用预设目标`}>
        <TerreToggle title="" onChange={(newValue) => {
          isUsePreset.set(newValue);
        }} onText={t`使用预设的作用目标，如果设置了id则不生效`} offText={t`手动输入 ID`}
        isChecked={isUsePreset.value} />
      </CommonOptions>
      {isUsePreset.value && <CommonOptions key="3" title={t`选择预设目标`}>
        <WheelDropdown
          options={presetTargets}
          value={target.value}
          onValueChange={(newValue) => {
            target.set(newValue?.toString() ?? "");
            submit();
          }}
        />
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
      <TransformFromOption value={isFromDefault.value} onChange={(value) => {
        isFromDefault.set(value);
        submit();
      }} />
      <CommonOptions key="6" title={t`跨语句动画`}>
        <TerreToggle title="" onChange={(newValue) => {
          keep.set(newValue);
          submit();
        }} onText={t`开启`} offText={t`关闭`} isChecked={keep.value} />
      </CommonOptions>
      <CommonOptions key="7" title={t`并行动画`}>
        <TerreToggle title="" onChange={(newValue) => {
          parallel.set(newValue);
          submit();
        }} onText={t`与同目标动画并行`} offText={t`替换同目标动画`} isChecked={parallel.value} />
      </CommonOptions>
      <CommonOptions key="20" title={t`连续执行`}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t`本句执行后执行下一句`} offText={t`本句执行后等待`} isChecked={isGoNext.value} />
      </CommonOptions>
      {props.extraOptions}
    </div>
  </div>;
}
