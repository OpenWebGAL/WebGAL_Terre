import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { cloneDeep } from "lodash";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { Button, Checkbox } from "@fluentui/react-components";
import { t } from "@lingui/macro";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";
import { getArgByKey } from "../utils/getArgByKey";

const getInitialDefaultChoose = (value: string | boolean | number): number => {
  if (typeof value !== "number") {
    return 0;
  }
  return value > 0 ? Math.floor(value) : 0;
};

export default function Choose(props: ISentenceEditorProps) {
  const chooseItems = useValue(props.sentence.content.split("|").map(e => e.split(":")));
  const defaultChoose = useValue(getInitialDefaultChoose(getArgByKey(props.sentence, "defaultChoose")));

  const submit = () => {
    const chooseItemsStr = chooseItems.value.map(e => e.join(":"));
    const contentStr = chooseItemsStr.join("|");
    const submitString = combineSubmitString(
      props.sentence.commandRaw,
      contentStr,
      props.sentence.args,
      [
        { key: "defaultChoose", value: defaultChoose.value > 0 ? defaultChoose.value : "" },
      ],
      props.sentence.inlineComment,
    );
    props.onSubmit(submitString);
  };

  const chooseList = chooseItems.value.map((item, i) => {
    return <div style={{ display: "flex", width: '100%', alignItems: "center", padding: '0 0 4px 0' }} key={i}>
      <Button
        onClick={() => {
          const newList = cloneDeep(chooseItems.value);
          newList.splice(i, 1);
          const newDefaultChoose = defaultChoose.value === i + 1
            ? 0
            : (defaultChoose.value > i + 1 ? defaultChoose.value - 1 : defaultChoose.value);
          chooseItems.set(newList);
          defaultChoose.set(newDefaultChoose);
          submit();
        }}
      >
        {t`删除本句`}
      </Button>
      <input value={item[0]}
        onChange={(ev) => {
          const newValue = ev.target.value;
          const newList = cloneDeep(chooseItems.value);
          newList[i][0] = newValue;
          chooseItems.set(newList);
        }}
        onBlur={submit}
        className={styles.sayInput}
        placeholder={t`选项名称`}
        style={{ width: "50%", margin: "0 6px 0 6px" }}
      />
      {
        item[1] + "\u00a0"
      }
      <ChooseFile title={t`选择场景文件`} basePath={['scene']} selectedFilePath={item[1]} onChange={(newFile) => {
        const newValue = newFile?.name ?? "";
        const newList = cloneDeep(chooseItems.value);
        newList[i][1] = newValue;
        chooseItems.set(newList);
        submit();
      }} extNames={extNameMap.get('scene')} />
      <Checkbox
        checked={defaultChoose.value === i + 1}
        label={t`默认选项`}
        onChange={(_, data) => {
          const newDefaultChoose = data.checked ? i + 1 : 0;
          defaultChoose.set(newDefaultChoose);
          submit();
        }}
      />
    </div>;
  });
  return <div className={styles.sentenceEditorContent}>
    {chooseList}
    <Button
      onClick={() => {
        const newList = cloneDeep(chooseItems.value);
        newList.push([t`选项`,t`选择场景文件`]);
        chooseItems.set(newList);
        submit();
      }}>
      {t`添加语句`}
    </Button>
  </div>;
}
