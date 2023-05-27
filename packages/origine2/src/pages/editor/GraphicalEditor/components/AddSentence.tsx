import { sentenceEditorConfig } from "../SentenceEditor";
import { useValue } from "../../../../hooks/useValue";
import { useId } from "@fluentui/react-hooks";
import { Dialog, DialogType } from "@fluentui/react";
import { Add } from "@icon-park/react";
import stylesAs from "./addSentence.module.scss";
import stylesGe from '../graphicalEditor.module.scss';
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import useTrans from "@/hooks/useTrans";

export enum addSentenceType {
  forward,
  backward
}

interface IAddSentenceProps {
  titleText: string;
  type: addSentenceType
  onChoose: (newSentence: string) => void;
}

export default function AddSentence(props: IAddSentenceProps) {
  const t = useTrans('editor.graphical.components.addSentence.');
  const isShowCallout = useValue(false);
  const addButtonId = useId("addbutton");
  const addSentenceButtons = sentenceEditorConfig.filter(e => e.type !== commandType.comment).map(sentenceConfig => {
    return <div className={stylesAs.sentenceTypeButton} key={sentenceConfig.type} onClick={() => {
      props.onChoose(sentenceConfig.initialText());
      isShowCallout.set(false);
    }}>
      <div style={{padding:'0 0 4px 0'}}>
        {sentenceConfig.icon}
      </div>
      <div className={stylesAs.buttonDesc}>
        <div className={stylesAs.title}>
          {sentenceConfig.title()}
        </div>
        <div className={stylesAs.text}>
          {sentenceConfig.descText()}
        </div>
      </div>

    </div>;
  });

  const modelProps = {
    isBlocking: false,
    // styles: { main: { maxWidth: 600 } },
    topOffsetFixed: false
  };
  const dialogContentProps = {
    type: DialogType.largeHeader,
    title: props.titleText,
    subText: props.type ? t('dialogs.add.text.backward') : t('dialogs.add.text.forward')
  };

  return <>
    <div id={addButtonId} className={stylesGe.optionButton} onClick={() => isShowCallout.set(!isShowCallout.value)}>
      <Add strokeWidth={3} style={{ padding: "1px 4px 0 0" }} theme="outline" size="16" fill="#333" />
      {props.titleText}
    </div>
    {/* @ts-ignore */}
    {isShowCallout.value && <Dialog
      hidden={!isShowCallout.value}
      onDismiss={() => isShowCallout.set(false)}
      dialogContentProps={dialogContentProps}
      modalProps={modelProps}
      maxWidth="900px"
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
