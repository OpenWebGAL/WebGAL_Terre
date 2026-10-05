import { ISentence } from "webgal-parser/src/interface/sceneInterface";
import styles from "../SentenceEditor/sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import CommonOptions from "./CommonOption";
import { t } from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { EditorPreviewClient } from "@/utils/editorPreviewClient";
import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Text } from "@fluentui/react-components";
import { useEaseTypeOptions } from "@/hooks/useEaseTypeOptions";
import { CloseSmall, Down, More, Plus, Up } from "@icon-park/react";
import { useGlobalEffectEditor } from "@/hooks/useGlobalEffectEditor";
import { useRef } from "react";

interface IAnimationFrame {
  transform: string;
  duration: number;
  ease?: string;
}

interface ILegacyTempAnimationFramesProps {
  /** 语句内容，即 v1 关键帧数组；修改后立即写入，再由 submit 提交 */
  content: { value: string; set: (newValue: string) => void };
  submit: () => void;
  target: string;
  sentence: ISentence;
  index: number;
  targetPath: string;
}

/**
 * 多段动画的 v1 关键帧数组（顶层为数组）的编辑器，只为兼容旧脚本保留。
 * 新建的多段动画使用 Animation v2，在动画编辑器中编辑
 */
export function LegacyTempAnimationFrames(props: ILegacyTempAnimationFramesProps) {
  const { content, submit } = props;
  const animationFrameArray = useValue<IAnimationFrame[]>(initTransformArray(content.value));
  const easeTypeOptions = useEaseTypeOptions();

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
  const effectFrameIndex = useRef(-1);
  const openEffectEditor = useGlobalEffectEditor((event) => {
    const index = effectFrameIndex.current;
    if (event.action === 'change' && animationFrameArray.value[index]) {
      updateFrame(index, { ...animationFrameArray.value[index], transform: event.value || "{}" });
      submit();
    } else if (event.action === 'preview') {
      EditorPreviewClient.setEffect({ target: props.target, transform: event.value, phase: 'preview' });
    }
  });

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
            effectFrameIndex.current = index;
            openEffectEditor({
              title: t`效果编辑器`,
              json: animationFrameArray.value[index]?.transform ?? "{}",
              sentence: props.sentence,
              index: props.index,
              targetPath: props.targetPath,
            });
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
    </div>;
  };

  return <>
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "4px", width: "100%" }}>
      {animationFrameArray.value.map((_, index) => animationFrameElement(index))}
    </div>
    <Button onClick={() => {
      addFrame(animationFrameArray.value.length, { transform: "{}", duration: 0 });
      submit();
    }}>
      {t`添加动画帧`}
    </Button>
  </>;
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
