import { ISentenceEditorProps } from "./index";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonOptions from "../components/CommonOption";
import { cloneDeep, debounce } from "lodash";
import CommonTips from "../components/CommonTips";
import { useEffect, useRef, useState } from "react";
import { Button } from "@fluentui/react-components";
import { t } from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";

type FigurePosition = "" | "left" | "right" | "center" | "id";
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
    [ "", t`未指定` ],
    [ "left", t`左侧立绘` ],
    [ "center", t`中间立绘` ],
    [ "right", t`右侧立绘` ],
    [ "id",  t`使用立绘ID` ],
  ]);
  const isConcat = useValue(!!getArgByKey(props.sentence, 'concat')); // 是否是继承语句
  const isNotend = useValue(!!getArgByKey(props.sentence, 'notend')); // 是否有 notend 参数
  const [isComposing, setIsComposing] = useState(false);

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
    const commitValue = currentValue.value.map(e => e.replaceAll('\n', '|').replaceAll(';', '\\;'));
    const submitString = combineSubmitString(
      (isNoSpeaker.value || currentSpeaker.value !== "") ? (isNoSpeaker.value ? "" : currentSpeaker.value) : undefined,
      commitValue.join("|"),
      props.sentence.args,
      [
        // 移除 -speaker=somebody
        {key: "speaker", value: false},
        // 移除 -vocal=path/to/vocal.wav
        {key: "vocal", value: false},
        // 添加 -path/to/vocal.wav
        ...(vocal.value !== "" ? [
          {key: vocal.value, value: true},
        ] : []),

        {key: "concat", value: isConcat.value},
        {key: "notend", value: isNotend.value},
        {key: "fontSize", value: (fontSize.value !== "default" ? fontSize.value : "")},
        {key: "left", value: figurePosition.value === "left"},
        {key: "right", value: figurePosition.value === "right"},
        {key: "center", value: figurePosition.value === "center"},
        {key: "id", value: figurePosition.value === "id"},
        {key: "figureId", value: (figurePosition.value === "id" ? figureId.value : "")},
      ],
    );
    props.onSubmit(submitString);
  };

  const submitRef = useRef(submit);
  submitRef.current = submit;

  const submitDebounced = useRef(
    debounce(() => {
      submitRef.current();
    }, 500)
  ).current;

  useEffect(() => {
    return () => {
      submitDebounced.cancel();
    };
  }, []);

  const handleCompositionStart = () => {
    submitDebounced.cancel();
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
    submitDebounced();
  };

  const triggerSubmit = () => {
    if (!isComposing) {
      submitDebounced();
    }
  };

  return (
    <div className={styles.sentenceEditorContent}>
      <CommonTips text={t`提示：换行符最多可达三行`} />
      <div className={styles.editItem} style={{ marginBottom: '4px' }}>
        <input
          value={isNoSpeaker.value ? "" : currentSpeaker.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            currentSpeaker.set(newValue ?? "");
            triggerSubmit();
          }}
          onBlur={() => {
            submitDebounced.cancel();
            submit();
          }}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className={styles.sayInput}
          placeholder={isNoSpeaker.value ? t`旁白模式，无角色名` : t`角色名，留空以继承上句`}
          disabled={isNoSpeaker.value}
        />
      </div>
      {currentValue.value.map((text, index) => (
        <div key={index} style={{ display: "flex", padding: '0 0 4px 0', width: '100%' }}>
          <textarea
            value={text}
            onChange={(ev) => {
              const newValue = ev.target.value;
              const newList = cloneDeep(currentValue.value);
              newList[index] = newValue;
              currentValue.set(newList);
              triggerSubmit();
            }}
            onBlur={() => {
              submitDebounced.cancel();
              submit();
            }}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            className={styles.sayArea}
            placeholder={t`对话`}
          />
          <div style={{ padding: '0 0 0 4px' }} />
          {index >= 1 && (
            <Button onClick={() => {
              const newList = cloneDeep(currentValue.value);
              newList.splice(index, 1);
              currentValue.set(newList);
              submit();
            }}>{t`删除`}</Button>
          )}
        </div>
      ))}
      {currentValue.value.length < 3 && (
        <Button onClick={() => {
          const newList = cloneDeep(currentValue.value);
          if (newList.length < 3) {
            newList.push('');
          }
          currentValue.set(newList);
          submit();
        }}>{t`添加新行`}</Button>
      )}
      <div className={styles.editItem}>
        <CommonOptions key="isNoDialog" title={t`旁白模式`}>
          <TerreToggle
            title=""
            onChange={(newValue) => {
              isNoSpeaker.set(newValue);
              submit();
            }}
            onText={t`不显示角色名`}
            offText={t`显示角色名`}
            isChecked={isNoSpeaker.value}
          />
        </CommonOptions>
        <CommonOptions key="isConcat" title={t`拼接模式`}>
          <TerreToggle
            title=""
            onChange={(newValue) => {
              isConcat.set(newValue);
              submit();
            }}
            onText={t`拼接先前文本框内的语句`}
            offText={t`不拼接先前文本框内的语句`}
            isChecked={isConcat.value}
          />
        </CommonOptions>
        <CommonOptions key="isNotend" title={t`文本展示后连续执行`}>
          <TerreToggle
            title=""
            onChange={(newValue) => {
              isNotend.set(newValue);
              submit();
            }}
            onText={t`文字展示完执行下一句`}
            offText={t`文字展示完等待`}
            isChecked={isNotend.value}
          />
        </CommonOptions>
        <CommonOptions key="Vocal" title={t`语音`}>
          <>
            {vocal.value !== "" ? `${vocal.value}\u00a0\u00a0` : ""}
            <ChooseFile
              title={t`选择语音文件`}
              basePath={['vocal']}
              selectedFilePath={vocal.value}
              onChange={(newName) => {
                vocal.set(newName?.name ?? "");
                vocal.value === "" ? volume.set("") : volume.set(volume.value);
                submit();
              }}
              extNames={extNameMap.get('audio')}
            />
          </>
        </CommonOptions>
        <CommonOptions title={t`关联立绘`}>
          <WheelDropdown
            options={figurePositions}
            value={figurePosition.value}
            onValueChange={(newValue) => {
              figurePosition.set(newValue as FigurePosition ?? "");
              submit();
            }}
          />
        </CommonOptions>
        {figurePosition.value === 'id' && (
          <CommonOptions title={t`立绘插图的ID`}>
            <input
              value={figureId.value}
              onChange={(ev) => {
                const newValue = ev.target.value;
                figureId.set(newValue ?? "");
                triggerSubmit();
              }}
              onBlur={() => {
                submitDebounced.cancel();
                submit();
              }}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              className={styles.sayInput}
              placeholder={t`立绘 ID`}
              style={{ width: "100%" }}
            />
          </CommonOptions>
        )}
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
    </div>
  );
}
