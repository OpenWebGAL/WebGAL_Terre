import CommonOptions from "../components/CommonOption";
import {ISentenceEditorProps} from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import {useValue} from "../../../../hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import {useEffect, useState} from "react";
import {ActionButton, DefaultButton, Dropdown, Panel, PanelType, PrimaryButton, TextField} from "@fluentui/react";
import useTrans from "@/hooks/useTrans";
import {EffectEditor} from "@/pages/editor/GraphicalEditor/components/EffectEditor";
import CommonTips from "@/pages/editor/GraphicalEditor/components/CommonTips";
import axios from "axios";
import {useSelector} from "react-redux";
import {RootState} from "@/store/origineStore";
import {TerrePanel} from "@/pages/editor/GraphicalEditor/components/TerrePanel";

export default function ChangeFigure(props: ISentenceEditorProps) {
  const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  const t = useTrans('editor.graphical.sentences.changeFigure.');
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const figureFile = useValue(props.sentence.content);
  const figurePosition = useValue<"left" | "" | "right">("");
  const isNoFile = props.sentence.content === "";
  const id = useValue(getArgByKey(props.sentence, "id").toString() ?? "");
  const json = useValue<string>(getArgByKey(props.sentence, 'transform') as string);
  const duration = useValue<number | string>(getArgByKey(props.sentence, 'duration') as number);
  const isShowEffectEditor = useValue(false);
  const mouthOpen = useValue(getArgByKey(props.sentence, "mouthOpen").toString() ?? "");
  const mouthHalfOpen = useValue(getArgByKey(props.sentence, "mouthHalfOpen").toString() ?? "");
  const mouthClose = useValue(getArgByKey(props.sentence, "mouthClose").toString() ?? "");
  const eyesOpen = useValue(getArgByKey(props.sentence, "eyesOpen").toString() ?? "");
  const eyesClose = useValue(getArgByKey(props.sentence, "eyesClose").toString() ?? "");
  const animationFlag = useValue(getArgByKey(props.sentence, "animationFlag").toString() ?? "");
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [l2dMotionsList, setL2dMotionsList] = useState<string[]>([]);
  const [l2dExpressionsList, setL2dExpressionsList] = useState<string[]>([]);

  const currentMotion = useValue(getArgByKey(props.sentence, "motion").toString() ?? "");
  const currentExpression = useValue(
    getArgByKey(props.sentence, "expression").toString() ?? ""
  );

  useEffect(() => {
    if (figureFile.value.includes('json')) {
      console.log('loading JSON file to get motion and expression');
      axios.get(`/games/${gameName}/game/figure/${figureFile.value}`).then(resp => {
        const data = resp.data;

        if(data?.motions){
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
        if(data?.['FileReferences']?.['Motions']){
          const motions = Object.keys(data['FileReferences']['Motions']);
          setL2dMotionsList(motions.sort((a, b) => a.localeCompare(b)));
        }

        if(data?.['FileReferences']?.['Expressions']){
          const expressions: string[] = data['FileReferences']['Expressions'].map((exp: { Name: string }) => exp.Name);
          setL2dExpressionsList(expressions.sort((a, b) => a.localeCompare(b)));
        }

      });
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
    const isGoNextStr = isGoNext.value ? " -next" : "";
    const pos = figurePosition.value !== "" ? ` -${figurePosition.value}` : "";
    const idStr = id.value !== "" ? ` -id=${id.value}` : "";
    const durationStr = duration.value === "" ? '' : ` -duration=${duration.value}`;
    const transformStr = json.value === "" || json.value === "{}" ? '' : ` -transform=${json.value}`;
    const animationStr = animationFlag.value !== "" ? ` -animationFlag=${animationFlag.value}` : "";
    const mouthOpenFile = mouthOpen.value !== "" ? ` -mouthOpen=${mouthOpen.value}` : "";
    const mouthHalfOpenFile = mouthHalfOpen.value !== "" ? ` -mouthHalfOpen=${mouthHalfOpen.value}` : "";
    const mouthCloseFile = mouthClose.value !== "" ? ` -mouthClose=${mouthClose.value}` : "";
    const eyesOpenFile = eyesOpen.value !== "" ? ` -eyesOpen=${eyesOpen.value}` : "";
    const eyesCloseFile = eyesClose.value !== "" ? ` -eyesClose=${eyesClose.value}` : "";
    const motionArgs = currentMotion.value !== '' ? ` -motion=${currentMotion.value}` : "";
    const expressionArgs = currentExpression.value !== '' ? ` -expression=${currentExpression.value}` : "";

    if (animationFlag.value === "") {
      props.onSubmit(`changeFigure:${figureFile.value}${pos}${idStr}${transformStr}${durationStr}${isGoNextStr}${motionArgs}${expressionArgs};`);
    } else {
      props.onSubmit(`changeFigure:${figureFile.value}${pos}${idStr}${transformStr}${durationStr}${isGoNextStr}${animationStr}${eyesOpenFile}${eyesCloseFile}${mouthOpenFile}${mouthHalfOpenFile}${mouthCloseFile}${motionArgs}${expressionArgs};`);
    }
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t("options.hide.title")}>
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            figureFile.set(t("options.hide.choose"));
          } else
            figureFile.set("none");
          submit();
        }} onText={t("options.hide.on")} offText={t("options.hide.off")} isChecked={isNoFile}/>
      </CommonOptions>
      {!isNoFile &&
        <CommonOptions key="1" title={t("options.file.title")}>
          <>
            {figureFile.value + "\u00a0\u00a0"}
            <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
              figureFile.set(fileDesc?.name ?? "");
              submit();
            }}
            extName={[".png", ".jpg", ".webp", ".json"]}/>
          </>
        </CommonOptions>}
      <CommonOptions key="2" title={t('$editor.graphical.sentences.common.options.goNext.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t('$editor.graphical.sentences.common.options.goNext.on')}
        offText={t('$editor.graphical.sentences.common.options.goNext.off')} isChecked={isGoNext.value}/>
      </CommonOptions>
      {figureFile.value.includes('.json') && (
        <>
          <CommonOptions key="24" title="live2D Motion">
            <Dropdown
              selectedKey={currentMotion.value}
              dropdownWidth={100}
              style={{width: 100}}
              options={l2dMotionsList.map(e => ({key: e, text: e}))}
              onChange={(ev, newValue: any) => {
                currentMotion.set(newValue.key);
                submit();
              }}
            />
          </CommonOptions>

          <CommonOptions key="25" title="live2D Expression">
            <Dropdown
              selectedKey={currentExpression.value}
              dropdownWidth={100}
              style={{width: 100}}
              options={l2dExpressionsList.map(e => ({key: e, text: e}))}
              onChange={(ev, newValue: any) => {
                currentExpression.set(newValue.key);
                submit();
              }}
            />
          </CommonOptions>
        </>
      )}

      <CommonOptions title={t('options.position.title')} key="3">
        <Dropdown
          selectedKey={figurePosition.value}
          options={[
            {key: "left", text: t('options.position.options.left')},
            {key: "", text: t('options.position.options.center')},
            {key: "right", text: t('options.position.options.right')}
          ]}
          onChange={(ev, newValue: any) => {
            figurePosition.set(newValue?.key?.toString() ?? "");
            submit();
          }}
        />
      </CommonOptions>
      <CommonOptions title={t('options.id.title')} key="4">
        <input value={id.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            id.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t('options.id.placeholder')}
          style={{width: "100%"}}
        />
      </CommonOptions>
      <CommonOptions key="23" title={t("options.displayEffect.title")}>
        <DefaultButton onClick={() => {
          isShowEffectEditor.value = true;
        }}>{t('$打开效果编辑器')}</DefaultButton>
      </CommonOptions>
      <TerrePanel
        title={t("$效果编辑器")}
        isOpen={isShowEffectEditor.value}
        onDismiss={() => {
          isShowEffectEditor.value = false;
        }}
      >
        <div>
          <CommonTips
            text={t("$效果提示")}/>
          <EffectEditor json={json.value.toString()} onChange={(newJson) => {
            json.set(newJson);
            submit();
          }}/>
          <CommonOptions key="10" title={t("$持续时间（单位为毫秒）")}>
            <div>
              <TextField placeholder={t("$持续时间（单位为毫秒）")} value={duration.value.toString()} onChange={(_, newValue) => {
                const newDuration = Number(newValue);
                if (isNaN(newDuration) || newValue === '')
                  duration.set("");
                else
                  duration.set(newDuration);
                submit();
              }}/>
            </div>
          </CommonOptions>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          width: animationFlag.value !== "on" ? 'auto' : '100%'
        }}>
          <CommonOptions title={t('options.animationType.flag')} key="5">
            <Dropdown
              selectedKey={animationFlag.value}
              options={[
                {key: "", text: 'Off'},
                {key: "on", text: 'ON'},
              ]}
              onChange={(ev, newValue: any) => {
                animationFlag.set(newValue?.key?.toString() ?? "");
                submit();
              }}
            />
          </CommonOptions>
          {animationFlag.value === "on" &&
            <CommonOptions key="6" title={t("options.animationType.lipSync.mouthOpen")}>
              <>
                {mouthOpen.value + "\u00a0\u00a0"}
                <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
                  mouthOpen.set(fileDesc?.name ?? "");
                  submit();
                }}
                extName={[".png", ".jpg", ".webp"]}/>
              </>
            </CommonOptions>}
          {animationFlag.value === "on" &&
            <CommonOptions key="7" title={t("options.animationType.lipSync.mouthHalfOpen")}>
              <>
                {mouthHalfOpen.value + "\u00a0\u00a0"}
                <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
                  mouthHalfOpen.set(fileDesc?.name ?? "");
                  submit();
                }}
                extName={[".png", ".jpg", ".webp"]}/>
              </>
            </CommonOptions>}
          {animationFlag.value === "on" &&
            <CommonOptions key="8" title={t("options.animationType.lipSync.mouthClose")}>
              <>
                {mouthClose.value + "\u00a0\u00a0"}
                <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
                  mouthClose.set(fileDesc?.name ?? "");
                  submit();
                }}
                extName={[".png", ".jpg", ".webp"]}/>
              </>
            </CommonOptions>}
          {animationFlag.value === "on" && <CommonOptions key="9" title={t("options.animationType.blink.eyesOpen")}>
            <>
              {eyesOpen.value + "\u00a0\u00a0"}
              <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
                eyesOpen.set(fileDesc?.name ?? "");
                submit();
              }}
              extName={[".png", ".jpg", ".webp"]}/>
            </>
          </CommonOptions>}
          {animationFlag.value === "on" && <CommonOptions key="10" title={t("options.animationType.blink.eyesClose")}>
            <>
              {eyesClose.value + "\u00a0\u00a0"}
              <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
                eyesClose.set(fileDesc?.name ?? "");
                submit();
              }}
              extName={[".png", ".jpg", ".webp"]}/>
            </>
          </CommonOptions>}
        </div>
      </TerrePanel>

    </div>
  </div>;
}
