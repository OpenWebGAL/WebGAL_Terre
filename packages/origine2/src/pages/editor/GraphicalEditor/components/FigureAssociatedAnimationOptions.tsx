import { t } from "@lingui/macro";
import { ISentence } from "webgal-parser/src/interface/sceneInterface";
import CommonOptions from "./CommonOption";
import { OptionCategory } from "./OptionCategory";
import WheelDropdown from "./WheelDropdown";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";
import { getArgByKey } from "../utils/getArgByKey";
import { useValue } from "../../../../hooks/useValue";

type AnimationFlag = "" | "on";
type ImageKey = "mouthOpen" | "mouthHalfOpen" | "mouthClose" | "eyesOpen" | "eyesClose";

const imageKeys: ImageKey[] = ["mouthOpen", "mouthHalfOpen", "mouthClose", "eyesOpen", "eyesClose"];

/**
 * 图片立绘的唇形同步与眨眼差分图，changeFigure 与 changeFigureDiff 共用。
 * 这些图与当前立绘图片配套，关闭时一并清除全部参数。
 */
export function useFigureAssociatedAnimation(sentence: ISentence) {
  const read = (key: string) => getArgByKey(sentence, key).toString() ?? "";
  const animationFlag = useValue<string>(read("animationFlag"));
  const images: Record<ImageKey, typeof animationFlag> = {
    mouthOpen: useValue(read("mouthOpen")),
    mouthHalfOpen: useValue(read("mouthHalfOpen")),
    mouthClose: useValue(read("mouthClose")),
    eyesOpen: useValue(read("eyesOpen")),
    eyesClose: useValue(read("eyesClose")),
  };
  const submitArgs = () => {
    const isOn = animationFlag.value !== "";
    return [
      { key: "animationFlag", value: animationFlag.value },
      ...imageKeys.map((key) => ({ key, value: isOn ? images[key].value : "" })),
    ];
  };
  return { animationFlag, images, submitArgs };
}

interface IFigureAssociatedAnimationOptionsProps {
  state: ReturnType<typeof useFigureAssociatedAnimation>;
  onSubmit: () => void;
}

export function FigureAssociatedAnimationOptions({ state, onSubmit }: IFigureAssociatedAnimationOptionsProps) {
  const animationFlags = new Map<AnimationFlag, string>([
    ["", "OFF"],
    ["on", "ON"],
  ]);
  const titles: Record<ImageKey, string> = {
    mouthOpen: t`张开嘴`,
    mouthHalfOpen: t`半张嘴`,
    mouthClose: t`闭上嘴`,
    eyesOpen: t`睁开眼睛`,
    eyesClose: t`闭上眼睛`,
  };

  return (
    <OptionCategory key="animationFlagOptionGroup" title={t`图片差分`}>
      <CommonOptions title={t`唇形同步与眨眼`} key="animationFlagOption">
        <WheelDropdown
          options={animationFlags}
          value={state.animationFlag.value as AnimationFlag}
          onValueChange={(newValue) => {
            state.animationFlag.set(newValue?.toString() ?? "");
            onSubmit();
          }}
        />
      </CommonOptions>
      {state.animationFlag.value === "on" &&
        imageKeys.map((key) => (
          <CommonOptions key={`${key}Option`} title={titles[key]}>
            <>
              {state.images[key].value + "\u00a0\u00a0"}
              <ChooseFile
                title={t`选择立绘文件`}
                basePath={["figure"]}
                selectedFilePath={state.images[key].value}
                onChange={(fileDesc) => {
                  state.images[key].set(fileDesc?.name ?? "");
                  onSubmit();
                }}
                extNames={extNameMap.get("image")}
              />
            </>
          </CommonOptions>
        ))}
    </OptionCategory>
  );
}
