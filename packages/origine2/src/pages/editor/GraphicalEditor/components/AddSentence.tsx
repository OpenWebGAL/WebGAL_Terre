import { sentenceEditorConfig } from "../SentenceEditor";
import { useValue } from "../../../../hooks/useValue";
import { useId } from "@fluentui/react-hooks";
import { Callout } from "@fluentui/react";
import styles from "../../ChooseFile/chooseFile.module.scss";

interface IAddSentenceProps {
  titleText: string;
  onChoose: (newSentence: string) => void;
}

export default function AddSentence(props: IAddSentenceProps) {
  const isShowCallout = useValue(false);
  const addButtonId = useId("addbutton");
  const addSentenceButtons = sentenceEditorConfig.map(sentenceConfig => {
    return <div key={sentenceConfig.type} onClick={() => {props.onChoose(sentenceConfig.initialText);isShowCallout.set(false);}}>
      <div>
        {sentenceConfig.title}
      </div>
    </div>;
  });

  return <>
    <div id={addButtonId} onClick={() => isShowCallout.set(!isShowCallout.value)}>
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
