import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { useEffect } from "react";
import { Dropdown } from "@fluentui/react";

export default function ChangeFigure(props: ISentenceEditorProps) {

  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const figureFile = useValue(props.sentence.content);
  const figurePosition = useValue<"left" | "" | "right">("");
  const id = useValue(getArgByKey(props.sentence, "id").toString() ?? "");
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
  const submit = () => {
    const isGoNextStr = isGoNext.value ? " -next" : "";
    const pos = figurePosition.value !== "" ? ` -${figurePosition.value}` : "";
    const idStr = id.value !== "" ? ` -id=${id.value}` : "";
    props.onSubmit(`changeFigure:${figureFile.value}${pos}${isGoNextStr}${idStr};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title="立绘文件">
        <>
          {figureFile.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
            figureFile.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".png", ".jpg", ".webp"]} />
        </>
      </CommonOptions>
      <CommonOptions key="2" title="连续执行下一句">
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText="本句执行后执行下一句" offText="本句执行后等待" isChecked={isGoNext.value} />
      </CommonOptions>
      <CommonOptions title="立绘位置" key="3">
        <Dropdown
          selectedKey={figurePosition.value}
          options={[{ key: "left", text: "左侧" }, { key: "", text: "中间" }, { key: "right", text: "右侧" }]}
          onChange={(ev, newValue: any) => {
            figurePosition.set(newValue?.key?.toString() ?? "");
            submit();
          }}
        />
      </CommonOptions>
      <CommonOptions title="立绘ID（可选）" key="4">
        <input value={id.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            id.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder="立绘 ID"
          style={{width:"100%"}}
        />
      </CommonOptions>
    </div>
  </div>;
}
