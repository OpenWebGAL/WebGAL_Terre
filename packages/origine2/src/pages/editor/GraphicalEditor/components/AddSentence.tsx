import { sentenceEditorConfig } from "../SentenceEditor";
import { useValue } from "../../../../hooks/useValue";
import { Button, Dialog, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger } from "@fluentui/react-components";
import { Add } from "@icon-park/react";
import stylesAs from "./addSentence.module.scss";
import stylesGe from '../graphicalEditor.module.scss';
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import { Dismiss24Filled, Dismiss24Regular, bundleIcon } from "@fluentui/react-icons";
import React, {forwardRef, KeyboardEvent, useImperativeHandle} from "react";

export enum addSentenceType {
  forward,
  backward
}

interface IAddSentenceProps {
  titleText: string;
  type: addSentenceType
  onChoose: (newSentence: string) => void;
}

export interface AddSentenceMethods {
  showUp: () => void;
}

const AddSentence = forwardRef<AddSentenceMethods, IAddSentenceProps>((props: IAddSentenceProps, ref) => {
  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
  const isShowCallout = useValue(false);
  const sentenceConfigMap = sentenceEditorConfig.filter(e => e.type !== commandType.comment);
  const addSentenceButtons = sentenceConfigMap.map(sentenceConfig => {
    return <div className={stylesAs.sentenceTypeButton} key={sentenceConfig.type} onClick={() => {
      isShowCallout.set(false);
      props.onChoose(sentenceConfig.initialText());
    }}>
      <div style={{padding:'1px 0 0 0'}}>
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
  const addSentenceHotKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey && event.key === "1") {
      event.preventDefault();
      isShowCallout.set(false);
      props.onChoose(sentenceConfigMap[0].initialText());
    }
  };

  useImperativeHandle(ref, () => ({
    showUp: () => {
      isShowCallout.set(!isShowCallout.value);
    },
  }));

  return <>
    <div className={stylesGe.optionButton} onClick={() => isShowCallout.set(!isShowCallout.value)}>
      <Add strokeWidth={3} style={{ padding: "2px 4px 0 0" }} theme="outline" size="16"/>
      {props.titleText}
    </div>
    <Dialog
      open={isShowCallout.value}
      onOpenChange={() => isShowCallout.set(false)}
    >
      <DialogSurface style={{ maxWidth: "960px"}} onKeyDown={addSentenceHotKey}>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={<DismissIcon />}
                />
              </DialogTrigger>
            }
          >{props.titleText}</DialogTitle>
          <DialogContent>
            <div className={stylesAs.sentenceTypeButtonList}>
              {addSentenceButtons}
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  </>;
});

export default AddSentence;
