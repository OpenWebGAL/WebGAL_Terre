import styles from "../topbarTabs.module.scss";
import {useValue} from "../../../../../hooks/useValue";
import axios from "axios";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../store/origineStore";
import React, {useState, useEffect, useRef} from "react";
import {cloneDeep} from "lodash";
import ChooseFile from "../../../ChooseFile/ChooseFile";
import useTrans from "@/hooks/useTrans";
import TagTitleWrapper from "@/components/TagTitleWrapper/TagTitleWrapper";
import {WebgalConfig} from "webgal-parser/build/es/configParser/configParser";
import {WebgalParser} from "@/pages/editor/GraphicalEditor/parser";
import {logger} from "@/utils/logger";
import {textboxThemes} from "./constants";
import {eventBus} from "@/utils/eventBus";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {Add, Plus, Write} from "@icon-park/react";
import { Button, Dropdown, Input, Option } from "@fluentui/react-components";
import { Dismiss24Filled, Dismiss24Regular, bundleIcon } from "@fluentui/react-icons";

export default function GameConfig() {
  const t = useTrans("editor.sideBar.gameConfigs.");
  const state = useSelector((state: RootState) => state.status.editor);

  // 拿到游戏配置
  const gameConfig = useValue<WebgalConfig>([]);
  console.log(gameConfig);
  const getGameConfig = () => {
    axios
      .get(`/api/manageGame/getGameConfig/${state.currentEditingGame}`)
      .then((r) => parseAndSetGameConfigState(r.data));
  };

  useEffect(() => {
    getGameConfig();
  }, []);

  function updateGameConfig() {
    const newConfig = WebgalParser.stringifyConfig(gameConfig.value);
    const form = new URLSearchParams();
    form.append("gameName", state.currentEditingGame);
    form.append("newConfig", newConfig);
    axios.post(`/api/manageGame/setGameConfig/`, form).then(getGameConfig);
  }

  function getConfigContentAsString(key: string) {
    return gameConfig.value.find(e => e.command === key)?.args?.join('') ?? '';
  }

  function getConfigContentAsStringArray(key: string) {
    return gameConfig.value.find(e => e.command === key)?.args ?? [];
  }

  function updateGameConfigSimpleByKey(key: string, value: string) {
    const newConfig = cloneDeep(gameConfig.value);
    const index = newConfig.findIndex(e => e.command === key);
    if (index >= 0) {
      newConfig[index].args = [value];
    } else {
      newConfig.push({command: key, args: [value], options: []});
    }
    gameConfig.set(newConfig);
    updateGameConfig();
  }

  function updateGameConfigArrayByKey(key: string, value: string[]) {
    const newConfig = cloneDeep(gameConfig.value);
    const index = newConfig.findIndex(e => e.command === key);

    if (index >= 0) {
      newConfig[index].args = value;
    } else {
      newConfig.push({command: key, args: value, options: []});
    }

    gameConfig.set(newConfig);
    updateGameConfig();
  }

  function parseAndSetGameConfigState(data: string) {
    console.log(data);
    gameConfig.set(WebgalParser.parseConfig(data));
    if (getConfigContentAsString('Game_key') === '') {
      // 设置默认识别码
      const randomCode = (Math.random() * 100000).toString(16).replace(".", "d");
      updateGameConfigSimpleByKey("Game_key", randomCode);
    }
  }

  return (
    <>
      <TabItem title={t("options.name")}>
        <GameConfigEditor key="gameName" value={getConfigContentAsString('Game_name')}
          onChange={(e: string) => updateGameConfigSimpleByKey("Game_name", e)}/>
      </TabItem>
      <TabItem title={t("options.id")}>
        <GameConfigEditor key="gameKey" value={getConfigContentAsString('Game_key')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Game_key', e)}/>
      </TabItem>
      <TabItem title={t("options.description")}>
        <GameConfigEditor key="gameDescription" value={getConfigContentAsString('Description')}
          onChange={(e: string) => updateGameConfigSimpleByKey("Description", e)}/>
      </TabItem>
      <TabItem title={t("options.packageName")}>
        <GameConfigEditor key="packageName" value={getConfigContentAsString('Package_name')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Package_name', e)}/>
      </TabItem>
      {/* <TabItem title={t("options.textboxTheme")}> */}
      {/*  <GameConfigEditorWithSelector key="packageName" value={getConfigContentAsString('Textbox_theme')} */}
      {/*    onChange={(e: string) => updateGameConfigSimpleByKey('Textbox_theme', e)} */}
      {/*    selectItems={textboxThemes}/> */}
      {/* </TabItem> */}
      <TabItem title={t("options.bg")}>
        <GameConfigEditorWithFileChoose
          sourceBase="background"
          extNameList={[".jpg", ".png", ".webp"]}
          key="titleBackground"
          value={getConfigContentAsString('Title_img')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Title_img', e)}/>
      </TabItem>
      <TabItem title={t("options.bgm")}>
        <div className={styles.sidebar_gameconfig_title}>{}</div>
        <GameConfigEditorWithFileChoose
          extNameList={[".mp3", ".ogg", ".wav"]}
          sourceBase="bgm" key="titleBgm"
          value={getConfigContentAsString('Title_bgm')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Title_bgm', e)}/>
      </TabItem>
      <TabItem title={t("options.logoImage")}>
        <GameConfigEditorWithImageFileChoose
          sourceBase="background"
          extNameList={[".jpg", ".png", ".webp"]}
          key="logoImage"
          value={getConfigContentAsStringArray('Game_Logo')}
          onChange={(e: string[]) => updateGameConfigArrayByKey('Game_Logo', e)}/>
      </TabItem>
    </>
  );
}

interface IGameConfigEditor {
  key: string;
  value: string;
  onChange: Function;
}

interface IGameConfigEditorMulti {
  key: string;
  value: string[];
  onChange: Function;
}

function GameConfigEditor(props: IGameConfigEditor) {
  const t = useTrans("common.");
  const showEditBox = useValue(false);

  return <div className={styles.textEditArea} style={{maxWidth: 200}}>
    {!showEditBox.value && props.value}
    {!showEditBox.value &&
    <span className={styles.editButton} onClick={() => showEditBox.set(true)}>
      <Write theme="outline" size="16" fill="#005CAF" strokeWidth={3}/>
    </span>}
    {showEditBox.value &&
    <Input
      autoFocus
      defaultValue={props.value}
      onBlur={(event) => {
        props.onChange(event.target.value);
        showEditBox.set(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          const inputElement = event.target as HTMLInputElement;
          props.onChange(inputElement.value);
          showEditBox.set(false);
        }
      }}
    />}
  </div>;
}

function GameConfigEditorWithSelector(props: IGameConfigEditor & {
  selectItems: { key: string, text: string }[],
}) {
  return (
    <Dropdown
      value={props.selectItems.find(item => item.key === props.value)?.text ?? props.value}
      selectedOptions={[props.value]}
      onOptionSelect={(event, data) => {
        const key = data.optionValue ?? '';
        props.onChange(key);
      }}
      style={{minWidth: 0}}
    >
      {props.selectItems.map((item) => <Option key={item.key} value={item.key}>{item.text}</Option>)}
    </Dropdown>
  );
}

function GameConfigEditorWithFileChoose(props: IGameConfigEditor & {
  sourceBase: string,
  extNameList: string[]
}) {
  const t = useTrans("common.");
  const showEditBox = useValue(false);
  const inputBoxRef = useRef<HTMLInputElement>(null);
  return <div className={styles.textEditArea}>
    {!showEditBox.value && props.value}
    {!showEditBox.value && <span className={styles.editButton} onClick={() => {
      showEditBox.set(true);
      setTimeout(() => inputBoxRef.current?.focus(), 100);
    }}><Write theme="outline" size="16" fill="#005CAF" strokeWidth={3}/></span>}
    {showEditBox.value && <ChooseFile sourceBase={props.sourceBase}
      onChange={(file) => {
        if (file) {
          props.onChange(file.name);
          showEditBox.set(false);
        } else {
          showEditBox.set(false);
        }
      }}
      extName={props.extNameList}/>}
  </div>;
}

function GameConfigEditorWithImageFileChoose(props: IGameConfigEditorMulti & {
  sourceBase: string,
  extNameList: string[]
}) {
  const t = useTrans("common.");
  const showEditBox = useValue(false);
  const inputBoxRef = useRef<HTMLInputElement>(null);
  const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  const images = props.value;

  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);

  const addImage = (imageName: string) => {
    const newImages = [...images, imageName];
    // setImages(newImages);
    props.onChange(newImages);
  };

  const removeImage = (imageName: string) => {
    const newImages = images.filter((image) => image !== imageName);
    // setImages(newImages);
    props.onChange(newImages);
  };

  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      {/* {props.value.join(' | ')} */}
      <div style={{display: 'flex'}}>
        {images.map((imageName, index) => (
          <div key={index} className={styles.imageChooseItem}>
            <img className={styles.imageChooseItemImage} src={`games/${gameName}/game/${props.sourceBase}/${imageName}`}
              alt={`logo-${index}`}/>
            {/* <div className={styles.imageChooseItemText}>{imageName}</div> */}
            <Button
              appearance="subtle"
              icon={<DismissIcon />}
              onClick={() => removeImage(imageName)}
            />
          </div>
        ))}</div>
      {!showEditBox.value && <div onClick={() => {
        showEditBox.set(true);
        eventBus.emit('scrollTopbarToEnd');
        setTimeout(() => inputBoxRef.current?.focus(), 100);
      }}
      className={styles.addIcon}
      ><Plus theme="outline" size="20" fill="#005CAF" strokeWidth={3}/></div>}
      {showEditBox.value && <ChooseFile sourceBase={props.sourceBase}
        onChange={(file) => {
          if (file) {
            addImage(file.name);
            showEditBox.set(false);
            eventBus.emit('scrollTopbarToEnd');
          } else {
            showEditBox.set(false);
          }
        }}
        extName={props.extNameList}/>}
    </div>
  );
}
