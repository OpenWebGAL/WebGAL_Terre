import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import ChooseFile from "../../ChooseFile/ChooseFile";
import CommonOptions from "../components/CommonOption";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonTips from "../components/CommonTips";
import useTrans from "@/hooks/useTrans";
import { Dropdown, Option } from "@fluentui/react-components";

type PresetTarget = "fig-left" | "fig-center" | "fig-right" | "bg-main";

export default function SetAnimation(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.setAnime.options.');
  const fileName = useValue(props.sentence.content);
  const target = useValue(getArgByKey(props.sentence, "target")?.toString() ?? "");
  const presetTargets = new Map<PresetTarget, string>([
    [ "fig-left", t('preparedTarget.choose.options.figLeft') ],
    [ "fig-center", t('preparedTarget.choose.options.figCenter') ],
    [ "fig-right", t('preparedTarget.choose.options.figRight') ],
    [ "bg-main", t('preparedTarget.choose.options.bgMain') ],
  ]);
  const isPresetTarget = Array.from(presetTargets.keys()).includes(target.value as PresetTarget);
  const isUsePreset = useValue(isPresetTarget);
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));

  const submit = () => {
    const isGoNextStr = isGoNext.value ? " -next" : "";
    props.onSubmit(`setAnimation:${fileName.value} -target=${target.value}${isGoNextStr};`);
  };
  return <div className={styles.sentenceEditorContent}>
    <CommonTips text={t('tips.set')} />
    {/* <CommonTips text={t('tips.select')} /> */}
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t('file.title')}>
        <>
          {fileName.value}{"\u00a0"}
          <ChooseFile sourceBase="animation" onChange={(file) => {
            fileName.set((file?.name ?? "").replaceAll(".json", ""));
            submit();
          }} extName={[".json"]} ignoreFiles={['animationTable.json']} />
        </>
      </CommonOptions>
      <CommonOptions key="2" title={t('preparedTarget.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isUsePreset.set(newValue);
        }} onText={t('preparedTarget.on')} offText={t('preparedTarget.off')}
        isChecked={isUsePreset.value} />
      </CommonOptions>
      {isUsePreset.value && <CommonOptions key="3" title={t('preparedTarget.choose.title')}>
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
      {!isUsePreset.value && <CommonOptions key="4" title={t('targetId.title')}>
        <input value={target.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            target.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t('targetId.placeholder')}
          style={{ width: "100%" }}
        />
      </CommonOptions>}
      <CommonOptions key="5" title={t('$editor.graphical.sentences.common.options.goNext.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t('$editor.graphical.sentences.common.options.goNext.on')} offText={t('$editor.graphical.sentences.common.options.goNext.off')} isChecked={isGoNext.value} />
      </CommonOptions>
    </div>
  </div>;
}
