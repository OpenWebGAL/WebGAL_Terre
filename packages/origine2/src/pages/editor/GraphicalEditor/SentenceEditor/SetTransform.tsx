import CommonOptions from "../components/CommonOption";
import {ISentenceEditorProps} from "./index";
import styles from "./sentenceEditor.module.scss";
import {getArgByKey} from "@/pages/editor/GraphicalEditor/utils/getArgByKey";
import {useValue} from "@/hooks/useValue";
import {EffectEditor} from "@/pages/editor/GraphicalEditor/components/EffectEditor";
import TerreToggle from "@/components/terreToggle/TerreToggle";
import {TerrePanel} from "@/pages/editor/GraphicalEditor/components/TerrePanel";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { Button } from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import { t } from "@lingui/macro";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { useEaseTypeOptions } from "@/hooks/useEaseTypeOptions";
import { WsUtil } from "@/utils/wsUtil";

type PresetTarget = "fig-left" | "fig-center" | "fig-right" | "bg-main";

export default function SetTransform(props: ISentenceEditorProps) {
  // const t = useTrans('editor.graphical.components.template.');
  const {sentence} = props;
  const json = sentence.content;
  const durationFromArgs = getArgByKey(sentence, 'duration');
  const transform = useValue((json ?? '') as string);
  const duration = useValue((durationFromArgs ?? 0) as number);
  const updateExpand = useEditorStore.use.updateExpand();
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const target = useValue(getArgByKey(props.sentence, "target")?.toString() ?? "");
  const presetTargets = new Map<PresetTarget, string>([
    [ "fig-left", t`左侧立绘` ],
    [ "fig-center", t`中间立绘` ],
    [ "fig-right", t`右侧立绘` ],
    [ "bg-main", t`背景图片` ],
  ]);
  const isPresetTarget = Array.from(presetTargets.keys()).includes(target.value as PresetTarget);
  const isUsePreset = useValue(isPresetTarget);
  const ease = useValue(getArgByKey(props.sentence, 'ease').toString() ?? '');
  const easeTypeOptions = useEaseTypeOptions();
  const writeDefault = useValue(getArgByKey(props.sentence, 'writeDefault') === true);
  const keep = useValue(getArgByKey(props.sentence, 'keep') === true);

  const submit = () => {
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      transform.value,
      props.sentence.args,
      [
        {key: "target", value: target.value},
        {key: "duration", value: duration.value},
        {key: "ease", value: ease.value},
        {key: "writeDefault", value: writeDefault.value},
        {key: "keep", value: keep.value},
        {key: "next", value: isGoNext.value},
      ],
    );
    props.onSubmit(submitString);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions title={t`效果编辑`}>
        <Button onClick={() => updateExpand(props.index)}>
          {t`打开效果编辑器`}
        </Button>
        <TerrePanel key={`effect-editor-${props.index}`} sentenceIndex={props.index} title={t`效果编辑器`}>
          <EffectEditor
            json={transform.value}
            onChange={(newJson)=>{
              transform.set(newJson);
              submit();
            }}
            onUpdate={(transform)=>{
              const newEffect = { target: target.value, transform: transform };
              WsUtil.sendSetEffectCommand(JSON.stringify(newEffect));
            }}
          />
        </TerrePanel>
      </CommonOptions>
      <CommonOptions key="10" title={t`过渡时间（单位为毫秒）`}>
        <div>
          <input
            placeholder={t`过渡时间（单位为毫秒）`}
            value={duration.value.toString()}
            className={styles.sayInput}
            style={{ width: "100%" }}
            onChange={(ev) => {
              const newDuration = Number(ev.target.value);
              if (isNaN(newDuration))
                duration.set(0);
              else
                duration.set(newDuration);
            }}
            onBlur={submit}
          />
        </div>
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
      <CommonOptions key="5" title={t`缓动类型`}>
        <WheelDropdown
          options={easeTypeOptions}
          value={ease.value}
          onValueChange={(newValue) => {
            ease.set(newValue?.toString() ?? "");
            submit();
          }}
        />
      </CommonOptions>
      <CommonOptions key="6" title={t`补充默认值`}>
        <TerreToggle title="" onChange={(newValue) => {
          writeDefault.set(newValue);
          submit();
        }} onText={t`继承默认效果`} offText={t`继承现有效果`} isChecked={writeDefault.value} />
      </CommonOptions>
      <CommonOptions key="7" title={t`跨语句动画`}>
        <TerreToggle title="" onChange={(newValue) => {
          keep.set(newValue);
          submit();
        }} onText={t`开启`} offText={t`关闭`} isChecked={keep.value} />
      </CommonOptions>
      <CommonOptions key="20" title={t`连续执行`}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t`本句执行后执行下一句`} offText={t`本句执行后等待`} isChecked={isGoNext.value} />
      </CommonOptions>
    </div>
  </div>;
}
