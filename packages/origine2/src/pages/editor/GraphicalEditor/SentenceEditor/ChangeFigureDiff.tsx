import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { useEffect } from "react";
import { t } from "@lingui/macro";
import WheelDropdown from "@/pages/editor/GraphicalEditor/components/WheelDropdown";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";
import { AssetPreview } from "../components/AssetPreview";
import {
  FigureAssociatedAnimationOptions,
  useFigureAssociatedAnimation,
} from "../components/FigureAssociatedAnimationOptions";

type FigurePosition = "" | "left" | "left14" | "left13" | "right13" | "right14" | "right";

/**
 * 立绘差分切换编辑器组件
 * 用于 changeFigureDiff 指令：同一立绘换表情等差分，只换图片，保留变换、层级等状态。
 * 口型眨眼图与表情配套，随本句整体替换；Live2D、Spine 不适用，只提供图片文件。
 */
export default function ChangeFigureDiff(props: ISentenceEditorProps) {
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const figureFile = useValue(props.sentence.content);
  const figurePosition = useValue<FigurePosition>("");
  const isNoFile = props.sentence.content === "" || props.sentence.content === "none";
  const id = useValue(getArgByKey(props.sentence, "id").toString() ?? "");
  const associatedAnimation = useFigureAssociatedAnimation(props.sentence);

  const figurePositions = new Map<FigurePosition, string>([
    ["left", t`左侧`],
    ["left14", t`左侧 1/4`],
    ["left13", t`左侧 1/3`],
    ["", t`中间`],
    ["right13", t`右侧 1/3`],
    ["right14", t`右侧 1/4`],
    ["right", t`右侧`],
  ]);

  useEffect(() => {
    /**
     * 初始化立绘位置
     */
    figurePositions.forEach((_, position) => {
      if (position !== "" && getArgByKey(props.sentence, position)) {
        figurePosition.set(position);
      }
    });
  }, []);

  const submit = () => {
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      figureFile.value,
      props.sentence.args,
      [
        ...Array.from(figurePositions.keys())
          .filter((position) => position !== "")
          .map((position) => ({ key: position, value: figurePosition.value === position })),
        { key: "id", value: id.value },
        ...associatedAnimation.submitArgs(),
        { key: "next", value: isGoNext.value },
      ],
      props.sentence.inlineComment,
    );
    props.onSubmit(submitString);
  };

  return (
    <div className={styles.sentenceEditorContent}>
      <div className={styles.editItem}>
        <CommonOptions key="isNoDialog" title={t`清除立绘`}>
          <TerreToggle
            title=""
            onChange={(newValue) => {
              if (!newValue) {
                figureFile.set(t`选择立绘文件`);
              } else {
                figureFile.set("none");
              }
              submit();
            }}
            onText={t`清除立绘`}
            offText={t`显示立绘`}
            isChecked={isNoFile}
          />
        </CommonOptions>
        {!isNoFile && (
          <CommonOptions key="1" title={t`立绘文件`}>
            <div className={styles.filePreviewRow}>
              <AssetPreview basePath="figure" file={figureFile.value} />
              <span>{figureFile.value}</span>
              <ChooseFile
                title={t`选择立绘文件`}
                basePath={['figure']}
                selectedFilePath={figureFile.value}
                onChange={(fileDesc) => {
                  figureFile.set(fileDesc?.name ?? "");
                  submit();
                }}
                extNames={extNameMap.get('image')}
              />
            </div>
          </CommonOptions>
        )}
        <CommonOptions title={t`立绘位置`} key="3">
          <WheelDropdown
            options={figurePositions}
            value={figurePosition.value}
            onValueChange={(newValue) => {
              figurePosition.set((newValue?.toString() as FigurePosition) ?? "");
              submit();
            }}
          />
        </CommonOptions>
        <CommonOptions title={t`立绘ID（可选）`} key="4">
          <input
            value={id.value}
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
        <CommonOptions key="2" title={t`连续执行`}>
          <TerreToggle
            title=""
            onChange={(newValue) => {
              isGoNext.set(newValue);
              submit();
            }}
            onText={t`本句执行后执行下一句`}
            offText={t`本句执行后等待`}
            isChecked={isGoNext.value}
          />
        </CommonOptions>
        {!isNoFile && <FigureAssociatedAnimationOptions state={associatedAnimation} onSubmit={submit} />}
        {props.extraOptions}
      </div>
    </div>
  );
}

