import {ISentenceEditorProps} from "./index";
import {useValue} from "../../../../hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonOptions from "../components/CommonOption";
import useTrans from "@/hooks/useTrans";
import {cloneDeep} from "lodash";
import CommonTips from "../components/CommonTips";
import { useEffect } from "react";
import { Button, Dropdown, Option } from "@fluentui/react-components";

type FigurePosition = "" | "left" |  "right" | "center" | "id";
type FontSize = "default" | "small" | "medium" | "large";

export default function Say(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.say.options.');
  const currentValue = useValue(props.sentence.content.split("|"));
  const currentSpeaker = useValue(getArgByKey(props.sentence, "speaker").toString());
  const vocal = useValue(getArgByKey(props.sentence, "vocal").toString() ?? "");
  const volume = useValue(getArgByKey(props.sentence, "volume").toString() ?? "");
  const isNoSpeaker = useValue(props.sentence.commandRaw === "");
  const figureId = useValue(getArgByKey(props.sentence, "figureId").toString() ?? "");
  const figurePosition = useValue<FigurePosition>("");
  const figurePositions = new Map<FigurePosition, string>([
    [ "", t('position.options.none') ] ,
    [ "left", t('position.options.left') ],
    [ "center", t('position.options.center') ],
    [ "right", t('position.options.right') ],
    [ "id",  t('position.options.id') ],
  ]);

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

  const fontSizes = new Map<FontSize, string>([
    [ "default", t('font.options.default')],
    [ "small", t('font.options.small') ],
    [ "medium", t('font.options.medium') ],
    [ "large", t('font.options.large') ],
  ]);
  const getInitialFontSize = (): FontSize => {
    const fontSizeValue = getArgByKey(props.sentence, "fontSize");

    if (typeof fontSizeValue === 'string' && Array.from(fontSizes.keys()).includes(fontSizeValue as FontSize)) {
      return fontSizeValue as FontSize;
    }

    return "default";
  };
  const fontSize = useValue(getInitialFontSize());

  const submit = () => {
    const selectedFontSize = fontSize.value;
    const pos = figurePosition.value !== "" ? ` -${figurePosition.value}` : "";
    const idStr = figureId.value !== "" ? ` -figureId=${figureId.value}` : "";
    const commitValue = currentValue.value.map(e=>e.replaceAll('\n','|'));
    if(figurePosition.value === "id"){
      props.onSubmit(`${isNoSpeaker.value ? "" : currentSpeaker.value}${isNoSpeaker.value || currentSpeaker.value !== "" ? ":" : ""}${commitValue.join("|")}${vocal.value === "" ? "" : " -" + vocal.value} -fontSize=${selectedFontSize}${pos}${idStr};`);
    } else {
      props.onSubmit(`${isNoSpeaker.value ? "" : currentSpeaker.value}${isNoSpeaker.value || currentSpeaker.value !== "" ? ":" : ""}${commitValue.join("|")}${vocal.value === "" ? "" : " -" + vocal.value} -fontSize=${selectedFontSize}${pos};`);
    }
  };

  return <div className={styles.sentenceEditorContent}>
    <CommonTips text={t('tips.edit')}/>
    <div className={styles.editItem} style={{marginBottom: '4px'}}>
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
      <div key={index} style={{display: "flex", padding: '0 0 4px 0', width: '100%'}}>
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
        <div style={{padding: '0 0 0 4px'}}/>
        {index >= 1 && <Button onClick={() => {
          const newList = cloneDeep(currentValue.value);
          newList.splice(index, 1);
          currentValue.set(newList);
          submit();
        }}>{t('$common.delete')}</Button>}
      </div>
    ))}
    {currentValue.value.length < 3 && <Button onClick={() => {
      const newList = cloneDeep(currentValue.value);
      if (newList.length < 3) {
        newList.push('');
      }
      currentValue.set(newList);
      submit();
    }}>{t('add.button')}</Button>}
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
          value={figurePositions.get(figurePosition.value) ?? figurePosition.value}
          selectedOptions={[figurePosition.value]}
          onOptionSelect={(event, data) => {
            figurePosition.set(data.optionValue as FigurePosition?? "");
            submit();
          }}
          style={{ minWidth: 0}}
        >
          { Array.from(figurePositions.entries()).map(([key, value]) => <Option key={key} value={key}>{value}</Option>) }
        </Dropdown>
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
          value={fontSizes.get(fontSize.value) ?? fontSize.value}
          selectedOptions={[fontSize.value]}
          onOptionSelect={(event, data) =>{
            data.optionValue && fontSize.set(data.optionValue as FontSize);
            submit();
          }}
          style={{ minWidth: 0}}
        >
          { Array.from(fontSizes.entries()).map(([key, value]) => <Option key={key} value={key}>{value}</Option>) }
        </Dropdown>
      </CommonOptions>
    </div>
  </div>;
}
