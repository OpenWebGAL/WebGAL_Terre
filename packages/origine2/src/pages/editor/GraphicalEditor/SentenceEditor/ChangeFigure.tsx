import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { useEffect,useState } from "react";
import { Dropdown,IDropdownOption } from "@fluentui/react";
import useTrans from "@/hooks/useTrans";
import { logger } from "../../../../utils/logger";
import { RootState } from "../../../../store/origineStore";
import { useSelector } from "react-redux";
import axios from "axios";

export default function ChangeFigure(props: ISentenceEditorProps) {

  const t = useTrans('editor.graphical.sentences.changeFigure.');
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const figureFile = useValue(props.sentence.content);
  const figurePosition = useValue<"left" | "" | "right">("");
  const isNoFile = props.sentence.content === "";
  const id = useValue(getArgByKey(props.sentence, "id").toString() ?? "");
  const regex = /.json$/;
  const motionOption = useValue(getArgByKey(props.sentence, "motion").toString() ?? "");
  let motionKeyList:any;
  let Motions;
  //const motionOptions:IDropdownOption[] = useState([{ key: '', text: 'None' }]);
  const [motionOptions, setState] = useState([{ key: '', text: 'none' }]);
  //const motionOptions:any = [{ key: '', text: 'None' }];
  const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  const url = location.href +"/games/"+ gameName +"/game/figure/"+figureFile.value;
  //let modelSelectedKey:any;

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

    // Add when extension is json and no dropdown list
    if (regex.test(figureFile.value) && motionOptions.length == 1){
      // get json
      axios.get(url).then(res => {
        // get motion
        Motions = res.data.FileReferences.Motions;
        if(Motions){
          motionKeyList = Object.keys(Motions);
          for (let id in motionKeyList){
            setState((list) => ([...list, {key: motionKeyList[id], text: motionKeyList[id]}]));
          }
        }
      });
    }
    
  }, []);

  const submit = () => {
    const isGoNextStr = isGoNext.value ? " -next" : "";
    const pos = figurePosition.value !== "" ? ` -${figurePosition.value}` : "";
    const idStr = id.value !== "" ? ` -id=${id.value}` : "";
    const motion = motionOption.value !== "" ? ` -motion=${motionOption.value}` : "";
    props.onSubmit(`changeFigure:${figureFile.value}${pos}${isGoNextStr}${idStr}${motion};`);
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
        }} onText={t("options.hide.on")} offText={t("options.hide.off")} isChecked={isNoFile} />
      </CommonOptions>
      {!isNoFile &&
        <CommonOptions key="1" title={t("options.file.title")}>
          <>
            {figureFile.value + "\u00a0\u00a0"}
            <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
              figureFile.set(fileDesc?.name ?? "");
              submit();
            }}
            extName={[".png", ".jpg", ".webp", ".json"]} />
          </>
        </CommonOptions>}
      <CommonOptions key="2" title={t('$editor.graphical.sentences.common.options.goNext.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t('$editor.graphical.sentences.common.options.goNext.on')} offText={t('$editor.graphical.sentences.common.options.goNext.off')} isChecked={isGoNext.value} />
      </CommonOptions>
      <CommonOptions title={t('options.position.title')} key="3">
        <Dropdown
          selectedKey={figurePosition.value}
          options={[
            { key: "left", text: t('options.position.options.left') },
            { key: "", text: t('options.position.options.center') },
            { key: "right", text: t('options.position.options.right') }
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
          style={{ width: "100%" }}
        />
      </CommonOptions>
      {regex.test(figureFile.value) && <CommonOptions title="motion" key="5" >
        <Dropdown
          options={motionOptions}
          onChange={(ev, newValue: any) => {
            motionOption.set(newValue?.key?.toString() ?? "");
            logger.debug("motionOptions",motionOptions);
            submit();
          }}
          selectedKey={motionOption.value}
          styles={{ dropdown: { width: "260px" } }}
        />
      </CommonOptions>}
    </div>
  </div>;
}