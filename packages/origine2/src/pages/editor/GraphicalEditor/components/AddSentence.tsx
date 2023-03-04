import { sentenceEditorConfig } from "../SentenceEditor";
import { useValue } from "../../../../hooks/useValue";
import { useId } from "@fluentui/react-hooks";
import { Dialog, DialogType } from "@fluentui/react";
import { Add } from "@icon-park/react";
import stylesAs from "./addSentence.module.scss";
import { commandType } from "webgal-parser/src/interface/sceneInterface";

interface IAddSentenceProps {
  titleText: string;
  onChoose: (newSentence: string) => void;
}

export default function AddSentence(props: IAddSentenceProps) {
  const isShowCallout = useValue(false);
  const addButtonId = useId("addbutton");
  const addSentenceButtons = sentenceEditorConfig.filter(e => e.type !== commandType.comment).map(sentenceConfig => {
    return <div className={stylesAs.sentenceTypeButton} key={sentenceConfig.type} onClick={() => {
      props.onChoose(sentenceConfig.initialText);
      isShowCallout.set(false);
    }}>
      <div>
        {sentenceConfig.icon}
      </div>
      <div className={stylesAs.title}>
        {sentenceConfig.title}
      </div>
    </div>;
  });

  const modelProps = {
    isBlocking: false,
    // styles: { main: { maxWidth: 600 } },
    topOffsetFixed: true
  };
  const dialogContentProps = {
    type: DialogType.largeHeader,
    title: props.titleText,
    subText: props.titleText === "添加语句" ? "在场景末尾添加一条语句" : "在所选句子前添加一条语句"
  };

  return <>
    <div id={addButtonId} className={stylesAs.addSceneButton} onClick={() => isShowCallout.set(!isShowCallout.value)}>
      <Add style={{ padding: "0 4px 0 0" }} theme="outline" size="16" fill="#333" />
      {props.titleText}
    </div>
    {/* @ts-ignore */}
    {isShowCallout.value && <Dialog
      hidden={!isShowCallout.value}
      onDismiss={() => isShowCallout.set(false)}
      dialogContentProps={dialogContentProps}
      modalProps={modelProps}
      maxWidth="600px"
    >
      <div className={stylesAs.sentenceTypeButtonList}>
        {addSentenceButtons}
      </div>

    </Dialog>}
    {/* {( */}
    {/*  <Callout */}
    {/*    role="dialog" */}
    {/*    gapSpace={0} */}
    {/*    target={`#${addButtonId}`} */}
    {/*    // onDismiss={onCancel} */}
    {/*    setInitialFocus */}
    {/*    className={styles.callout} */}
    {/*  > */}
    {/*    <div className={styles.chooseFileCalloutContentWarpper}> */}
    {/*      <div className={styles.chooseFileCalloutTitle}> */}
    {/*        {props.titleText} */}
    {/*      </div> */}
    {/*      <div className={styles.chooseFileFileListWarpper}> */}
    {/*        {addSentenceButtons} */}
    {/*      </div> */}
    {/*    </div> */}
    {/*  </Callout> */}
    {/* )} */}
  </>;
}
