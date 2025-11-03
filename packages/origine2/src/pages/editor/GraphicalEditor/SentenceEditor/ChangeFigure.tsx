import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { useEffect, useMemo, useState } from "react";
import { EffectEditor } from "@/pages/editor/GraphicalEditor/components/EffectEditor";
import CommonTips from "@/pages/editor/GraphicalEditor/components/CommonTips";
import axios from "axios";
import { TerrePanel } from "@/pages/editor/GraphicalEditor/components/TerrePanel";
import { Button, Input } from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import { t } from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { combineSubmitString, argToString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";
import SearchableCascader from "@/pages/editor/GraphicalEditor/components/SearchableCascader";
import { useEaseTypeOptions } from "@/hooks/useEaseTypeOptions";
import { WsUtil } from "@/utils/wsUtil";
import { eventBus } from "@/utils/eventBus";

type FigurePosition = "" | "left" | "right";
type AnimationFlag = "" | "on";

// eslint-disable-next-line complexity
export default function ChangeFigure(props: ISentenceEditorProps) {
  const gameDir = useEditorStore.use.subPage();
  const updateExpand = useEditorStore.use.updateExpand();
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const figureFile = useValue(props.sentence.content);
  const isHaveSpineArg = figureFile.value.includes('?type=spine');
  const figurePosition = useValue<FigurePosition>("");
  const isNoFile = props.sentence.content === "";
  const id = useValue(getArgByKey(props.sentence, "id").toString() ?? "");
  const json = useValue<string>(getArgByKey(props.sentence, 'transform') as string);
  const duration = useValue<number | string>(getArgByKey(props.sentence, 'duration') as number);
  const mouthOpen = useValue(getArgByKey(props.sentence, "mouthOpen").toString() ?? "");
  const mouthHalfOpen = useValue(getArgByKey(props.sentence, "mouthHalfOpen").toString() ?? "");
  const mouthClose = useValue(getArgByKey(props.sentence, "mouthClose").toString() ?? "");
  const eyesOpen = useValue(getArgByKey(props.sentence, "eyesOpen").toString() ?? "");
  const eyesClose = useValue(getArgByKey(props.sentence, "eyesClose").toString() ?? "");
  const animationFlag = useValue(getArgByKey(props.sentence, "animationFlag").toString() ?? "");
  const bounds = useValue(getArgByKey(props.sentence, "bounds").toString() ?? "");
  const zIndex = useValue(String(getArgByKey(props.sentence, 'zIndex') ?? ''));
  const blink = useValue<string>(getArgByKey(props.sentence, "blink").toString() ?? "");
  const focus = useValue<string>(getArgByKey(props.sentence, "focus").toString() ?? "");
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [l2dMotionsList, setL2dMotionsList] = useState<string[]>([]);
  const [l2dExpressionsList, setL2dExpressionsList] = useState<string[]>([]);
  const [isSpineJsonFormat, setIsSpineJsonFormat] = useState(false);
  const isWindowAdjustment = useEditorStore.use.isWindowAdjustment();

  const currentMotion = useValue(getArgByKey(props.sentence, "motion").toString() ?? "");
  const currentExpression = useValue(
    getArgByKey(props.sentence, "expression").toString() ?? ""
  );

  const figurePositions = new Map<FigurePosition, string>([
    ["", t`中间`],
    ["left", t`左侧`],
    ["right", t`右侧`]
  ]);

  const animationFlags = new Map<AnimationFlag, string>([
    ["", "OFF"],
    ["on", "ON"],
  ]);

  const ease = useValue(getArgByKey(props.sentence, 'ease').toString() ?? '');
  const easeTypeOptions = useEaseTypeOptions();

  // Blink
  const blinkParam = useMemo(() => {
    if (blink.value === "") {
      return {};
    }
    try {
      return JSON.parse(blink.value);
    } catch (e) {
      console.error('Error parsing blink value:', e);
      return {};
    }
  }, [blink.value]);
  const blinkInterval = useValue(blinkParam?.blinkInterval ?? "");
  const blinkIntervalRandom = useValue(blinkParam?.blinkIntervalRandom ?? "");
  const openingDuration = useValue(blinkParam?.openingDuration ?? "");
  const closingDuration = useValue(blinkParam?.closingDuration ?? "");
  const closedDuration = useValue(blinkParam?.closedDuration ?? "");
  const updateBlinkParam = (): string => {
    const params: { [key: string]: any } = {
      blinkInterval: blinkInterval.value,
      blinkIntervalRandom: blinkIntervalRandom.value,
      openingDuration: openingDuration.value,
      closingDuration: closingDuration.value,
      closedDuration: closedDuration.value,
    };
    // 仅保留有效参数
    const result: { [key: string]: number } = {};
    for (const key in params) {
      if (!params.hasOwnProperty(key)) continue;
      const value = params[key];
      if (value !== '' && !isNaN(Number(value))) {
        result[key] = Number(value);
      }
    }
    // 若没有参数, 返回空字符串
    return Object.keys(result).length > 0 ? JSON.stringify(result) : "";
  };

  // Focus
  const focusParam = useMemo(() => {
    if (focus.value === "") {
      return {};
    }
    try {
      return JSON.parse(focus.value);
    } catch (e) {
      console.error('Error parsing focus value:', e);
      return {};
    }
  }, [focus.value]);
  const focusX = useValue(focusParam?.x ?? "");
  const focusY = useValue(focusParam?.y ?? "");
  const focusInstant = useValue(focusParam?.instant ?? "");
  const updateFocusParam = (): string => {
    const params: { [key: string]: any } = {
      x: focusX.value,
      y: focusY.value,
      instant: focusInstant.value,
    };
    // 仅保留有效参数
    const result: { [key: string]: any } = {};
    for (const key in params) {
      if (!params.hasOwnProperty(key)) continue;
      const value = params[key];
      if (key === 'instant' && (value === 'true' || value === 'false')) {
        // 特殊处理 instant
        result[key] = value === 'true';
      } else if (value !== '' && !isNaN(Number(value))) {
        result[key] = Number(value);
      }
    }
    // 若没有参数, 返回空字符串
    return Object.keys(result).length > 0 ? JSON.stringify(result) : "";
  };
  const focusInstantOptions = useMemo(() => new Map<string, string>([
    ["", t`默认`],
    ["true", t`开启`],
    ["false", t`关闭`],
  ]), []);

  useEffect(() => {
    if (figureFile.value.includes('json')) {
      console.log('loading JSON file to get motion and expression');
      axios.get(`/games/${gameDir}/game/figure/${figureFile.value}`).then(resp => {
        const data = resp.data;

        // 检测是否为 Spine JSON 格式
        if (data?.animations) {
          // 处理 Spine JSON 格式的 animations
          setIsSpineJsonFormat(true);
          const animations = Object.keys(data.animations);
          setL2dMotionsList(animations.sort((a, b) => a.localeCompare(b)));
          // Spine JSON 格式忽略 expressions
          setL2dExpressionsList([]);
        } else {
          // Live2D 格式
          setIsSpineJsonFormat(false);

          if (data?.motions) {
            // 处理 motions
            const motions = Object.keys(data.motions);
            setL2dMotionsList(motions.sort((a, b) => a.localeCompare(b)));
          }

          // 处理 expressions
          if (data?.expressions) {
            const expressions: string[] = data.expressions.map((exp: { name: string }) => exp.name);
            setL2dExpressionsList(expressions.sort((a, b) => a.localeCompare(b)));
          }

          // 处理 v3 版本的 model
          if (data?.['FileReferences']?.['Motions']) {
            const motions = Object.keys(data['FileReferences']['Motions']);
            setL2dMotionsList(motions.sort((a, b) => a.localeCompare(b)));
          }

          if (data?.['FileReferences']?.['Expressions']) {
            const expressions: string[] = data['FileReferences']['Expressions'].map((exp: { Name: string }) => exp.Name);
            setL2dExpressionsList(expressions.sort((a, b) => a.localeCompare(b)));
          }
        }

      });
    } else {
      setIsSpineJsonFormat(false);
    }
  }, [figureFile.value]);
  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };
  const optionButtonStyles = {
    root: {
      margin: '6px 0 0 0',
      display: 'flex'
    },
  };
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
  }, []);
  useEffect(() => {
    if (animationFlag.value === "on") {
      setIsAccordionOpen(true);
    } else {
      setIsAccordionOpen(false);
    }
  }, [animationFlag.value]);
  const submit = () => {
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      figureFile.value,
      props.sentence.args,
      [
        { key: "left", value: figurePosition.value === "left" },
        { key: "right", value: figurePosition.value === "right" },
        { key: "id", value: id.value },
        { key: "transform", value: json.value },
        { key: "duration", value: duration.value },
        ...(animationFlag.value !== "" ? [
          { key: "animationFlag", value: animationFlag.value },
          { key: "eyesOpen", value: eyesOpen.value },
          { key: "eyesClose", value: eyesClose.value },
          { key: "mouthOpen", value: mouthOpen.value },
          { key: "mouthHalfOpen", value: mouthHalfOpen.value },
          { key: "mouthClose", value: mouthClose.value },
        ] : [
          { key: "animationFlag", value: "" },
          { key: "eyesOpen", value: "" },
          { key: "eyesClose", value: "" },
          { key: "mouthOpen", value: "" },
          { key: "mouthHalfOpen", value: "" },
          { key: "mouthClose", value: "" },
        ]),
        { key: "motion", value: currentMotion.value },
        { key: "expression", value: currentExpression.value },
        { key: "bounds", value: bounds.value },
        { key: "blink", value: updateBlinkParam() },
        { key: "focus", value: updateFocusParam() },
        { key: "ease", value: ease.value },
        { key: "zIndex", value: zIndex.value },
        { key: "next", value: isGoNext.value },
      ],
    );
    props.onSubmit(submitString);
  };

  function Adjustment() {
    const lineContent = sentenceToRawLine(props.sentence)
    const lineNumber = props.index; // 如果 index 从 0 开始
    const targetPath = props.targetPath;
    WsUtil.sendSyncCommand(targetPath, lineNumber, lineContent);
    eventBus.emit('pixi-sync-command', {
      targetPath,
      lineNumber,
      lineContent
    });
  }

  // 将 sentence 对象转换回原始命令行字符串
  function sentenceToRawLine(sentence: any): string {
    let base = sentence.commandRaw;
    if (sentence.content) {
      base += ':' + sentence.content;
    }
    if (sentence.args && sentence.args.length > 0) {
      for (const arg of sentence.args) {
        let value = arg.value;
        // 如果是对象，转成 JSON 字符串
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        base += ` -${arg.key}=${value}`;
      }
    }
    return base;
  }

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t`关闭立绘`}>
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            figureFile.set(t`选择立绘文件`);
          } else
            figureFile.set("none");
          submit();
        }} onText={t`关闭立绘`} offText={t`显示立绘`} isChecked={isNoFile} />
      </CommonOptions>
      {!isNoFile &&
        <CommonOptions key="1" title={t`立绘文件`}>
          <>
            {figureFile.value + "\u00a0\u00a0"}
            <ChooseFile title={t`选择立绘文件`} basePath={['figure']} selectedFilePath={figureFile.value} onChange={(fileDesc) => {
              figureFile.set(fileDesc?.name ?? "");
              submit();
            }}
              extNames={[...extNameMap.get('image') ?? [], ...extNameMap.get('json') ?? []]} />
          </>
        </CommonOptions>}
      <CommonOptions key="2" title={t`连续执行`}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t`本句执行后执行下一句`}
          offText={t`本句执行后等待`} isChecked={isGoNext.value} />
      </CommonOptions>
      <CommonOptions title={t`z-index`} key="z-index">
        <input value={zIndex.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            zIndex.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`1, 2, 3, ...`}
          style={{ width: "100%" }}
        />
      </CommonOptions>
      {figureFile.value.includes('.json') && (
        <>
          <CommonOptions key="24" title={isSpineJsonFormat ? t`Spine 动画` : t`Live2D 动作`}>
            <SearchableCascader
              optionList={l2dMotionsList}
              value={currentMotion.value}
              onValueChange={(newValue) => {
                newValue && currentMotion.set(newValue);
                submit();
              }}
            />
          </CommonOptions>
          {!isSpineJsonFormat && (
            <CommonOptions key="25" title={t`Live2D 表情`}>
              <SearchableCascader
                optionList={l2dExpressionsList}
                value={currentExpression.value}
                onValueChange={(newValue) => {
                  newValue && currentExpression.set(newValue);
                  submit();
                }}
              />
            </CommonOptions>
          )}
        </>
      )}

      <CommonOptions title={t`立绘位置`} key="3">
        <WheelDropdown
          options={figurePositions}
          value={figurePosition.value}
          onValueChange={(newValue) => {
            figurePosition.set(newValue?.toString() as FigurePosition ?? "");
            submit();
          }}
        />
      </CommonOptions>
      <CommonOptions title={t`立绘ID（可选）`} key="4">
        <input value={id.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            id.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`立绘 ID`}
          style={{ width: "100%" }}
        />
      </CommonOptions>
      <CommonOptions key="23" title={t`显示效果`}>
        <Button onClick={() => {
          updateExpand(props.index);
        }}>{t`打开效果编辑器`}</Button>
      </CommonOptions>
      {isWindowAdjustment && <CommonOptions key="new-button" title={t`拖拽调整位置`}>
        <Button onClick={() => {
          Adjustment();
        }}>{t`开始`}</Button>
      </CommonOptions>}
      <TerrePanel
        title={t`效果编辑器`}
        sentenceIndex={props.index}
        bottomBarChildren={
          <>
            <CommonOptions key="11" title={t`过渡时间（单位为毫秒）`}>
              <div>
                <Input placeholder={t`过渡时间（单位为毫秒）`} value={duration.value.toString()} onChange={(_, data) => {
                  const newDuration = Number(data.value);
                  if (isNaN(newDuration) || data.value === '')
                    duration.set("");
                  else
                    duration.set(newDuration);
                }} onBlur={submit} />
              </div>
            </CommonOptions>
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
            {!figureFile.value.includes('.json') ? (
              <>
                <CommonOptions title={t`唇形同步与眨眼`} key="5">
                  <WheelDropdown
                    options={animationFlags}
                    value={animationFlag.value}
                    onValueChange={(newValue) => {
                      animationFlag.set(newValue?.toString() ?? "");
                      submit();
                    }}
                  />
                </CommonOptions>
                {animationFlag.value === "on" && (
                  <>
                    <CommonOptions key="6" title={t`张开嘴`}>
                      <>
                        {mouthOpen.value + "\u00a0\u00a0"}
                        <ChooseFile title={t`选择立绘文件`} basePath={['figure']} selectedFilePath={mouthOpen.value} onChange={(fileDesc) => {
                          mouthOpen.set(fileDesc?.name ?? "");
                          submit();
                        }}
                          extNames={extNameMap.get('image')} />
                      </>
                    </CommonOptions>
                    <CommonOptions key="7" title={t`半张嘴`}>
                      <>
                        {mouthHalfOpen.value + "\u00a0\u00a0"}
                        <ChooseFile title={t`选择立绘文件`} basePath={['figure']} selectedFilePath={mouthHalfOpen.value} onChange={(fileDesc) => {
                          mouthHalfOpen.set(fileDesc?.name ?? "");
                          submit();
                        }}
                          extNames={extNameMap.get('image')} />
                      </>
                    </CommonOptions>
                    <CommonOptions key="8" title={t`闭上嘴`}>
                      <>
                        {mouthClose.value + "\u00a0\u00a0"}
                        <ChooseFile title={t`选择立绘文件`} basePath={['figure']} selectedFilePath={mouthClose.value} onChange={(fileDesc) => {
                          mouthClose.set(fileDesc?.name ?? "");
                          submit();
                        }}
                          extNames={extNameMap.get('image')} />
                      </>
                    </CommonOptions>
                    <CommonOptions key="9" title={t`睁开眼睛`}>
                      <>
                        {eyesOpen.value + "\u00a0\u00a0"}
                        <ChooseFile title={t`选择立绘文件`} basePath={['figure']} selectedFilePath={eyesOpen.value} onChange={(fileDesc) => {
                          eyesOpen.set(fileDesc?.name ?? "");
                          submit();
                        }}
                          extNames={extNameMap.get('image')} />
                      </>
                    </CommonOptions>
                    <CommonOptions key="10" title={t`闭上眼睛`}>
                      <>
                        {eyesClose.value + "\u00a0\u00a0"}
                        <ChooseFile title={t`选择立绘文件`} basePath={['figure']} selectedFilePath={eyesClose.value} onChange={(fileDesc) => {
                          eyesClose.set(fileDesc?.name ?? "");
                          submit();
                        }}
                          extNames={extNameMap.get('image')} />
                      </>
                    </CommonOptions>
                  </>
                )}
              </>
            ) : (
              <>
                <CommonOptions title={t`自定义 Live2D 绘制范围`} key="bounds">
                  <Input value={bounds.value}
                    onChange={(ev) => {
                      const newValue = ev.target.value;
                      bounds.set(newValue ?? "");
                    }}
                    onBlur={submit}
                    placeholder={t`例如：-100,-100,100,100`}
                  />
                </CommonOptions>
                <CommonOptions key="blinkInterval" title={t`眨眼间隔(毫秒)`}>
                  <Input
                    placeholder={t`默认值24小时`}
                    value={blinkInterval.value.toString()}
                    onChange={(_, data) => {
                      blinkInterval.set(data.value);
                    }}
                    onBlur={submit}
                  />
                </CommonOptions>
                <CommonOptions key="blinkIntervalRandom" title={t`眨眼间隔随机变化(毫秒)`}>
                  <Input
                    placeholder={t`默认值1000`}
                    value={blinkIntervalRandom.value.toString()}
                    onChange={(_, data) => {
                      blinkIntervalRandom.set(data.value);
                    }}
                    onBlur={submit}
                  />
                </CommonOptions>
                <CommonOptions key="openingDuration" title={t`睁眼(毫秒)`}>
                  <Input
                    placeholder={t`默认值150`}
                    value={openingDuration.value.toString()}
                    onChange={(_, data) => {
                      openingDuration.set(data.value);
                    }}
                    onBlur={submit}
                  />
                </CommonOptions>
                <CommonOptions key="closingDuration" title={t`闭眼(毫秒)`}>
                  <Input
                    placeholder={t`默认值100`}
                    value={closingDuration.value.toString()}
                    onChange={(_, data) => {
                      closingDuration.set(data.value);
                    }}
                    onBlur={submit}
                  />
                </CommonOptions>
                <CommonOptions key="closedDuration" title={t`保持闭眼(毫秒)`}>
                  <Input
                    placeholder={t`默认值50`}
                    value={closedDuration.value.toString()}
                    onChange={(_, data) => {
                      closedDuration.set(data.value);
                    }}
                    onBlur={submit}
                  />
                </CommonOptions>
                <CommonOptions key="focusX" title={t`注视点X(-1~1)`}>
                  <Input
                    placeholder={t`默认值0`}
                    value={focusX.value.toString()}
                    onChange={(_, data) => {
                      focusX.set(data.value);
                    }}
                    onBlur={submit}
                  />
                </CommonOptions>
                <CommonOptions key="focusY" title={t`注视点Y(-1~1)`}>
                  <Input
                    placeholder={t`默认值0`}
                    value={focusY.value.toString()}
                    onChange={(_, data) => {
                      focusY.set(data.value);
                    }}
                    onBlur={submit}
                  />
                </CommonOptions>
                <CommonOptions key="focusInstant" title={t`立即注视`}>
                  <WheelDropdown
                    options={focusInstantOptions}
                    value={focusInstant.value.toString()}
                    onValueChange={(newValue) => {
                      focusInstant.set(newValue);
                      submit();
                    }}
                  />
                </CommonOptions>
              </>
            )}
          </>
        }
      >
        <CommonTips
          text={t`提示：效果只有在切换到不同立绘或关闭之前的立绘再重新添加时生效。如果你要为现有的立绘设置效果，请使用单独的设置效果命令`} />
        <EffectEditor
          json={json.value.toString()}
          onChange={(newJson) => {
            json.set(newJson);
            submit();
          }}
          onUpdate={(transform) => {
            let target = id.value;
            if (target === "") {
              // 根据位置确定目标
              if (figurePosition.value === "left") {
                target = "fig-left";
              } else if (figurePosition.value === "right") {
                target = "fig-right";
              } else {
                target = "fig-center";
              }
              const newEffect = { target: target, transform: transform };
              WsUtil.sendSetEffectCommand(JSON.stringify(newEffect));
            }
          }}
        />
      </TerrePanel>

    </div>
  </div>;
}
