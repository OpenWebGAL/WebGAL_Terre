import { commandType } from "webgal-parser/src/interface/sceneInterface";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import CommonOptions from "../components/CommonOption";
import CommonTips from "../components/CommonTips";
import TerreToggle from "@/components/terreToggle/TerreToggle";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { useValue } from "@/hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { t } from "@lingui/macro";

type PresetTarget = "fig-left" | "fig-center" | "fig-right" | "bg-main" | "stage-main";

const presetTargets = () => new Map<PresetTarget, string>([
  ["fig-left", t`左侧立绘`],
  ["fig-center", t`中间立绘`],
  ["fig-right", t`右侧立绘`],
  ["bg-main", t`背景图片`],
  ["stage-main", t`舞台画面`],
]);

function TextInput(props: {
  title: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  multiline?: boolean;
}) {
  return <CommonOptions title={props.title}>
    {props.multiline ? <textarea
      value={props.value}
      onChange={(ev) => props.onChange(ev.target.value ?? "")}
      onBlur={props.onBlur}
      className={styles.sayArea}
      placeholder={props.placeholder}
      style={{ width: "100%" }}
    /> : <input
      value={props.value}
      onChange={(ev) => props.onChange(ev.target.value ?? "")}
      onBlur={props.onBlur}
      className={styles.sayInput}
      placeholder={props.placeholder}
      style={{ width: "100%" }}
    />}
  </CommonOptions>;
}

function LabelCommand(props: ISentenceEditorProps) {
  const labelName = useValue(props.sentence.content);
  const submit = () => {
    props.onSubmit(combineSubmitString(
      props.sentence.commandRaw,
      labelName.value,
      props.sentence.args,
      [],
      props.sentence.inlineComment,
    ));
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <TextInput
        title={t`标签名`}
        value={labelName.value}
        onChange={(value) => labelName.set(value)}
        onBlur={submit}
        placeholder={t`本场景内唯一的 label 名称`}
      />
    </div>
  </div>;
}

function JumpLabelCommand(props: ISentenceEditorProps) {
  const labelName = useValue(props.sentence.content);
  const labelOptions = new Map((props.sceneLabels ?? []).map(label => [label, label]));
  const submit = () => {
    props.onSubmit(combineSubmitString(
      props.sentence.commandRaw,
      labelName.value,
      props.sentence.args,
      [],
      props.sentence.inlineComment,
    ));
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <TextInput
        title={t`跳转 label`}
        value={labelName.value}
        onChange={(value) => labelName.set(value)}
        onBlur={submit}
        placeholder={t`输入本场景内的 label 名称`}
      />
      {labelOptions.size > 0 && <CommonOptions title={t`从本场景选择`}>
        <WheelDropdown
          options={labelOptions}
          value={labelName.value}
          onValueChange={(newValue) => {
            labelName.set(newValue?.toString() ?? "");
            submit();
          }}
        />
      </CommonOptions>}
    </div>
  </div>;
}

function SetVarCommand(props: ISentenceEditorProps) {
  const expression = useValue(props.sentence.content);
  const isGlobal = useValue(getArgByKey(props.sentence, "global") === true);
  const submit = () => {
    props.onSubmit(combineSubmitString(
      props.sentence.commandRaw,
      expression.value,
      props.sentence.args,
      [{ key: "global", value: isGlobal.value }],
      props.sentence.inlineComment,
    ));
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <TextInput
        title={t`变量表达式`}
        value={expression.value}
        onChange={(value) => expression.set(value)}
        onBlur={submit}
        placeholder={t`例如：a=1 或 name=WebGAL`}
      />
      <CommonOptions title={t`全局变量`}>
        <TerreToggle
          title=""
          onChange={(newValue) => {
            isGlobal.set(newValue);
            submit();
          }}
          onText={t`写入全局变量`}
          offText={t`写入当前存档变量`}
          isChecked={isGlobal.value}
        />
      </CommonOptions>
    </div>
  </div>;
}

function SetComplexAnimationCommand(props: ISentenceEditorProps) {
  const animationName = useValue(props.sentence.content);
  const target = useValue(getArgByKey(props.sentence, "target")?.toString() ?? "");
  const duration = useValue(getArgByKey(props.sentence, "duration")?.toString() ?? "");
  const isGoNext = useValue(getArgByKey(props.sentence, "next") === true);
  const targets = presetTargets();
  const isUsePreset = useValue(Array.from(targets.keys()).includes(target.value as PresetTarget));

  const submit = () => {
    props.onSubmit(combineSubmitString(
      props.sentence.commandRaw,
      animationName.value,
      props.sentence.args,
      [
        { key: "target", value: target.value },
        { key: "duration", value: duration.value },
        { key: "next", value: isGoNext.value },
      ],
      props.sentence.inlineComment,
    ));
  };

  return <div className={styles.sentenceEditorContent}>
    <CommonTips text={t`复杂动画名来自引擎内置动画。若要使用项目动画文件，通常应使用“调用动画”。`} />
    <div className={styles.editItem}>
      <TextInput
        title={t`动画名`}
        value={animationName.value}
        onChange={(value) => animationName.set(value)}
        onBlur={submit}
        placeholder={t`例如：universalSoftIn`}
      />
      <CommonOptions title={t`使用预设目标`}>
        <TerreToggle
          title=""
          onChange={(newValue) => isUsePreset.set(newValue)}
          onText={t`使用预设目标`}
          offText={t`手动输入 ID`}
          isChecked={isUsePreset.value}
        />
      </CommonOptions>
      {isUsePreset.value ? <CommonOptions title={t`目标`}>
        <WheelDropdown
          options={targets}
          value={target.value}
          onValueChange={(newValue) => {
            target.set(newValue?.toString() ?? "");
            submit();
          }}
        />
      </CommonOptions> : <TextInput
        title={t`目标 ID`}
        value={target.value}
        onChange={(value) => target.set(value)}
        onBlur={submit}
        placeholder={t`例如：fig-center`}
      />}
      <TextInput
        title={t`持续时间（毫秒）`}
        value={duration.value}
        onChange={(value) => duration.set(value)}
        onBlur={submit}
        placeholder={t`留空使用默认值`}
      />
      <CommonOptions title={t`连续执行`}>
        <TerreToggle
          title=""
          onChange={(newValue) => {
            isGoNext.set(newValue);
            submit();
          }}
          onText={t`本句执行后执行下一句`}
          offText={t`本句执行后等待`}
          isChecked={isGoNext.value}
        />
      </CommonOptions>
    </div>
  </div>;
}

function SimpleContentCommand(props: ISentenceEditorProps) {
  const content = useValue(props.sentence.content);
  const getMeta = (): { title: string; placeholder: string; multiline?: boolean } => {
    switch (props.sentence.command) {
    case commandType.filmMode:
      return { title: t`电影模式值`, placeholder: t`enable 开启，none 或留空关闭` };
    case commandType.applyStyle:
      return { title: t`样式替换`, placeholder: t`原样式->新样式，多个用逗号分隔`, multiline: true };
    case commandType.showVars:
      return { title: t`内容`, placeholder: t`showVars 通常不需要内容` };
    default:
      return { title: t`内容`, placeholder: t`输入指令内容`, multiline: true };
    }
  };
  const meta = getMeta();
  const submit = () => {
    props.onSubmit(combineSubmitString(
      props.sentence.commandRaw,
      content.value,
      props.sentence.args,
      [],
      props.sentence.inlineComment,
    ));
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      {props.sentence.command === commandType.showVars && <CommonTips text={t`该指令会在文本框显示当前变量。`} />}
      <TextInput
        title={meta.title}
        value={content.value}
        onChange={(value) => content.set(value)}
        onBlur={submit}
        placeholder={meta.placeholder}
        multiline={meta.multiline}
      />
    </div>
  </div>;
}

export default function BasicCommands(props: ISentenceEditorProps) {
  switch (props.sentence.command) {
  case commandType.label:
    return <LabelCommand {...props} />;
  case commandType.jumpLabel:
    return <JumpLabelCommand {...props} />;
  case commandType.setVar:
    return <SetVarCommand {...props} />;
  case commandType.setComplexAnimation:
    return <SetComplexAnimationCommand {...props} />;
  default:
    return <SimpleContentCommand {...props} />;
  }
}
