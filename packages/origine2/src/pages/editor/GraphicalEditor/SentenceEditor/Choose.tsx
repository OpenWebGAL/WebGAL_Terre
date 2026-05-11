import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { cloneDeep } from "lodash";
import ChooseFile from "../../ChooseFile/ChooseFile";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Input,
  Tag,
} from "@fluentui/react-components";
import { t } from "@lingui/macro";
import { combineSubmitString } from "@/utils/combineSubmitString";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";
import { getArgByKey } from "../utils/getArgByKey";
import {
  Add20Filled,
  Add20Regular,
  ArrowRight20Filled,
  ArrowRight20Regular,
  bundleIcon,
  Delete20Filled,
  Delete20Regular,
} from "@fluentui/react-icons";

const AddIcon = bundleIcon(Add20Filled, Add20Regular);
const ArrowRightIcon = bundleIcon(ArrowRight20Filled, ArrowRight20Regular);
const DeleteIcon = bundleIcon(Delete20Filled, Delete20Regular);

const getInitialDefaultChoose = (value: string | boolean | number): number => {
  if (typeof value !== "number") {
    return 0;
  }
  return value > 0 ? Math.floor(value) : 0;
};

type ChooseTargetType = "scene" | "label";

const getChooseTargetType = (target: string, sceneLabels: string[]): ChooseTargetType => {
  const targetValue = target.trim();
  if (sceneLabels.includes(targetValue)) {
    return "label";
  }
  return extNameMap.get("scene")?.some(extName => targetValue.endsWith(extName)) ? "scene" : "label";
};

interface IChooseTargetDialogProps {
  target: string;
  sceneLabels: string[];
  onSelect: (target: string) => void;
}

function ChooseTargetDialog(props: IChooseTargetDialogProps) {
  const open = useValue(false);
  const manualLabel = useValue("");

  const selectTarget = (target: string) => {
    props.onSelect(target);
    open.set(false);
  };

  const targetType = getChooseTargetType(props.target, props.sceneLabels);
  const hasTarget = props.target.trim().length > 0;
  return <Dialog open={open.value} onOpenChange={(_, data) => open.set(data.open)}>
    <DialogTrigger disableButtonEnhancement>
      <Button className={styles.chooseTargetButton} onClick={() => manualLabel.set(targetType === "label" ? props.target : "")}>
        {t`选择跳转目标`}
      </Button>
    </DialogTrigger>
    <DialogSurface className={styles.chooseTargetDialogSurface}>
      <DialogBody>
        <DialogTitle>{t`选择跳转目标`}</DialogTitle>
        <DialogContent className={styles.chooseTargetDialogContent}>
          <section className={styles.chooseTargetSection}>
            <div className={styles.chooseTargetSectionTitle}>{t`跳转到场景`}</div>
            <div className={styles.chooseTargetSectionBody}>
              <ChooseFile title={t`选择场景文件`} basePath={["scene"]} selectedFilePath={props.target} onChange={(newFile) => {
                selectTarget(newFile?.name ?? "");
              }} extNames={extNameMap.get("scene")} />
              {targetType === "scene" && hasTarget && <span className={styles.chooseTargetCurrent}>{props.target}</span>}
            </div>
          </section>
          <section className={styles.chooseTargetSection}>
            <div className={styles.chooseTargetSectionTitle}>{t`跳转到本场景标签`}</div>
            <div className={styles.chooseLabelList}>
              {props.sceneLabels.length > 0
                ? props.sceneLabels.map(label => <Button
                  key={label}
                  appearance={props.target === label ? "primary" : "secondary"}
                  onClick={() => selectTarget(label)}
                >
                  {label}
                </Button>)
                : <span className={styles.chooseTargetEmpty}>{t`当前场景没有可选标签`}</span>}
            </div>
          </section>
          <section className={styles.chooseTargetSection}>
            <div className={styles.chooseTargetSectionTitle}>{t`输入任意标签`}</div>
            <div className={styles.chooseManualLabel}>
              <Input
                value={manualLabel.value}
                onChange={(_, data) => manualLabel.set(data.value)}
                placeholder={t`输入 label 名称`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && manualLabel.value.trim()) {
                    selectTarget(manualLabel.value.trim());
                  }
                }}
              />
              <Button
                appearance="primary"
                disabled={!manualLabel.value.trim()}
                onClick={() => selectTarget(manualLabel.value.trim())}
              >
                {t`使用此标签`}
              </Button>
            </div>
          </section>
        </DialogContent>
        <DialogActions>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary">{t`取消`}</Button>
          </DialogTrigger>
        </DialogActions>
      </DialogBody>
    </DialogSurface>
  </Dialog>;
}

function ChooseTargetDisplay(props: { target: string; sceneLabels: string[] }) {
  const targetType = getChooseTargetType(props.target, props.sceneLabels);
  const hasTarget = props.target.trim().length > 0;

  return <div className={styles.chooseTargetDisplay}>
    {hasTarget
      ? <>
        <Tag size="small" appearance="outline">{targetType === "scene" ? t`场景` : t`标签`}</Tag>
        <span className={styles.chooseTargetText}>{props.target}</span>
      </>
      : <span className={styles.chooseTargetPlaceholder}>{t`未选择跳转目标`}</span>}
  </div>;
}

export default function Choose(props: ISentenceEditorProps) {
  const chooseItems = useValue(props.sentence.content.split("|").map(e => e.split(":")));
  const defaultChoose = useValue(getInitialDefaultChoose(getArgByKey(props.sentence, "defaultChoose")));
  const sceneLabels = props.sceneLabels ?? [];

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
    const target = item[1] ?? "";
    return <div className={styles.chooseBranchItem} key={i}>
      <Button
        appearance="subtle"
        icon={<DeleteIcon />}
        title={t`删除本句`}
        aria-label={t`删除本句`}
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
      />
      <input value={item[0]}
        onChange={(ev) => {
          const newValue = ev.target.value;
          const newList = cloneDeep(chooseItems.value);
          newList[i][0] = newValue;
          chooseItems.set(newList);
        }}
        onBlur={submit}
        className={`${styles.sayInput} ${styles.chooseOptionInput}`}
        placeholder={t`选项名称`}
      />
      <span className={styles.chooseTargetArrow} aria-hidden="true">
        <ArrowRightIcon />
      </span>
      <ChooseTargetDisplay target={target} sceneLabels={sceneLabels} />
      <ChooseTargetDialog
        target={target}
        sceneLabels={sceneLabels}
        onSelect={(newValue) => {
          const newList = cloneDeep(chooseItems.value);
          newList[i][1] = newValue;
          chooseItems.set(newList);
          submit();
        }}
      />
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
    <div className={styles.chooseBranchAddRow}>
      <Button
        appearance="subtle"
        icon={<AddIcon />}
        title={t`添加语句`}
        aria-label={t`添加语句`}
        onClick={() => {
          const newList = cloneDeep(chooseItems.value);
          newList.push([t`选项`,t`选择场景文件`]);
          chooseItems.set(newList);
          submit();
        }}
      />
    </div>
  </div>;
}
