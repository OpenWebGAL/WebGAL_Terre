import styles from "../sidebarTags.module.scss";
import { useValue } from "../../../../../hooks/useValue";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/origineStore";
import { useEffect, useRef } from "react";
import { cloneDeep } from "lodash";
import { ITextField, TextField } from "@fluentui/react";
import ChooseFile from "../../../ChooseFile/ChooseFile";
import useTrans from "@/hooks/useTrans";
import TagTitleWrapper from "@/components/TagTitleWrapper/TagTitleWrapper";
import {WebgalConfig} from "webgal-parser/build/es/configParser/configParser";
import {WebgalParser} from "@/pages/editor/GraphicalEditor/parser";


export default function GameConfig() {
  const t = useTrans("editor.sideBar.gameConfigs.");
  const state = useSelector((state: RootState) => state.status.editor);

  // 拿到游戏配置
  const gameConfig = useValue<WebgalConfig>([]);
  //console.log(gameConfig);
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

  function getConfigContentAsString(key:string){
    return gameConfig.value.find(e=>e.command === key)?.args?.join('')??'';
  }

  function getConfigContentAsStringArray(key:string){
    return gameConfig.value.find(e=>e.command === key)?.args??[];
  }

  function updateGameConfigSimpleByKey(key:string,value:string){
    const newConfig = cloneDeep(gameConfig.value);
    const index = newConfig.findIndex(e=>e.command === key);
    if(index>=0){
      newConfig[index].args = [value];
    }else{
      newConfig.push({command:key,args:[value],options:[]});
    }
    gameConfig.set(newConfig);
    updateGameConfig();
  }

  function parseAndSetGameConfigState(data: string) {
    //console.log(data);
    gameConfig.set(WebgalParser.parseConfig(data));
    if (getConfigContentAsString('Game_key') ==='') {
      // 设置默认识别码
      const randomCode = (Math.random() * 100000).toString(16).replace(".", "d");
      updateGameConfigSimpleByKey("Game_key", randomCode);
    }
  }

  return (
    <div>
      <TagTitleWrapper title={t("title")} />
      <div style={{ paddingLeft: "10px" }}>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.name")}</div>
          <GameConfigEditor key="gameName" value={getConfigContentAsString('Game_name')}
            onChange={(e: string) => updateGameConfigSimpleByKey("Game_name", e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.id")}</div>
          <GameConfigEditor key="gameKey" value={getConfigContentAsString('Game_key')}
            onChange={(e: string) => updateGameConfigSimpleByKey('Game_key', e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.packageName")}</div>
          <GameConfigEditor key="packageName" value={getConfigContentAsString('Package_name')}
            onChange={(e: string) => updateGameConfigSimpleByKey('Package_name', e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.bg")}</div>
          <GameConfigEditorWithFileChoose
            sourceBase="background"
            extNameList={[".jpg", ".png", ".webp"]}
            key="titleBackground"
            value={getConfigContentAsString('Title_img')}
            onChange={(e: string) => updateGameConfigSimpleByKey('Title_img', e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.bgm")}</div>
          <GameConfigEditorWithFileChoose
            extNameList={[".mp3", ".ogg", ".wav"]}
            sourceBase="bgm" key="titleBgm"
            value={getConfigContentAsString('Title_bgm')}
            onChange={(e: string) => updateGameConfigSimpleByKey('Title_bgm', e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>ChatGPT APIKey</div>
          <GameConfigEditor key="apiKey" value={getConfigContentAsString('Api_Key')}
            onChange={(e: string) => updateGameConfigSimpleByKey('Api_Key', e)} />
        </div>
      </div>
    </div>
  );
}

interface IGameConfigEditor {
  key: string;
  value: string;
  onChange: Function;
}

function GameConfigEditor(props: IGameConfigEditor) {
  const t = useTrans("common.");
  const showEditBox = useValue(false);
  const inputBoxRef = useRef<ITextField>(null);

  return <div>
    {!showEditBox.value && props.value}
    {!showEditBox.value && <div className={styles.editButton} onClick={() => {
      showEditBox.set(true);
      setTimeout(() => inputBoxRef.current?.focus(), 100);
    }}>{t("revise")}</div>}
    {showEditBox.value && <TextField componentRef={inputBoxRef} defaultValue={props.value}
      onBlur={() => {
        props.onChange(inputBoxRef!.current!.value);
        showEditBox.set(false);
      }}
    />}
  </div>;
}

function GameConfigEditorWithFileChoose(props: IGameConfigEditor & { sourceBase: string, extNameList: string[] }) {
  const t = useTrans("common.");
  const showEditBox = useValue(false);
  const inputBoxRef = useRef<ITextField>(null);
  return <div>
    {!showEditBox.value && props.value}
    {!showEditBox.value && <div className={styles.editButton} onClick={() => {
      showEditBox.set(true);
      setTimeout(() => inputBoxRef.current?.focus(), 100);
    }}>{t("revise")}</div>}
    {showEditBox.value && <ChooseFile sourceBase={props.sourceBase}
      onChange={(file) => {
        if (file) {
          props.onChange(file.name);
          showEditBox.set(false);
        } else {
          showEditBox.set(false);
        }
      }}
      extName={props.extNameList} />}
  </div>;
}
