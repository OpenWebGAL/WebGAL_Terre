import CommonOptions from "../components/CommonOption";
import CommonTips from "../components/CommonTips";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { arg, commandType } from "webgal-parser/src/interface/sceneInterface";
import { useValue } from "../../../../hooks/useValue";
import ChooseFile from "../../ChooseFile/ChooseFile";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { t } from "@lingui/macro";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";
import { getArgByKey } from "../utils/getArgByKey";
import { Button } from "@fluentui/react-components";
import { Add20Filled, Add20Regular, bundleIcon, Delete20Filled, Delete20Regular } from "@fluentui/react-icons";
import { cloneDeep } from "lodash";

const AddIcon = bundleIcon(Add20Filled, Add20Regular);
const DeleteIcon = bundleIcon(Delete20Filled, Delete20Regular);

/** 所有命令通用的参数，由引擎自己消费，不会作为局部变量传给被调用的场景 */
const GENERIC_ARG_KEYS = ["when", "next", "continue"];
/** callScene 自己的参数，下面有专门的输入框，不算自定义传参 */
const CALL_SCENE_ARG_KEYS = ["writeReturnTo"];

const isReservedArgKey = (key: string) =>
  GENERIC_ARG_KEYS.includes(key.trim()) || CALL_SCENE_ARG_KEYS.includes(key.trim());

interface ISceneArg {
  key: string;
  value: string;
}

/** 除通用参数和 callScene 自己的参数外，其余都是传给被调用场景的自定义参数 */
const pickCustomArgs = (args: arg[]): ISceneArg[] =>
  args
    .filter(item => !isReservedArgKey(item.key))
    .map(item => ({ key: item.key, value: item.value.toString() }));

export default function ChangeCallScene(props: ISentenceEditorProps) {
  const isCallScene = useValue(props.sentence.command === commandType.callScene);
  const fileName = useValue(props.sentence.content);
  const writeReturnTo = useValue(getArgByKey(props.sentence, "writeReturnTo").toString());
  const sceneArgs = useValue<ISceneArg[]>(pickCustomArgs(props.sentence.args));

  const submit = () => {
    const submitString = combineSubmitString(
      isCallScene.value ? "callScene" : "changeScene",
      fileName.value,
      // 自定义参数和 writeReturnTo 完全由本组件掌控，只把通用参数原样带回去。
      // 否则被删掉的参数会被当作「未识别参数」重新追加，删不掉。
      props.sentence.args.filter(item => GENERIC_ARG_KEYS.includes(item.key)),
      isCallScene.value
        ? [
          ...sceneArgs.value
            .filter(item => item.key.trim() !== "")
            .map(item => ({ key: item.key.trim(), value: item.value })),
          { key: "writeReturnTo", value: writeReturnTo.value.trim() },
        ]
        : [], // changeScene 不支持传参，切过去时一并丢掉
      props.sentence.inlineComment,
    );
    props.onSubmit(submitString);
  };

  const updateArg = (index: number, patch: Partial<ISceneArg>) => {
    const newArgs = cloneDeep(sceneArgs.value);
    newArgs[index] = { ...newArgs[index], ...patch };
    sceneArgs.set(newArgs);
  };

  const hasReservedArgKey = sceneArgs.value.some(item => isReservedArgKey(item.key));

  const sceneArgList = sceneArgs.value.map((item, index) => <div className={styles.sceneArgItem} key={index}>
    <Button
      appearance="subtle"
      icon={<DeleteIcon />}
      title={t`删除参数`}
      aria-label={t`删除参数`}
      onClick={() => {
        const newArgs = cloneDeep(sceneArgs.value);
        newArgs.splice(index, 1);
        sceneArgs.set(newArgs);
        submit();
      }}
    />
    <input
      value={item.key}
      onChange={(ev) => updateArg(index, { key: ev.target.value })}
      onBlur={submit}
      className={`${styles.sayInput} ${styles.sceneArgInput} ${isReservedArgKey(item.key) ? styles.sceneArgInputInvalid : ""}`}
      placeholder={t`参数名`}
    />
    <span className={styles.sceneArgEqual} aria-hidden="true">=</span>
    <input
      value={item.value}
      onChange={(ev) => updateArg(index, { value: ev.target.value })}
      onBlur={submit}
      className={`${styles.sayInput} ${styles.sceneArgInput}`}
      placeholder={t`参数值，用花括号插值可取调用方的变量`}
    />
  </div>);

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t`场景文件`}>
        <>
          {fileName.value}{' '}
          <ChooseFile title={t`选择场景文件`} basePath={['scene']} selectedFilePath={fileName.value} onChange={(file) => {
            fileName.set(file?.name ?? "");
            submit();
          }} extNames={extNameMap.get('scene')} />
        </>
      </CommonOptions>
      <CommonOptions key="2" title={t`调用/切换场景`}>
        <TerreToggle title="" onChange={(newValue) => {
          isCallScene.set(newValue);
          submit();
        }} onText={t`调用场景，新场景结束后返回父场景`}
        offText={t`切换场景，新场景直接替换父场景`} isChecked={isCallScene.value} />
      </CommonOptions>
      {isCallScene.value && <CommonOptions key="3" title={t`返回值写入`}>
        <input
          value={writeReturnTo.value}
          onChange={(ev) => writeReturnTo.set(ev.target.value)}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`被调用场景 return 的值写入哪个变量，留空则丢弃`}
          style={{ width: "100%" }}
        />
      </CommonOptions>}
    </div>
    {isCallScene.value && <>
      <CommonTips text={t`传入的参数会成为被调用场景的局部变量，在那边用花括号插值取用，场景结束后即消失。`} />
      {hasReservedArgKey && <CommonTips
        style={{ color: "var(--danger)" }}
        text={t`标红的参数名是引擎保留的通用参数名，不会作为局部变量传入被调用的场景，请换一个名字。`}
      />}
      {sceneArgList}
      <div className={styles.sceneArgAddRow}>
        <Button
          appearance="subtle"
          icon={<AddIcon />}
          title={t`添加参数`}
          aria-label={t`添加参数`}
          onClick={() => sceneArgs.set([...cloneDeep(sceneArgs.value), { key: "", value: "" }])}
        />
      </div>
    </>}
  </div>;
}
