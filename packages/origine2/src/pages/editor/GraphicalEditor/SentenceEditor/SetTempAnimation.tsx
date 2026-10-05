import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import CommonOptions from "../components/CommonOption";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { t } from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { Button } from "@fluentui/react-components";
import { getTransformFromArgs, isTransformFromDefault, TransformFromOption } from "../components/TransformFromOption";
import { usePresetTargetOptions } from "@/hooks/usePresetTargetOptions";
import useEditorStore from "@/store/useEditorStore";
import { TerrePanel } from "../components/TerrePanel";
import { LegacyTempAnimationFrames } from "../components/LegacyTempAnimationFrames";
import { isEditableAnimation } from "@/pages/editor/AnimationEditor/model/animationDocument";
import { SceneAnimationEditor } from "@/pages/editor/AnimationEditor/SceneAnimationEditor";

export default function SetTempAnimation(props: ISentenceEditorProps) {
  const content = useValue(props.sentence.content);
  const target = useValue(getArgByKey(props.sentence, "target")?.toString() ?? "");
  const presetTargets = usePresetTargetOptions();
  const isPresetTarget = Array.from(presetTargets.keys()).includes(target.value);
  const isUsePreset = useValue(isPresetTarget);
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const isFromDefault = useValue(isTransformFromDefault(props.sentence));
  const keep = useValue(getArgByKey(props.sentence, 'keep') === true);
  const parallel = useValue(getArgByKey(props.sentence, 'parallel') === true);
  const updateExpand = useEditorStore.use.updateExpand();
  // 新建的多段动画使用 Animation v2；v1 关键帧数组（以及无法解析的内容）只为兼容旧脚本，沿用原来的编辑方式
  const isLegacy = !isEditableAnimation(content.value, true);

  const buildSentence = () => combineSubmitString(
    props.sentence.commandRaw,
    content.value,
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

  const submit = () => {
    props.onSubmit(buildSentence());
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      {isLegacy
        ? <LegacyTempAnimationFrames
          content={content}
          submit={submit}
          target={target.value}
          sentence={props.sentence}
          index={props.index}
          targetPath={props.targetPath}
        />
        : <Button onClick={() => updateExpand(props.index)}>{t`打开动画编辑器`}</Button>}
    </div>
    <div className={styles.editItem}>
      <CommonOptions key="usePresetTarget" title={t`使用预设目标`}>
        <TerreToggle title="" onChange={(newValue) => {
          isUsePreset.set(newValue);
        }} onText={t`使用预设的作用目标，如果设置了id则不生效`} offText={t`手动输入 ID`}
        isChecked={isUsePreset.value} />
      </CommonOptions>
      {isUsePreset.value && <CommonOptions key="selectPresetTarget" title={t`选择预设目标`}>
        <WheelDropdown
          options={presetTargets}
          value={target.value}
          onValueChange={(newValue) => {
            target.set(newValue?.toString() ?? "");
            submit();
          }}
        />
      </CommonOptions>}
      {!isUsePreset.value && <CommonOptions key="targetId" title={t`输入目标 ID`}>
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
      <CommonOptions key="keep" title={t`跨语句动画`}>
        <TerreToggle title="" onChange={(newValue) => {
          keep.set(newValue);
          submit();
        }} onText={t`开启`} offText={t`关闭`} isChecked={keep.value} />
      </CommonOptions>
      <CommonOptions key="parallel" title={t`并行动画`}>
        <TerreToggle title="" onChange={(newValue) => {
          parallel.set(newValue);
          submit();
        }} onText={t`与同目标动画并行`} offText={t`替换同目标动画`} isChecked={parallel.value} />
      </CommonOptions>
      <CommonOptions key="isGoNext" title={t`连续执行`}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t`本句执行后执行下一句`} offText={t`本句执行后等待`} isChecked={isGoNext.value} />
      </CommonOptions>
      {props.extraOptions}
    </div>
    {!isLegacy && <TerrePanel sentenceIndex={props.index} title={t`动画编辑器`}>
      <SceneAnimationEditor
        initialText={content.value}
        onChange={(text) => {
          content.set(text);
          submit();
        }}
        sentence={{
          scenePath: props.targetPath,
          lineNumber: props.sentence.endLine + 1,
          lineContent: buildSentence(),
          target: target.value,
          isFromDefault: isFromDefault.value,
        }}
      />
    </TerrePanel>}
  </div>;
}
