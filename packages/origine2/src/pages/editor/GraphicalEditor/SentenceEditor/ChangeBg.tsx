import CommonOptions from "../components/CommonOption";
import {ISentenceEditorProps} from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import {useValue} from "../../../../hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";
import CommonTips from "@/pages/editor/GraphicalEditor/components/CommonTips";
import {EffectEditor} from "@/pages/editor/GraphicalEditor/components/EffectEditor";
import {DefaultButton, PrimaryButton, TextField} from "@fluentui/react";
import {TerrePanel} from "@/pages/editor/GraphicalEditor/components/TerrePanel";
import {useExpand} from "@/hooks/useExpand";

export default function ChangeBg(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.changeBg.');
  const isNoFile = props.sentence.content === "";
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const bgFile = useValue(props.sentence.content);
  const unlockName = useValue(getArgByKey(props.sentence, "unlockname").toString() ?? "");
  const unlockSeries = useValue(getArgByKey(props.sentence, "series").toString() ?? "");
  const {updateExpandIndex} = useExpand();
  const json = useValue<string>(getArgByKey(props.sentence, 'transform') as string);
  const duration = useValue<number | string>(getArgByKey(props.sentence, 'duration') as number);
  const submit = () => {
    const isGoNextStr = isGoNext.value ? " -next" : "";
    const durationStr = duration.value === "" ? '' : ` -duration=${duration.value}`;
    const transformStr = json.value === "" ? '' : ` -transform=${json.value}`;
    if (bgFile.value !== "none") {
      props.onSubmit(`changeBg:${bgFile.value}${isGoNextStr}${durationStr}${transformStr}${unlockName.value !== "" ? " -unlockname=" + unlockName.value : ""}${unlockSeries.value !== "" ? " -series=" + unlockSeries.value : ""};`);
    } else {
      props.onSubmit(`changeBg:${bgFile.value}${isGoNextStr};`);
    }
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t('options.hide.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            bgFile.set(t('options.hide.choose'));
          } else
            bgFile.set("none");
          submit();
        }} onText={t('options.hide.on')} offText={t('options.hide.off')} isChecked={isNoFile}/>
      </CommonOptions>
      {!isNoFile && <CommonOptions key="1" title={t('options.file.title')}>
        <>
          {bgFile.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="background" onChange={(fileDesc) => {
            bgFile.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".png", ".jpg", ".webp"]}/>
        </>
      </CommonOptions>}
      <CommonOptions key="2" title={t('$editor.graphical.sentences.common.options.goNext.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t('$editor.graphical.sentences.common.options.goNext.on')}
        offText={t('$editor.graphical.sentences.common.options.goNext.off')} isChecked={isGoNext.value}/>
      </CommonOptions>
      {!isNoFile && <CommonOptions key="3" title={t('options.name.title')}>
        <input value={unlockName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            unlockName.set(newValue);
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{width: "200px"}}
          placeholder={t('options.name.placeholder')}
        />
      </CommonOptions>}
      <CommonOptions key="23" title={t("options.displayEffect.title")}>
        <DefaultButton onClick={() => {
          updateExpandIndex(props.index);
        }}>{t('$打开效果编辑器')}</DefaultButton>
      </CommonOptions>
      <TerrePanel sentenceIndex={props.index} title={t("$效果编辑器")}>
        <div>
          <CommonTips
            text={t("$效果提示")}/>
          <EffectEditor json={json.value.toString()} onChange={(newJson) => {
            json.set(newJson);
            submit();
          }}/>
          <CommonOptions key="10" title={t("$持续时间（单位为毫秒）")}>
            <div>
              <TextField placeholder={t("$持续时间（单位为毫秒）")} value={duration.value.toString()}
                onChange={(_, newValue) => {
                  const newDuration = Number(newValue);
                  if (isNaN(newDuration) || newValue === '')
                    duration.set("");
                  else
                    duration.set(newDuration);
                }} onBlur={submit}/>
            </div>
          </CommonOptions>
        </div>
      </TerrePanel>
    </div>
  </div>;
}
