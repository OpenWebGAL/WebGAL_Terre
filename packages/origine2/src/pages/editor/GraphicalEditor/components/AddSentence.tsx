import { sentenceEditorConfig } from "../SentenceEditor";
import { useValue } from "../../../../hooks/useValue";
import { useId } from "@fluentui/react-hooks";
import { Callout } from "@fluentui/react";
import styles from "../../ChooseFile/chooseFile.module.scss";
import { Add } from "@icon-park/react";
import stylesAs from './addSentence.module.scss';

interface IAddSentenceProps {
  titleText: string;
  onChoose: (newSentence: string) => void;
}

export default function AddSentence(props: IAddSentenceProps) {
  const isShowCallout = useValue(false);
  const addButtonId = useId("addbutton");
  const addSentenceButtons = sentenceEditorConfig.map(sentenceConfig => {
    return <div className={stylesAs.sentenceTypeButton} key={sentenceConfig.type} onClick={() => {props.onChoose(sentenceConfig.initialText);isShowCallout.set(false);}}>
      <div>
        {sentenceConfig.icon}
      </div>
      <div className={stylesAs.title}>
        {sentenceConfig.title}
      </div>
    </div>;
  });

  return <>
    <div id={addButtonId} className={stylesAs.addSceneButton} onClick={() => isShowCallout.set(!isShowCallout.value)}>
      <Add style={{padding:'0 4px 0 0'}} theme="outline" size="16" fill="#333"/>
      {props.titleText}
    </div>
    {isShowCallout.value && (
      <Callout
        role="dialog"
        gapSpace={0}
        target={`#${addButtonId}`}
        // onDismiss={onCancel}
        setInitialFocus
        className={styles.callout}
      >
        <div className={styles.chooseFileCalloutContentWarpper}>
          <div className={styles.chooseFileCalloutTitle}>
            {props.titleText}
          </div>
          <div className={styles.chooseFileFileListWarpper}>
            {addSentenceButtons}
          </div>
        </div>
      </Callout>
    )}
  </>;
}
