import {sentenceEditorConfig} from "../SentenceEditor";
import {useValue} from "../../../../hooks/useValue";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger
} from "@fluentui/react-components";
import {Add} from "@icon-park/react";
import stylesAs from "./addSentence.module.scss";
import stylesGe from '../graphicalEditor.module.scss';
import {commandType} from "webgal-parser/src/interface/sceneInterface";
import {bundleIcon, Dismiss24Filled, Dismiss24Regular} from "@fluentui/react-icons";
import React, {forwardRef, useImperativeHandle} from "react";

export const AddSentenceShortCutsConfig: {type: commandType, key: string}[] = [
  {
    "type": commandType.say,
    "key": "S",
  },
  {
    "type": commandType.changeFigure,
    "key": "F",
  }
];

export enum addSentenceType {
  forward,
  backward
}

export interface AddSentenceMethods {
  showUp: (title?: string) => void;
}

interface IAddSentenceProps {
  titleText: string;
  type: addSentenceType
  onChoose: (newSentence: string) => void;
}

export const AddSentence = forwardRef<AddSentenceMethods, IAddSentenceProps>((props: IAddSentenceProps, ref) => {
  const AddSentenceShortCutsHandle = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const type = AddSentenceShortCutsConfig.find(config => e.key.toLowerCase() === config.key.toLowerCase())?.type;

    if (type !== undefined) {
      const initialText = sentenceEditorConfig.find((config) => config.type === type)?.initialText();
      if (initialText) props.onChoose(initialText);
      isShowCallout.set(false);
    }
  };
  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
  const isShowCallout = useValue(false);
  const propsTitle = useValue(props.titleText);
  const addSentenceButtons = sentenceEditorConfig.filter(e => e.type !== commandType.comment).map(sentenceConfig => {
    return <div className={stylesAs.sentenceTypeButton} key={sentenceConfig.type} onClick={() => {
      props.onChoose(sentenceConfig.initialText());
      isShowCallout.set(false);
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

  useImperativeHandle(ref, () => ({
    showUp: (title?: string) => {
      isShowCallout.set(!isShowCallout.value);
      if (title) propsTitle.set(title);
    },
  }));

  return <>
    <div className={stylesGe.optionButton} onClick={() => isShowCallout.set(!isShowCallout.value)}>
      <Add strokeWidth={3} style={{ padding: "2px 4px 0 0" }} theme="outline" size="16"/>
      {propsTitle.value}
    </div>
    <Dialog
      open={isShowCallout.value}
      onOpenChange={() => isShowCallout.set(false)}
    >
      <DialogSurface style={{ maxWidth: "960px"}} onKeyDown={AddSentenceShortCutsHandle}>
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
          >{propsTitle.value}</DialogTitle>
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
