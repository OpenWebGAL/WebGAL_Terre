import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import {t} from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { combineSubmitString } from "@/utils/combineSubmitString";

export default function PixiPerform(props: ISentenceEditorProps) {

  const effects = new Map([
    ["snow", t`雪`],
    ["heavySnow", t`大雪`],
    ["rain", t`雨`],
    ["cherryBlossoms", t`櫻花`],
  ]);

  const isSetEffectsOff = useValue(props.sentence.command === commandType.pixiInit);
  const effectName = useValue(props.sentence.content);
  const isUsePreset = useValue(Array.from(effects.keys()).includes(effectName.value));

  const submit = () => {
    const submitString = combineSubmitString(
      isSetEffectsOff.value ? "pixiInit" : "pixiPerform",
      isSetEffectsOff.value ? "" : effectName.value,
      props.sentence.args,
      [],
    );
    props.onSubmit(submitString);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions title={t`清除特效`} key="1">
        <TerreToggle title="" onChange={(newValue) => {
          isSetEffectsOff.set(newValue);
          if (!newValue) {
            effectName.set("snow");
          }
          submit();
        }} onText={t`清除特效`} offText={t`使用特效`} isChecked={isSetEffectsOff.value} />
      </CommonOptions>
      {!isSetEffectsOff.value && <CommonOptions key="2" title={t`使用预制特效`}>
        <TerreToggle title="" onChange={(newValue) => {
          isUsePreset.set(newValue);
        }}
        onText={t`使用引擎内置的特效`} offText={t`使用自定义特效`} isChecked={isUsePreset.value} />
      </CommonOptions>}
      {isUsePreset.value && <CommonOptions title={t`使用预制特效`} key="3">
        <WheelDropdown
          options={effects}
          value={effectName.value}
          onValueChange={(newValue) => {
            effectName.set(newValue?.toString() ?? "");
            submit();
          }}
        />
      </CommonOptions>}
      {!isUsePreset.value && !isSetEffectsOff.value && < CommonOptions title={t`自定义特效名称`} key="3">
        <input value={effectName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            effectName.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`自定义特效名称`}
          style={{ width: "100%" }}
        />
      </CommonOptions>}
    </div>
  </div>;
}
