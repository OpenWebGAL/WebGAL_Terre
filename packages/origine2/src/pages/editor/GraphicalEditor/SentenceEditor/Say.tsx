import {ISentenceEditorProps} from "./index";
import {useValue} from "../../../../hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonOptions from "../components/CommonOption";
import useTrans from "@/hooks/useTrans";
import {DefaultButton, Dropdown} from "@fluentui/react";
import {cloneDeep} from "lodash";
import CommonTips from "../components/CommonTips";
import { useEffect } from "react";

export default function Say(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.say.options.');
  const currentValue = useValue(props.sentence.content.split("|"));
  const currentSpeaker = useValue(getArgByKey(props.sentence, "speaker").toString());
  const vocal = useValue(getArgByKey(props.sentence, "vocal").toString() ?? "");
  const volume = useValue(getArgByKey(props.sentence, "volume").toString() ?? "");
  const isNoSpeaker = useValue(props.sentence.commandRaw === "");
  const figurePosition = useValue<"left" | "" | "right" | "center" | "id">("");
  const figureId = useValue(getArgByKey(props.sentence, "figureId").toString() ?? "");
  useEffect(() => {
    /**
     * 初始化立绘位置
     */
    if (getArgByKey(props.sentence, "left")) {
      figurePosition.set("left");
    }
    if (getArgByKey(props.sentence, "right")) {
      figurePosition.set("right");
    }
    if (getArgByKey(props.sentence, "center")) {
      figurePosition.set("center");
    }
    if (getArgByKey(props.sentence, "id")) {
      figurePosition.set("id");
    }
  }, []);

  const getInitialFontSize = (): string => {
    const fontSizeValue = getArgByKey(props.sentence, "fontSize");

    if (typeof fontSizeValue === 'string' && ["default", "small", "medium", "large"].includes(fontSizeValue)) {
      return fontSizeValue;
    }

    return "default";
  };
  const fontSize = useValue(getInitialFontSize());

  const fontSizes = [
    { key: "default", text: t('font.options.default')},
    { key: "small", text: t('font.options.small') },
    { key: "medium", text: t('font.options.medium') },
    { key: "large", text: t('font.options.large') },
  ];

  const submit = () => {
    const selectedFontSize = fontSize.value;
    const pos = figurePosition.value !== "" ? ` -${figurePosition.value}` : "";
    const idStr = figureId.value !== "" ? ` -figureId=${figureId.value}` : "";
    if(figurePosition.value === "id"){
      props.onSubmit(`${isNoSpeaker.value ? "" : currentSpeaker.value}${isNoSpeaker.value || currentSpeaker.value !== "" ? ":" : ""}${currentValue.value.join("|")}${vocal.value === "" ? "" : " -" + vocal.value} -fontSize=${selectedFontSize}${pos}${idStr};`);
    } else {
      props.onSubmit(`${isNoSpeaker.value ? "" : currentSpeaker.value}${isNoSpeaker.value || currentSpeaker.value !== "" ? ":" : ""}${currentValue.value.join("|")}${vocal.value === "" ? "" : " -" + vocal.value} -fontSize=${selectedFontSize}${pos};`);
    }
  };

  return <div className={styles.sentenceEditorContent}>
    <CommonTips text={t('tips.edit')}/>
    <div className={styles.editItem} style={{marginBottom: '6px'}}>
      <input value={isNoSpeaker.value ? "" : currentSpeaker.value}
        onChange={(ev) => {
          const newValue = ev.target.value;
          currentSpeaker.set(newValue ?? "");
        }}
        onBlur={submit}
        className={styles.sayInput}
        placeholder={isNoSpeaker.value ? t('speaker.placeholder.voiceover') : t('speaker.placeholder.role')}
        disabled={isNoSpeaker.value}
      />
    </div>
    {currentValue.value.map((text, index) => (
      <div key={index} style={{display: "flex", padding: '0 0 6px 0', width: '100%'}}>
        <textarea value={text}
          onChange={(ev) => {
            const newValue = ev.target.value;
            const newList = cloneDeep(currentValue.value);
            newList[index] = newValue;
            currentValue.set(newList);
          }}
          onBlur={submit}
          className={styles.sayArea}
          placeholder={t('dialogue.placeholder')}
        />
        <div style={{padding: '0 0 0 8px'}}/>
        {index >= 1 && <DefaultButton onClick={() => {
          const newList = cloneDeep(currentValue.value);
          newList.splice(index, 1);
          currentValue.set(newList);
          submit();
        }}>{t('$common.delete')}</DefaultButton>}
      </div>
    ))}
    {currentValue.value.length < 3 && <DefaultButton onClick={() => {
      const newList = cloneDeep(currentValue.value);
      if (newList.length < 3) {
        newList.push('');
      }
      currentValue.set(newList);
      submit();
    }}>{t('add.button')}</DefaultButton>}
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t('voiceover.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isNoSpeaker.set(newValue);
          submit();
        }} onText={t('voiceover.on')} offText={t('voiceover.off')} isChecked={isNoSpeaker.value}/>
      </CommonOptions>
      <CommonOptions key="Vocal" title={t('vocal.title')}>
        <>
          {vocal.value !== "" ? `${vocal.value}\u00a0\u00a0` : ""}
          <ChooseFile sourceBase="vocal" onChange={(newName) => {
            vocal.set(newName?.name ?? "");
            vocal.value === "" ? volume.set("") : volume.set(volume.value);
            submit();
          }}
          extName={[".ogg", ".mp3", ".wav"]}/>
        </>
      </CommonOptions>
      <CommonOptions title={t('position.title')}>
        <Dropdown
          selectedKey={figurePosition.value}
          options={[
            { key: "", text: t('position.options.none') } ,
            { key: "left", text: t('position.options.left') },
            { key: "center", text: t('position.options.center') },
            { key: "right", text: t('position.options.right') },
            { key: "id", text: t('position.options.id') }
          ]}
          onChange={(ev, newValue: any) => {
            figurePosition.set(newValue?.key?.toString() ?? "");
            submit();
          }}
        />
      </CommonOptions>
      {figurePosition.value === 'id' && <CommonOptions title={t('id.title')}>
        <input value={figureId.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            figureId.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t('id.placeholder')}
          style={{ width: "100%" }}
        />
      </CommonOptions>}
      <CommonOptions title={t('font.size')}>
        <Dropdown
          options={fontSizes.map(f => ({ key: f.key, text: f.text }))}
          selectedKey={fontSize.value}
          onChange={(event, item) =>{
            item && fontSize.set(item.key as string);
            submit();
          }}
        />
      </CommonOptions>
    </div>
  </div>;
}
