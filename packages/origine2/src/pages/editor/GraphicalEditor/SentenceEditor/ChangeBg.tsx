import CommonOptions from "../components/CommonOption";
import {ISentenceEditorProps} from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import {useValue} from "../../../../hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { Button } from "@fluentui/react-components";
import { t } from "@lingui/macro";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";
import { EditorPreviewClient } from "@/utils/editorPreviewClient";
import { AssetPreview } from "../components/AssetPreview";
import { useGlobalEffectEditor } from "@/hooks/useGlobalEffectEditor";
import { IgnoreDefaultOption } from "../components/IgnoreDefaultOption";

export default function ChangeBg(props: ISentenceEditorProps) {
  const isNoFile = props.sentence.content === "";
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const bgFile = useValue(props.sentence.content);
  const unlockName = useValue(getArgByKey(props.sentence, "unlockname").toString() ?? "");
  const unlockSeries = useValue(getArgByKey(props.sentence, "series").toString() ?? "");
  const unlockOrder = useValue<number | string>(getArgByKey(props.sentence, "order") as number);
  const json = useValue<string>(getArgByKey(props.sentence, 'transform') as string);
  const duration = useValue<number | string>(getArgByKey(props.sentence, 'duration') as number);
  const enterDuration = useValue<number | string>(getArgByKey(props.sentence, 'enterDuration') as number);
  const exitDuration = useValue<number | string>(getArgByKey(props.sentence, 'exitDuration') as number);
  const enterAnimation = useValue(getArgByKey(props.sentence, 'enter').toString() ?? "");
  const exitAnimation = useValue(getArgByKey(props.sentence, 'exit').toString() ?? "");
  const ease = useValue(getArgByKey(props.sentence, 'ease').toString() ?? '');
  const ignoreDefault = useValue(getArgByKey(props.sentence, 'ignoreDefault') === true);
  const submit = () => {
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      bgFile.value,
      props.sentence.args,
      [
        ...(bgFile.value !== "none" ? [
          {key: "transform", value: json.value},
          {key: "ease", value: ease.value},
          {key: "unlockname", value: unlockName.value},
          {key: "series", value: unlockSeries.value},
          {key: "order", value: unlockOrder.value},
        ] : [
          {key: "transform", value: ""},
          {key: "ease", value: ""},
          {key: "unlockname", value: ""},
          {key: "series", value: ""},
          {key: "order", value: ""},
        ]),
        {key: "duration", value: duration.value},
        {key: "enterDuration", value: enterDuration.value},
        {key: "exitDuration", value: exitDuration.value},
        {key: "enter", value: enterAnimation.value},
        {key: "exit", value: exitAnimation.value},
        {key: "ignoreDefault", value: ignoreDefault.value},
        {key: "next", value: isGoNext.value},
      ],
      props.sentence.inlineComment,
    );
    props.onSubmit(submitString);
  };

  const openEffectEditor = useGlobalEffectEditor((event) => {
    if (event.action === 'change') {
      json.set(event.value);
      submit();
    } else if (event.action === 'preview') {
      EditorPreviewClient.setEffect({ target: 'bg-main', transform: event.value, phase: 'preview' });
    } else {
      const values = { enterAnimation, exitAnimation, duration, enterDuration, exitDuration, ease };
      if (event.key in values) values[event.key as keyof typeof values].set(event.value as never);
      if (event.submit) submit();
    }
  });

  const showEffectEditor = () => {
    openEffectEditor({
      title: t`效果编辑器`,
      json: json.value.toString(),
      sentence: props.sentence,
      index: props.index,
      targetPath: props.targetPath,
      tip: t`提示：效果只有在切换到不同背景或关闭之前的背景再重新添加时生效。如果你要为现有的背景设置效果，请使用单独的设置效果命令`,
      options: {
        enterAnimation: enterAnimation.value,
        exitAnimation: exitAnimation.value,
        duration: duration.value,
        enterDuration: enterDuration.value,
        exitDuration: exitDuration.value,
        ease: ease.value,
      },
    });
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t`背景显示状态`}>
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            bgFile.set(t`选择背景文件`);
          } else
            bgFile.set("none");
          submit();
        }} onText={t`关闭背景`} offText={t`显示背景`} isChecked={isNoFile}/>
      </CommonOptions>
      {!isNoFile && <CommonOptions key="1" title={t`背景文件`}>
        <div className={styles.filePreviewRow}>
          <AssetPreview basePath="background" file={bgFile.value} />
          <span>{bgFile.value}</span>
          <ChooseFile title={t`选择背景文件`} basePath={['background']} selectedFilePath={bgFile.value} onChange={(fileDesc) => {
            bgFile.set(fileDesc?.name ?? "");
            submit();
          }}
          extNames={[...extNameMap.get('image') ?? [], ...extNameMap.get('video') ?? []]}/>
        </div>
      </CommonOptions>}
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
      {!isNoFile && <CommonOptions key="3.1" title={t`鉴赏系列`}>
        <input value={unlockSeries.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            unlockSeries.set(newValue);
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{width: "200px"}}
          placeholder={t`默认 default`}
        />
      </CommonOptions>}
      {!isNoFile && <CommonOptions key="3.2" title={t`鉴赏排序`}>
        <input
          type="number"
          value={unlockOrder.value}
          onChange={(ev) => unlockOrder.set(ev.target.value === "" ? "" : Number(ev.target.value))}
          onBlur={submit}
          className={styles.sayInput}
          style={{width: "200px"}}
          placeholder={t`默认值0`}
        />
      </CommonOptions>}
      <CommonOptions key="23" title={t`显示效果`}>
        <Button onClick={showEffectEditor}>{t`打开效果编辑器`}</Button>
      </CommonOptions>
      <IgnoreDefaultOption value={ignoreDefault.value} onChange={(value) => {
        ignoreDefault.set(value);
        submit();
      }} />
    </div>
    <div className={styles.commonArgItem}>
      <CommonOptions key="2" title={t`连续执行`}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t`本句执行后执行下一句`}
        offText={t`本句执行后等待`} isChecked={isGoNext.value}/>
      </CommonOptions>
      {props.extraOptions}
    </div>
  </div>;
}
