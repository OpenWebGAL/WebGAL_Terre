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
import {bundleIcon, Dismiss24Filled, Dismiss24Regular, Delete24Filled, Delete24Regular} from "@fluentui/react-icons";
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import useEditorStore from "@/store/useEditorStore";
import {IAddSentenceShortCutsConfig, ShortCutParse} from "@/types/editor";
import {t} from "@lingui/macro";
import {InputTextarea} from "primereact/inputtextarea";

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
  displayButton?: boolean,
}

const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
const DeleteIcon = bundleIcon(Delete24Filled, Delete24Regular);

let updateShortConfigFunction: any;

function updateShortCutInput(shortCutResult: IAddSentenceShortCutsConfig, shortCutConfigIndex: number) {
  const addSentenceShortCutsConfig = useEditorStore.getState().addSentenceShortCuts;
  if (!updateShortConfigFunction || !addSentenceShortCutsConfig) return;

  if (shortCutResult) {
    if (shortCutConfigIndex !== -1) {
      if (shortCutResult.type !== 'custom') {
        addSentenceShortCutsConfig[shortCutConfigIndex] = shortCutResult;
      } else {
        const targetIndex = addSentenceShortCutsConfig.
          findIndex((config) => config.index === shortCutConfigIndex);
        addSentenceShortCutsConfig[targetIndex] = shortCutResult;
      }
    } else addSentenceShortCutsConfig.push(shortCutResult);
    updateShortConfigFunction(addSentenceShortCutsConfig);
  }
  return addSentenceShortCutsConfig;
}

function deleteShortCutInput(shortCutConfigIndex: number){
  const addSentenceShortCutsConfig = useEditorStore.getState().addSentenceShortCuts;
  const newConfig = addSentenceShortCutsConfig.filter(
    config => config.index !== shortCutConfigIndex
  );
  updateShortConfigFunction(newConfig);
  return newConfig;
}

/* 快捷键输入控件通过操作获得返回值 */
const AddSentenceShortCutsInput =
  (props: { ShortCutConfig: IAddSentenceShortCutsConfig}) => {
    const displayInput = useValue(false);
    const keydownHandle = (e: KeyboardEvent | React.KeyboardEvent<any>) => {
      const shortcut = ShortCutParse(e);
      if (shortcut.toLowerCase() === 'backspace') configInput.set("");
      else configInput.set(shortcut);
      e.stopPropagation();
      e.preventDefault();
    };
    const configShortCutsConfig = props.ShortCutConfig;
    const configInput = useValue(configShortCutsConfig?.shortcuts || '');
    const inputRef = useRef<HTMLInputElement | null>(null);

    function toggle() {
      if (displayInput.value) {
        displayInput.set(false);
        if (configShortCutsConfig.type !== 'custom') {
          updateShortCutInput({
            shortcuts: configInput.value,
            type: configShortCutsConfig.type,
          }, Number(configShortCutsConfig.type));
        }
        else if (configShortCutsConfig.type === 'custom' && configShortCutsConfig.index !== undefined) {
          updateShortCutInput({
            shortcuts: configInput.value,
            type: configShortCutsConfig.type,
            index: configShortCutsConfig.index,
            initialText: props.ShortCutConfig?.initialText,
          }, Number(configShortCutsConfig.index));
        }
      } else {
        displayInput.set(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }

    return (
      <div onClick={() => toggle()} onBlur={toggle}>
        <div style={{display: displayInput.value ? "none" : "block"}}>
          {t`快捷键：`}
          {configInput.value ? configInput.value : t`无`}
        </div>
        <Input
          ref={inputRef}
          value={configInput.value}
          style={{display: !displayInput.value ? "none" : "block", fontSize: "90%"}}
          onKeyDown={keydownHandle}
        />
      </div>
    );
  };

const CustomAddSentenceList =
  forwardRef<AddSentenceMethods>
  ((props, ref) => {
    const isShowDialog = useValue(false);
    const dialogTitle = useValue("");
    const [localAddSentenceShortCutsConfig, setLocalAddSentenceShortCutsConfig] =
      useState(useEditorStore.getState().addSentenceShortCuts);

    useImperativeHandle(ref, () => ({
      showUp: (title?: string) => {
        if (title) dialogTitle.set(title);
        isShowDialog.set(!isShowDialog.value);
      },
    }));

    function getMinAvailableIndex() {
      let index = 0;

      localAddSentenceShortCutsConfig
        .filter((config) => config.index !== undefined)
        // @ts-ignore
        .sort((a, b) => a.index - b.index)
        .forEach((config) => {
          if (config.index === index) index ++;
        });
      return index;
    }

    function pushShortCutConfig() {
      const defaultConfig: IAddSentenceShortCutsConfig = {
        type: "custom",
        shortcuts: "",
        index: getMinAvailableIndex()
      };
      const result =
        updateShortCutInput(defaultConfig, -1);
      if (result) setLocalAddSentenceShortCutsConfig([...result]);
    }

    function deleteShortCutConfig(index: number | undefined) {
      if (!index) return;
      const result = deleteShortCutInput(index);
      if (result) setLocalAddSentenceShortCutsConfig([...result]);
    }

    return <Dialog
      open={isShowDialog.value}
      onOpenChange={() => isShowDialog.set(false)}>
      <DialogSurface>
        <DialogBody style={{minHeight: '500px'}}>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={<DismissIcon/>}
                />
              </DialogTrigger>
            }
          >{dialogTitle.value}
          </DialogTitle>
          <DialogContent>
            {localAddSentenceShortCutsConfig.filter(e => e.type === 'custom').
              map((value, key) => {
                return <div className={stylesAs.sentenceTypeSettingArea} key={key}>
                  <DeleteIcon onClick={() => {deleteShortCutConfig(value.index);}}/>
                  序号：{value.index}
                  <AddSentenceShortCutsInput ShortCutConfig={value}/>
                  快捷指令：
                  <InputTextarea style={{width: "100%"}} className={`custom-add-sentence-index-${value.index}`}
                    onKeyDown={event => event.stopPropagation()}
                    onBlur={() => {
                      const newConfig = value;
                      // @ts-ignore
                      const textValue = document.querySelector(`.custom-add-sentence-index-${value.index}`)?.value;
                      if (textValue && newConfig.index !== undefined) {
                        newConfig.initialText = textValue;
                        updateShortCutInput(newConfig, newConfig.index);
                      }
                    }} defaultValue={value.initialText}/>
                </div>;
              })}
            <Button onClick={() => pushShortCutConfig()}>
              {t`添加新自定义语句`}
            </Button>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>;
  });

export const AddSentence = forwardRef<AddSentenceMethods, IAddSentenceProps>((props: IAddSentenceProps, ref) => {
  const settingMode = useValue(false);
  const addSentenceShortCutsConfig = useEditorStore.getState().addSentenceShortCuts;
  const customAddSentenceRef = useRef<AddSentenceMethods>(null);
  updateShortConfigFunction = useEditorStore.use.updateAddSentenceShortCut();
  const addSentenceShortCutsHandle = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const pressedKeys = ShortCutParse(e);
    const data =
      addSentenceShortCutsConfig.find(
        (config) => pressedKeys.toLowerCase() === config.shortcuts.toLowerCase());
    if (data !== undefined && !settingMode.value) {
      const initialText = (data.type === "custom") ? data.initialText :
        sentenceEditorConfig.find((config) => config.type === data.type)?.initialText();
      if (initialText) props.onChoose(initialText);
      isShowCallout.set(false);
    }
  };
  const isShowCallout = useValue(false);
  const propsTitle = useValue(props.titleText);

  const addSentenceButtons = sentenceEditorConfig.filter(e => e.type !== commandType.comment).map(sentenceConfig => {
    const shortCutConfigIndex = addSentenceShortCutsConfig.findIndex(
      (config) => config.type === sentenceConfig.type);
    const shortCutConfig = (shortCutConfigIndex >= 0) ? addSentenceShortCutsConfig[shortCutConfigIndex] :
      { shortcuts: "", type: sentenceConfig.type };
    const shortCutInputOnClick = (e: any) => {
      if (!settingMode.value) {
        props.onChoose(sentenceConfig.initialText());
        isShowCallout.set(false);
      }
      e.preventDefault();
    };

    return <div className={stylesAs.sentenceTypeButton} key={sentenceConfig.type}
      onClick={shortCutInputOnClick} onBlur={shortCutInputOnClick}>
      <div style={{padding: '1px 0 0 0'}}>
        {sentenceConfig.icon}
      </div>
      <div className={stylesAs.buttonDesc}>
        <div className={stylesAs.title}>
          {sentenceConfig.title()}
        </div>
        <div className={stylesAs.text}>
          <div style={{display: (settingMode.value ? 'none' : 'block')}}>
            {sentenceConfig.descText()}
          </div>
          <div style={{display: (!settingMode.value ? 'none' : 'block')}}>
            <AddSentenceShortCutsInput
              ShortCutConfig={shortCutConfig}/>
          </div>
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

  const BelowButtons = <div style={{display: "flex", gap: "10px"}}>
    <Button onClick={() => settingMode.set(!settingMode.value)}>
      {t`快捷键设置模式`}: {settingMode.value ? "On" : "Off"}
    </Button>
    <Button onClick={() => customAddSentenceRef.current?.showUp(t`自定义语句设置`)}>
      {t`打开自定义语句设置`}
    </Button>
  </div>;

  return <>
    <div className={stylesGe.optionButton}
      style={{display: props.displayButton === false ? "none" : "block"}}
      onClick={() => isShowCallout.set(!isShowCallout.value)}>
      <Add strokeWidth={3} style={{padding: "2px 4px 0 0"}} theme="outline" size="16"/>
      {propsTitle.value}
    </div>
    <Dialog
      open={isShowCallout.value}
      onOpenChange={() => {
        settingMode.set(false);
        isShowCallout.set(false);
      }}
    >
      <DialogSurface style={{maxWidth: "960px"}} onKeyDown={addSentenceShortCutsHandle}>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={<DismissIcon/>}
                />
              </DialogTrigger>
            }
          >{propsTitle.value}</DialogTitle>
          <DialogContent>
            <div className={stylesAs.sentenceTypeButtonList}>
              {addSentenceButtons}
            </div>
            {BelowButtons}
          </DialogContent>
        </DialogBody>
        <CustomAddSentenceList ref={customAddSentenceRef}/>
      </DialogSurface>
    </Dialog>
  </>;
});
