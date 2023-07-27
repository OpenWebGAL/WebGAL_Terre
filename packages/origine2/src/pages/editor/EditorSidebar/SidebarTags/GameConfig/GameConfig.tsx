import styles from "../sidebarTags.module.scss";
import { useValue } from "../../../../../hooks/useValue";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/origineStore";
import { useState, useEffect, useRef } from "react";
import { cloneDeep } from "lodash";
import { IconButton, ITextField, TextField } from "@fluentui/react";
import ChooseFile from "../../../ChooseFile/ChooseFile";
import useTrans from "@/hooks/useTrans";
import TagTitleWrapper from "@/components/TagTitleWrapper/TagTitleWrapper";

interface IGameConfig {
  gameName: string;
  titleBgm: string;
  titleBackground: string;
  logoImage: string[];
  gameKey: string;
  packageName: string;
}

export default function GameConfig() {
  const t = useTrans("editor.sideBar.gameConfigs.");
  const state = useSelector((state: RootState) => state.status.editor);

  // 拿到游戏配置
  const gameConfig = useValue<IGameConfig>({
    gameName: "",
    titleBgm: "",
    titleBackground: "",
    logoImage: [],
    gameKey: "",
    packageName: ""
  });
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
      const i = commandText.indexOf(":");
      return [commandText.slice(0, i), commandText.slice(i + 1)];
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
      case "LogoImage":
        const logoImages = e[1].split(' ');
        gameConfig.set({ ...gameConfig.value, logoImage: logoImages });
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

  function updateGameConfig<K extends keyof IGameConfig>(key: K, content: IGameConfig[K]) {
    const draft = cloneDeep(gameConfig.value);
    draft[key] = content;
    gameConfig.set(draft);
    const newConfig = `Game_name:${gameConfig.value.gameName};\nGame_key:${gameConfig.value.gameKey};\nPackage_name:${gameConfig.value.packageName};\nTitle_bgm:${gameConfig.value.titleBgm};\nTitle_img:${gameConfig.value.titleBackground};\nLogoImage:${gameConfig.value.logoImage.join(' ')};\n`;
    const form = new URLSearchParams();
    form.append("gameName", state.currentEditingGame);
    form.append("newConfig", newConfig);
    axios.post(`/api/manageGame/setGameConfig/`, form).then(getGameConfig);
  }


  return (
    <div>
      <TagTitleWrapper title={t("title")} />
      <div style={{ paddingLeft: "10px" }}>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.name")}</div>
          <GameConfigEditor key="gameName" value={gameConfig.value.gameName}
            onChange={(e: string) => updateGameConfig("gameName", e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.id")}</div>
          <GameConfigEditor key="gameKey" value={gameConfig.value.gameKey}
            onChange={(e: string) => updateGameConfig("gameKey", e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.packageName")}</div>
          <GameConfigEditor key="packageName" value={gameConfig.value.packageName}
            onChange={(e: string) => updateGameConfig("packageName", e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.bg")}</div>
          <GameConfigEditorWithFileChoose
            sourceBase="background"
            extNameList={[".jpg", ".png", ".webp"]}
            key="titleBackground"
            value={gameConfig.value.titleBackground}
            onChange={(e: string) => updateGameConfig("titleBackground", e)} />
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.logoImage")}</div>
            <GameConfigEditorWithImageFileChoose
              sourceBase="background"
              extNameList={[".jpg", ".png", ".webp"]}
              key="logoImage"
              value={gameConfig.value.logoImage}
              onChange={(e: string[]) => updateGameConfig("logoImage", e)} />
          </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>{t("options.bgm")}</div>
          <GameConfigEditorWithFileChoose
            extNameList={[".mp3", ".ogg", ".wav"]}
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

interface IGameConfigEditorMulti {
  key: keyof IGameConfig;
  value: string[];
  onChange: (value: string[]) => void;
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

function GameConfigEditorWithImageFileChoose(props: IGameConfigEditorMulti & { sourceBase: string, extNameList: string[] }) {
  const t = useTrans("common.");
  const showEditBox = useValue(false);
  const inputBoxRef = useRef<ITextField>(null);
  
  const [images, setImages] = useState<string[]>(props.value);

  const addImage = (imageName: string) => {
    const newImages = [...images, imageName];
    setImages(newImages);
    props.onChange(newImages);
  };

  const removeImage = (imageName: string) => {
    const newImages = images.filter((image) => image !== imageName);
    setImages(newImages);
    props.onChange(newImages);
  };

  return (
    <div>
      {!showEditBox.value && props.value.join(' ')}
      {!showEditBox.value && <div>{images.map((imageName, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            style={{ marginRight: '10px' }}
            onClick={() => removeImage(imageName)}
          />
          <span>{imageName}</span>
        </div>
      ))}</div>}
      {!showEditBox.value && <div className={styles.editButton} onClick={() => {
        showEditBox.set(true);
        setTimeout(() => inputBoxRef.current?.focus(), 100);
      }}>{t("revise")}</div>}
      {showEditBox.value && <ChooseFile sourceBase={props.sourceBase}
        onChange={(file) => {
          if (file) {
            addImage(file.name);
            showEditBox.set(false);
          } else {
            showEditBox.set(false);
          }
        }}
        extName={props.extNameList} />}
    </div>
  );
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
