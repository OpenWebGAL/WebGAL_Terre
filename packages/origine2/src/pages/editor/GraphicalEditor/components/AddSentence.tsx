import { sentenceEditorConfig } from "../SentenceEditor";
import { useValue } from "../../../../hooks/useValue";
import { Button, Dialog, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger } from "@fluentui/react-components";
import { Add } from "@icon-park/react";
import stylesAs from "./addSentence.module.scss";
import stylesGe from '../graphicalEditor.module.scss';
import { commandType } from "webgal-parser/src/interface/sceneInterface";
import { Dismiss24Filled, Dismiss24Regular, bundleIcon } from "@fluentui/react-icons";

export enum addSentenceType {
  forward,
  backward
}

interface IAddSentenceButtonProps {
  titleText: string;
  type: addSentenceType;
  onClick: () => void;
}

interface IAddSentenceDialogProps {
  open: boolean;
  titleText: string;
  onChoose: (newSentence: string) => void;
  onOpenChange: (open: boolean) => void;
}

interface IAddSentenceProps {
  titleText: string;
  type: addSentenceType;
  onChoose: (newSentence: string) => void;
}

export function AddSentenceButton(props: IAddSentenceButtonProps) {
  return <div className={stylesGe.optionButton} onClick={props.onClick}>
    <Add strokeWidth={3} style={{ padding: "2px 4px 0 0" }} theme="outline" size="16"/>
    {props.titleText}
  </div>;
}

export function AddSentenceDialog(props: IAddSentenceDialogProps) {
  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
  const addSentenceButtons = sentenceEditorConfig.filter(e => e.type !== commandType.comment).map(sentenceConfig => {
    return <div className={stylesAs.sentenceTypeButton} key={sentenceConfig.type} onClick={() => {
      props.onChoose(sentenceConfig.initialText());
      props.onOpenChange(false);
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

  return <Dialog
    open={props.open}
    onOpenChange={(_, data) => props.onOpenChange(data.open)}
  >
    <DialogSurface style={{ maxWidth: "960px"}}>
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
  </Dialog>;
}

export default function AddSentence(props: IAddSentenceProps) {
  const isShowCallout = useValue(false);
  return <>
    <AddSentenceButton
      titleText={props.titleText}
      type={props.type}
      onClick={() => isShowCallout.set(!isShowCallout.value)}
    />
    <AddSentenceDialog
      open={isShowCallout.value}
      titleText={props.titleText}
      onChoose={props.onChoose}
      onOpenChange={(open) => isShowCallout.set(open)}
    />
  </>;
}
