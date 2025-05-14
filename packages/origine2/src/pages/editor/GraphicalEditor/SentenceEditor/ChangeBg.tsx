import CommonOptions from "../components/CommonOption";
import {ISentenceEditorProps} from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import {useValue} from "../../../../hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import CommonTips from "@/pages/editor/GraphicalEditor/components/CommonTips";
import {EffectEditor} from "@/pages/editor/GraphicalEditor/components/EffectEditor";
import {TerrePanel} from "@/pages/editor/GraphicalEditor/components/TerrePanel";
import { Button, Input } from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import { t } from "@lingui/macro";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";

export default function ChangeBg(props: ISentenceEditorProps) {
  const isNoFile = props.sentence.content === "";
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const bgFile = useValue(props.sentence.content);
  const unlockName = useValue(getArgByKey(props.sentence, "unlockname").toString() ?? "");
  const unlockSeries = useValue(getArgByKey(props.sentence, "series").toString() ?? "");
  const json = useValue<string>(getArgByKey(props.sentence, 'transform') as string);
  const duration = useValue<number | string>(getArgByKey(props.sentence, 'duration') as number);
  const updateExpand = useEditorStore.use.updateExpand();
  const submit = () => {
    const isGoNextStr = isGoNext.value ? " -next" : "";
    const durationStr = duration.value === "" ? '' : ` -duration=${duration.value}`;
    const transformStr = json.value === "" ? '' : ` -transform=${json.value}`;
    if (bgFile.value !== "none") {
      props.onSubmit(`changeBg:${bgFile.value}${isGoNextStr}${durationStr}${transformStr}${unlockName.value !== "" ? " -unlockname=" + unlockName.value : ""}${unlockSeries.value !== "" ? " -series=" + unlockSeries.value : ""};`);
    } else {
      props.onSubmit(`changeBg:${bgFile.value}${isGoNextStr};`);
    }
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t`关闭背景`}>
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            bgFile.set(t`选择背景图片`);
          } else
            bgFile.set("none");
          submit();
        }} onText={t`关闭背景`} offText={t`显示背景`} isChecked={isNoFile}/>
      </CommonOptions>
      {!isNoFile && <CommonOptions key="1" title={t`背景文件`}>
        <>
          {bgFile.value + "\u00a0\u00a0"}
          <ChooseFile basePath={['background']} selectedFileName={bgFile.value} onChange={(fileDesc) => {
            bgFile.set(fileDesc?.name ?? "");
            submit();
          }}
          extNames={extNameMap.get('background')}/>
        </>
      </CommonOptions>}
      <CommonOptions key="2" title={t`连续执行`}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t`本句执行后执行下一句`}
        offText={t`本句执行后等待`} isChecked={isGoNext.value}/>
      </CommonOptions>
      {!isNoFile && <CommonOptions key="3" title={t`解锁名称`}>
        <input value={unlockName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            unlockName.set(newValue);
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{width: "200px"}}
          placeholder={t`解锁的 CG 名称`}
        />
      </CommonOptions>}
      <CommonOptions key="23" title={t`显示效果`}>
        <Button onClick={() => {
          updateExpand(props.index);
        }}>{t`打开效果编辑器`}</Button>
      </CommonOptions>
      <TerrePanel sentenceIndex={props.index} title={t`效果编辑器`}>
        <div>
          <CommonTips
            text={t`提示：效果只有在切换到不同背景或关闭之前的背景再重新添加时生效。如果你要为现有的背景设置效果，请使用单独的设置效果命令`}/>
          <EffectEditor json={json.value.toString()} onChange={(newJson) => {
            json.set(newJson);
            submit();
          }}/>
          <CommonOptions key="10" title={t`持续时间（单位为毫秒）`}>
            <div>
              <Input
                placeholder={t`持续时间（单位为毫秒）`}
                value={duration.value.toString()}
                onChange={(_, data) => {
                  const newDuration = Number(data.value);
                  if (isNaN(newDuration) || data.value === '')
                    duration.set("");
                  else
                    duration.set(newDuration);
                }}
                onBlur={submit}
              />
            </div>
          </CommonOptions>
        </div>
      </TerrePanel>
    </div>
  </div>;
}
