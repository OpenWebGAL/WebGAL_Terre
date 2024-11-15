import {ISentenceEditorProps} from "./index";
import {useValue} from "../../../../hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonOptions from "../components/CommonOption";
import {cloneDeep} from "lodash";
import CommonTips from "../components/CommonTips";
import { useEffect } from "react";
import { Button } from "@fluentui/react-components";
import { t } from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";

type FigurePosition = "" | "left" |  "right" | "center" | "id";
type FontSize = "default" | "small" | "medium" | "large";

export default function Say(props: ISentenceEditorProps) {
  const currentValue = useValue(props.sentence.content.split("|"));
  const currentSpeaker = useValue(getArgByKey(props.sentence, "speaker").toString());
  const vocal = useValue(getArgByKey(props.sentence, "vocal").toString() ?? "");
  const volume = useValue(getArgByKey(props.sentence, "volume").toString() ?? "");
  const isNoSpeaker = useValue(props.sentence.commandRaw === "");
  const figureId = useValue(getArgByKey(props.sentence, "figureId").toString() ?? "");
  const figurePosition = useValue<FigurePosition>("");
  const figurePositions = new Map<FigurePosition, string>([
    [ "", t`未指定` ] ,
    [ "left", t`左侧立绘` ],
    [ "center", t`中间立绘` ],
    [ "right", t`右侧立绘` ],
    [ "id",  t`使用立绘ID` ],
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
    [ "default", t`默认`],
    [ "small", t`小` ],
    [ "medium", t`中` ],
    [ "large", t`大` ],
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
    <CommonTips text={t`提示：换行符最多可达三行`}/>
    <div className={styles.editItem} style={{marginBottom: '4px'}}>
      <input value={isNoSpeaker.value ? "" : currentSpeaker.value}
        onChange={(ev) => {
          const newValue = ev.target.value;
          currentSpeaker.set(newValue ?? "");
        }}
        onBlur={submit}
        className={styles.sayInput}
        placeholder={isNoSpeaker.value ? t`旁白模式，无角色名` : t`角色名，留空以继承上句`}
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
          placeholder={t`对话`}
        />
        <div style={{padding: '0 0 0 4px'}}/>
        {index >= 1 && <Button onClick={() => {
          const newList = cloneDeep(currentValue.value);
          newList.splice(index, 1);
          currentValue.set(newList);
          submit();
        }}>{t`删除`}</Button>}
      </div>
    ))}
    {currentValue.value.length < 3 && <Button onClick={() => {
      const newList = cloneDeep(currentValue.value);
      if (newList.length < 3) {
        newList.push('');
      }
      currentValue.set(newList);
      submit();
    }}>{t`添加新行`}</Button>}
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t`旁白模式`}>
        <TerreToggle title="" onChange={(newValue) => {
          isNoSpeaker.set(newValue);
          submit();
        }} onText={t`不显示角色名`} offText={t`显示角色名`} isChecked={isNoSpeaker.value}/>
      </CommonOptions>
      <CommonOptions key="Vocal" title={t`语音`}>
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
      <CommonOptions title={t`关联立绘`}>
        <WheelDropdown
          options={figurePositions}
          value={figurePosition.value}
          onValueChange={(newValue) => {
            figurePosition.set(newValue as FigurePosition?? "");
            submit();
          }}
        />
      </CommonOptions>
      {figurePosition.value === 'id' && <CommonOptions title={t`立绘插图的ID`}>
        <input value={figureId.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            figureId.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`立绘 ID`}
          style={{ width: "100%" }}
        />
      </CommonOptions>}
      <CommonOptions title={t`文字大小`}>
        <WheelDropdown
          options={fontSizes}
          value={fontSize.value}
          onValueChange={(newValue) => {
            newValue && fontSize.set(newValue as FontSize);
            submit();
          }}
        />
      </CommonOptions>
    </div>
  </div>;
}
