import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import CommonOptions from "../components/CommonOption";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { t } from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { TerrePanel } from "../components/TerrePanel";
import { EffectEditor } from "../components/EffectEditor";
import { WsUtil } from "@/utils/wsUtil";
import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Text } from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import { useEaseTypeOptions } from "@/hooks/useEaseTypeOptions";
import { CloseSmall, Down, More, Plus, Up } from "@icon-park/react";

type PresetTarget = "fig-left" | "fig-center" | "fig-right" | "bg-main" | "stage-main";

interface IAnimationFrame {
  transform: string;
  duration: number;
  ease?: string;
}

export default function SetTempAnimation(props: ISentenceEditorProps) {
  const content = useValue(props.sentence.content);
  const animationFrameArray = useValue<IAnimationFrame[]>(initTransformArray(content.value));
  const currentFrameIndex = useValue<number>(0);
  const target = useValue(getArgByKey(props.sentence, "target")?.toString() ?? "");
  const presetTargets = new Map<PresetTarget, string>([
    [ "fig-left", t`左侧立绘` ],
    [ "fig-center", t`中间立绘` ],
    [ "fig-right", t`右侧立绘` ],
    [ "bg-main", t`背景图片` ],
    [ "stage-main", t`舞台画面` ],
  ]);
  const isPresetTarget = Array.from(presetTargets.keys()).includes(target.value as PresetTarget);
  const isUsePreset = useValue(isPresetTarget);
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const writeDefault = useValue(getArgByKey(props.sentence, 'writeDefault') === true);
  const keep = useValue(getArgByKey(props.sentence, 'keep') === true);

  const updateExpand = useEditorStore.use.updateExpand();
  const easeTypeOptions = useEaseTypeOptions();
  
  const submit = () => {
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      content.value,
      props.sentence.args,
      [
        {key: "target", value: target.value},
        {key: "writeDefault", value: writeDefault.value},
        {key: "keep", value: keep.value},
        {key: "next", value: isGoNext.value},
      ],
      props.sentence.inlineComment,
    );
    props.onSubmit(submitString);
  };

  const joinFrameString = () => {
    content.set(`[${animationFrameArray.value.map(frame => {
      try {
        const transformObj = JSON.parse(frame.transform) as any;
        const frameObj = { ...transformObj, duration: frame.duration, ease: frame.ease };
        return JSON.stringify(frameObj);
      } catch {
        return `{"duration":0}`;
      }
    }).join(",")}]`);
  };

  const addFrame = (index: number, frame: IAnimationFrame) => {
    if (index < 0 || index > animationFrameArray.value.length) {
      return;
    }
    const newArray = [...animationFrameArray.value];
    newArray.splice(index, 0, frame);
    animationFrameArray.set(newArray);
    joinFrameString();
  };

  const deleteFrame = (index: number) => {
    if (index < 0 || index >= animationFrameArray.value.length) {
      return;
    }
    const newArray = animationFrameArray.value.filter((_, i) => i !== index);
    animationFrameArray.set(newArray);
    joinFrameString();
  };

  const moveFrame = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= animationFrameArray.value.length) {
      return;
    }
    const newArray = [...animationFrameArray.value];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);
    animationFrameArray.set(newArray);
    joinFrameString();
  };

  const updateFrame = (index: number, newFrame: IAnimationFrame) => {
    if (index < 0 || index >= animationFrameArray.value.length) {
      return;
    }
    const newArray = [...animationFrameArray.value];
    newArray[index] = newFrame;
    animationFrameArray.set(newArray);
    joinFrameString();
  };

  const animationFrameElement = (index: number) => {
    if (index < 0 || index >= animationFrameArray.value.length) {
      return null;
    }
    const frame = animationFrameArray.value[index];
    return <div key={`animation-frame-${index}`}>
      <Text style={{ color: "var(--text-weak)", wordBreak: "break-word" }}>{`${index} ${frame.transform}`}</Text>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", width: "100%" }}>
        <CommonOptions key={`frame-control-${index}`} title={t`动画帧控制`}>
          <Button
            icon={<Up />}
            appearance="subtle"
            aria-label={t`上移`}
            title={t`上移`}
            disabled={index === 0}
            onClick={() => {
              moveFrame(index, index - 1);
              submit();
            }}
          />
          <Button
            icon={<Down />}
            appearance="subtle"
            aria-label={t`下移`}
            title={t`下移`}
            disabled={index === animationFrameArray.value.length - 1}
            onClick={() => {
              moveFrame(index, index + 1);
              submit();
            }}
          />
          <Menu>
            <MenuTrigger>
              <Button icon={<More/>} appearance="subtle" aria-label={t`操作`} title={t`操作`} />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<Plus/>} onClick={() => {
                  addFrame(index, { transform: "{}", duration: 0 });
                  submit();
                }}>
                  {t`向上添加`}
                </MenuItem>
                <MenuItem icon={<CloseSmall/>} onClick={() => {
                  deleteFrame(index);
                  submit();
                }}>
                  {t`删除`}
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </CommonOptions>
        <CommonOptions key={`effect-button-${index}`} title={t`效果编辑`}>
          <Button onClick={() => {
            currentFrameIndex.set(index);
            updateExpand(props.index);
          }}>
            {t`打开效果编辑器`}
          </Button>
        </CommonOptions>
        <CommonOptions key={`duration-${index}`} title={t`过渡时间（单位为毫秒）`}>
          <input
            placeholder={t`过渡时间（单位为毫秒）`}
            value={frame.duration.toString()}
            className={styles.sayInput}
            style={{ width: "100%" }}
            onChange={(ev) => {
              let duration = Number(ev.target.value);
              const newDuration = Number(ev.target.value);
              if (isNaN(newDuration))
                duration = 0;
              else
                duration = newDuration;
              updateFrame(index, { ...frame, duration: duration });
            }}
            onBlur={submit}
          />
        </CommonOptions>
        <CommonOptions key={`easeType-${index}`} title={t`缓动类型`}>
          <WheelDropdown
            options={easeTypeOptions}
            value={frame.ease ?? ""}
            onValueChange={(newValue) => {
              const newEase = newValue?.toString() ?? "";
              updateFrame(index, { ...frame, ease: newEase === "" ? undefined : newEase });
              submit();
            }}
          />
        </CommonOptions>
      </div>
    </div>
  };


  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "4px", width: "100%" }}>
        {animationFrameArray.value.map((_, index) => animationFrameElement(index))}
      </div>
      <Button onClick={() => {
        addFrame(animationFrameArray.value.length, { transform: "{}", duration: 0 });
        submit();
      }}>
        {t`添加动画帧`}
      </Button>
    </div>
    <div className={styles.editItem}>
      <TerrePanel key={`effect-editor-${props.index}`} sentenceIndex={props.index} title={t`效果编辑器`}>
        <EffectEditor
          json={animationFrameArray.value[currentFrameIndex.value]?.transform ?? "{}"}
          onChange={(newJson)=>{
            updateFrame(currentFrameIndex.value, { ...animationFrameArray.value[currentFrameIndex.value], transform: newJson || "{}" });
            submit();
          }}
          onUpdate={(transform)=>{
            const newEffect = { target: target.value, transform: transform };
            WsUtil.sendSetEffectCommand(JSON.stringify(newEffect));
          }}
        />
      </TerrePanel>
      <CommonOptions key="usePresetTarget" title={t`使用预设目标`}>
        <TerreToggle title="" onChange={(newValue) => {
          isUsePreset.set(newValue);
        }} onText={t`使用预设的作用目标，如果设置了id则不生效`} offText={t`手动输入 ID`}
        isChecked={isUsePreset.value} />
      </CommonOptions>
      {isUsePreset.value && <CommonOptions key="selectPresetTarget" title={t`选择预设目标`}>
        <WheelDropdown
          options={presetTargets}
          value={target.value}
          onValueChange={(newValue) => {
            target.set(newValue?.toString() ?? "");
            submit();
          }}
        />
      </CommonOptions>}
      {!isUsePreset.value && <CommonOptions key="targetId" title={t`输入目标 ID`}>
        <input value={target.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            target.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`立绘 ID`}
          style={{ width: "100%" }}
        />
      </CommonOptions>}
      <CommonOptions key="writeDefault" title={t`补充默认值`}>
        <TerreToggle title="" onChange={(newValue) => {
          writeDefault.set(newValue);
          submit();
        }} onText={t`继承默认效果`} offText={t`继承现有效果`} isChecked={writeDefault.value} />
      </CommonOptions>
      <CommonOptions key="keep" title={t`跨语句动画`}>
        <TerreToggle title="" onChange={(newValue) => {
          keep.set(newValue);
          submit();
        }} onText={t`开启`} offText={t`关闭`} isChecked={keep.value} />
      </CommonOptions>
      <CommonOptions key="isGoNext" title={t`连续执行`}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t`本句执行后执行下一句`} offText={t`本句执行后等待`} isChecked={isGoNext.value} />
      </CommonOptions>
    </div>
  </div>;
}

function initTransformArray(transformArrayStr: string): IAnimationFrame[] {
  const trimStr = transformArrayStr.trim();
  if (trimStr.length === 0) {
    return [];
  }

  try {
    const frames = JSON.parse(trimStr);
    if (!Array.isArray(frames)) {
      return [];
    }

    return frames.map((obj: any) => {
      if (typeof obj !== 'object' || obj === null) {
        return { transform: '{}', duration: 0, ease: undefined };
      }
      const { duration, ease, ...transform } = obj;
      return {
        transform: JSON.stringify(transform),
        duration: duration ?? 0,
        ease: ease,
      };
    });
  } catch (e) {
    return [];
  }
}
