import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { Dropdown } from "@fluentui/react";
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import useTrans from "@/hooks/useTrans";

export default function PixiPerform(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.effect.options.');

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
      <CommonOptions title={t('clear.title')} key="1">
        <TerreToggle title="" onChange={(newValue) => {
          isSetEffectsOff.set(newValue);
          if (!newValue) {
            effectName.set("snow");
          }
          submit();
        }} onText={t('clear.on')} offText={t('clear.off')} isChecked={isSetEffectsOff.value} />
      </CommonOptions>
      {!isSetEffectsOff.value && <CommonOptions key="2" title={t('usePrepared.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isUsePreset.set(newValue);
        }}
        onText={t('usePrepared.on')} offText={t('usePrepared.off')} isChecked={isUsePreset.value} />
      </CommonOptions>}
      {isUsePreset.value && <CommonOptions title={t('usePrepared.title')} key="3">
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
      {!isUsePreset.value && !isSetEffectsOff.value && < CommonOptions title={t('useUser.title')} key="3">
        <input value={effectName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            effectName.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t('useUser.title')}
          style={{ width: "100%" }}
        />
      </CommonOptions>}
    </div>
  </div>;
}
