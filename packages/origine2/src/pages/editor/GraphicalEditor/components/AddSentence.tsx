import {sentenceEditorConfig} from "../SentenceEditor";
import {useValue} from "../../../../hooks/useValue";
import {
  Button,
  Input,
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
import React, {forwardRef, useImperativeHandle, useRef} from "react";
import {shortCutParse} from "@/pages/editor/GraphicalEditor/GraphicalEditor";
import useEditorStore from "@/store/useEditorStore";
import {IAddSentenceShortCutsConfig} from "@/types/editor";

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

/* 快捷键输入控件通过操作获得返回值 */
const AddSentenceShortCutsInput = React
  .forwardRef((props:
               {ShortCutConfig: IAddSentenceShortCutsConfig | undefined,
                 type?: commandType}, ref) => {
    const displayInput = useValue(false);
    const configShortCutsConfig = (props.ShortCutConfig === undefined ?
      {
        shortcuts: "",
        type: props.type,
        initialText: "",
      } : props.ShortCutConfig);
    const configInput = useValue(configShortCutsConfig?.shortcuts || '');
    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => ({
      toggle: (): IAddSentenceShortCutsConfig | null => {
        if (displayInput.value) {
          displayInput.set(false);
          return {
            shortcuts: configInput.value,
            type: (props.type === undefined) ? "custom" : props.type,
            initialText: props.ShortCutConfig?.initialText,
          };
        } else {
          displayInput.set(true);
          setTimeout(() => inputRef.current?.focus(), 50);
          return null;
        }
      },
      close: () => {
        displayInput.set(false);
        return {
          shortcuts: configInput.value,
          type: (props.ShortCutConfig === undefined) ? "custom" : props.ShortCutConfig?.type,
          initialText: props.ShortCutConfig?.initialText,
        };
      }
    }));

    const keyInputHandle = (e: React.KeyboardEvent<any>) => {
      const key = shortCutParse(e);
      if (key.toLowerCase() === "Backspace".toLowerCase()) {
        configInput.set("");
      } else {
        configInput.set(key);
      }
    };

    return (
      <div style={{ width: "100%" }}>
        <div style={{ display: displayInput.value ? "none" : "block" }}>{configInput.value}</div>
        <Input
          ref={inputRef}
          value={configInput.value}
          style={{ display: !displayInput.value ? "none" : "block" }}
          onKeyDown={(e) => {
            keyInputHandle(e);
            e.preventDefault();
          }}
        />
      </div>
    );
  });

export const AddSentence = forwardRef<AddSentenceMethods, IAddSentenceProps>((props: IAddSentenceProps, ref) => {
  const settingMode = useValue(false);
  const AddSentenceShortCutsConfig = useEditorStore.getState().addSentenceShortCuts;
  const updateShortConfigFunction = useEditorStore.use.updateAddSentenceConfig();
  const addSentenceShortCutsHandle = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const pressedKeys = shortCutParse(e);
    const data =
      AddSentenceShortCutsConfig.find(
        (config) => pressedKeys.toLowerCase() === config.shortcuts.toLowerCase());
    if (data !== undefined && !settingMode.value) {
      const initialText = (data.type === "custom") ? data.initialText :
        sentenceEditorConfig.find((config) => config.type === data.type)?.initialText();
      if (initialText) props.onChoose(initialText);
      isShowCallout.set(false);
    }
  };
  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
  const isShowCallout = useValue(false);
  const propsTitle = useValue(props.titleText);

  const addSentenceButtons = sentenceEditorConfig.filter(e => e.type !== commandType.comment).map(sentenceConfig => {
    const shortCutInputRef = useRef<any>(null);
    const shortCutConfigIndex = AddSentenceShortCutsConfig.findIndex(
      (config) => config.type === sentenceConfig.type);
    const shortCutConfig = AddSentenceShortCutsConfig[shortCutConfigIndex];
    const shortCutInputOnClick = (e: any) => {
      if (settingMode.value) {
        const shortCutResult = shortCutInputRef.current?.toggle();
        updateShortCutInput(shortCutResult);
      }
      else {
        props.onChoose(sentenceConfig.initialText());
        isShowCallout.set(false);
      }
      e.preventDefault();
    };

    const updateShortCutInput = (shortCutResult: IAddSentenceShortCutsConfig) => {
      if (shortCutResult) {
        if (shortCutConfigIndex !== -1){
          AddSentenceShortCutsConfig[shortCutConfigIndex] = shortCutResult;
        } else AddSentenceShortCutsConfig.push(shortCutResult);
        console.info("设置快捷键：" + shortCutResult);
        updateShortConfigFunction(AddSentenceShortCutsConfig);
      }
    };

    return <div className={stylesAs.sentenceTypeButton} key={sentenceConfig.type}
      onClick={shortCutInputOnClick} onBlur={shortCutInputOnClick}>
      <div style={{padding:'1px 0 0 0'}}>
        {sentenceConfig.icon}
      </div>
      <div className={stylesAs.buttonDesc}>
        <div className={stylesAs.title}>
          {sentenceConfig.title()}
        </div>
        <div style={{display: (settingMode.value ? 'none' : 'block')}} className={stylesAs.text}>
          {sentenceConfig.descText()}
        </div>
      </div>
      <div style={{display: (!settingMode.value ? 'none' : 'block')}} className={stylesAs.text}>
        <AddSentenceShortCutsInput
          ShortCutConfig={shortCutConfig}
          type={sentenceConfig.type}
          ref={shortCutInputRef} />
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
      <DialogSurface style={{ maxWidth: "960px"}} onKeyDown={addSentenceShortCutsHandle}>
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
            <Button onClick={() => settingMode.set(!settingMode.value)}>
              设置 {settingMode.value ? "开启中" : "关闭中"}
            </Button>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  </>;
});
