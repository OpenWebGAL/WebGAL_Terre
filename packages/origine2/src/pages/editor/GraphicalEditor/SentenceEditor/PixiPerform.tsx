import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { Dropdown } from "@fluentui/react";
import { commandType } from "webgal-parser/src/interface/sceneInterface";

export default function PixiPerform(props: ISentenceEditorProps) {

  const isSetEffectsOff = useValue(props.sentence.command === commandType.pixiInit);
  const effectName = useValue(props.sentence.content);
  const isUsePreset = useValue(["snow", "rain", "cherryBlossoms"].includes(effectName.value));


  const submit = () => {
    if (isSetEffectsOff.value) {
      props.onSubmit("pixiInit;");
      return;
    } else {
      props.onSubmit(`pixiPerform:${effectName.value};`);
    }
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions title="清除特效" key="1">
        <TerreToggle title="" onChange={(newValue) => {
          isSetEffectsOff.set(newValue);
          if (!newValue) {
            effectName.set("snow");
          }
          submit();
        }} onText="清除特效" offText="使用特效" isChecked={isSetEffectsOff.value} />
      </CommonOptions>
      {!isSetEffectsOff.value && <CommonOptions key="2" title="使用预制特效">
        <TerreToggle title="" onChange={(newValue) => {
          isUsePreset.set(newValue);
        }}
        onText="使用引擎内置的特效" offText="使用自定义特效" isChecked={isUsePreset.value} />
      </CommonOptions>}
      {isUsePreset.value && <CommonOptions title="选择预制特效" key="3">
        <Dropdown
          selectedKey={effectName.value}
          options={[{ key: "snow", text: "下雪" }, { key: "rain", text: "下雨" }, { key: "cherryBlossoms", text: "櫻花" }]}
          onChange={(ev, newValue) => {
            effectName.set(newValue?.key?.toString() ?? "");
            submit();
          }}
          styles={{ dropdown: { width: "80px" } }}
        />
      </CommonOptions>}
      {!isUsePreset.value && !isSetEffectsOff.value && < CommonOptions title="自定义特效名称" key="3">
        <input value={effectName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            effectName.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder="自定义特效名称"
          style={{ width: "100%" }}
        />
      </CommonOptions>}
    </div>
  </div>;
}
