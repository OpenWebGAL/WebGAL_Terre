import styles from "../sidebarTags.module.scss";
import { useValue } from "../../../../../hooks/useValue";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/origineStore";
import { useEffect, useRef } from "react";
import { cloneDeep } from "lodash";
import { ITextField, TextField } from "@fluentui/react";
import ChooseFile from "../../../ChooseFile/ChooseFile";

interface IGameConfig {
  gameName: string;
  titleBgm: string;
  titleBackground: string;
  gameKey: string;
  packageName: string;
}

export default function GameConfig() {
  const state = useSelector((state: RootState) => state.status.editor);

  // 拿到游戏配置
  const gameConfig = useValue<IGameConfig>({ gameName: "", titleBgm: "", titleBackground: "", gameKey: "", packageName: "" });
  const getGameConfig = () => {
    axios
      .get(`/api/manageGame/getGameConfig/${state.currentEditingGame}`)
      .then((r) => parseAndSetGameConfigState(r.data));
  };

  function parseAndSetGameConfigState(data: string) {
    // 开始解析
    // 先拆行，拆行之前把\r 换成 \n
    let newData = data.replace(/\r/g, "\n");
    const dataArray: string[] = newData.split("\n");
    // 对于每一行，，截取分号，找出键值
    let dataWithKeyValue = dataArray.map((e: string) => {
      let commandText = e.replaceAll(/[;；]/g, "");
      return commandText.split(":");
    });
    dataWithKeyValue = dataWithKeyValue.filter((e) => e.length >= 2);
    // 开始修改
    dataWithKeyValue.forEach((e) => {
      switch (e[0]) {
      case "Game_name":
        gameConfig.set({ ...gameConfig.value, gameName: e[1] });
        break;
      case "Title_bgm":
        gameConfig.set({ ...gameConfig.value, titleBgm: e[1] });
        break;
      case "Title_img":
        gameConfig.set({ ...gameConfig.value, titleBackground: e[1] });
        break;
      case "Game_key":
        gameConfig.set({ ...gameConfig.value, gameKey: e[1] });
        break;
      case "Package_name":
        gameConfig.set({ ...gameConfig.value, packageName: e[1] });
        break;
      default:
        console.log("NOT PARSED");
      }
    });
    if (gameConfig.value.gameKey === "") {
      // 设置默认识别码
      const randomCode = (Math.random() * 100000).toString(16).replace(".", "d");
      updateGameConfig("gameKey", randomCode);
    }
  }

  useEffect(() => {
    getGameConfig();
  }, []);

  function updateGameConfig(key: keyof IGameConfig, content: string) {
    const draft = cloneDeep(gameConfig.value);
    draft[key] = content;
    gameConfig.set(draft);
    const newConfig = `Game_name:${gameConfig.value.gameName};\nGame_key:${gameConfig.value.gameKey};\nPackage_name:${gameConfig.value.packageName};\nTitle_bgm:${gameConfig.value.titleBgm};\nTitle_img:${gameConfig.value.titleBackground};\n`;
    const form = new URLSearchParams();
    form.append("gameName", state.currentEditingGame);
    form.append("newConfig", newConfig);
    axios.post(`/api/manageGame/setGameConfig/`, form).then(getGameConfig);
  }


  return (
    <div>
      <div className={styles.sidebar_tag_title}>游戏配置</div>
      <div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>游戏名称</div>
          <GameConfigEditor key="gameName" value={gameConfig.value.gameName}
            onChange={(e: string) => updateGameConfig("gameName", e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>游戏识别码</div>
          <GameConfigEditor key="gameKey" value={gameConfig.value.gameKey}
            onChange={(e: string) => updateGameConfig("gameKey", e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>游戏包名</div>
          <GameConfigEditor key="packageName" value={gameConfig.value.packageName}
            onChange={(e: string) => updateGameConfig("packageName", e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>标题背景图片</div>
          <GameConfigEditorWithFileChoose
            sourceBase="background"
            extNameList={['.jpg','.png','.webp']}
            key="titleBackground"
            value={gameConfig.value.titleBackground}
            onChange={(e: string) => updateGameConfig("titleBackground", e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>标题背景音乐</div>
          <GameConfigEditorWithFileChoose
            extNameList={['.mp3','.ogg','.wav']}
            sourceBase="bgm" key="titleBgm"
            value={gameConfig.value.titleBgm}
            onChange={(e: string) => updateGameConfig("titleBgm", e)} />
        </div>
      </div>
    </div>
  );
}

interface IGameConfigEditor {
  key: keyof IGameConfig;
  value: string;
  onChange: Function;
}

function GameConfigEditor(props: IGameConfigEditor) {
  const showEditBox = useValue(false);
  const inputBoxRef = useRef<ITextField>(null);
  return <div>
    {!showEditBox.value && props.value}
    {!showEditBox.value && <div className={styles.editButton} onClick={() => {
      showEditBox.set(true);
      setTimeout(() => inputBoxRef.current?.focus(), 100);
    }}>修改</div>}
    {showEditBox.value && <TextField componentRef={inputBoxRef} defaultValue={props.value}
      onBlur={() => {
        props.onChange(inputBoxRef!.current!.value);
        showEditBox.set(false);
      }}
    />}
  </div>;
}

function GameConfigEditorWithFileChoose(props: IGameConfigEditor & {sourceBase:string,extNameList:string[]}) {
  const showEditBox = useValue(false);
  const inputBoxRef = useRef<ITextField>(null);
  return <div>
    {!showEditBox.value && props.value}
    {!showEditBox.value && <div className={styles.editButton} onClick={() => {
      showEditBox.set(true);
      setTimeout(() => inputBoxRef.current?.focus(), 100);
    }}>修改</div>}
    {showEditBox.value && <ChooseFile sourceBase={props.sourceBase}
      onChange={(file)=>{
        if(file){
          props.onChange(file.name);
          showEditBox.set(false);
        }else{
          showEditBox.set(false);
        }
      }}
      extName={props.extNameList}/>}
  </div>;
}
