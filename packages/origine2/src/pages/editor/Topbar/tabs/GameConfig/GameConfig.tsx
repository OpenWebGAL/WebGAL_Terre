import styles from "../topbarTabs.module.scss";
import {useValue} from "../../../../../hooks/useValue";
import {useEffect, useRef, useState} from "react";
import {cloneDeep} from "lodash";
import ChooseFile from "../../../ChooseFile/ChooseFile";
import TagTitleWrapper from "@/components/TagTitleWrapper/TagTitleWrapper";
import {WebgalConfig} from "webgal-parser/build/es/configParser/configParser";
import {WebgalParser} from "@/pages/editor/GraphicalEditor/parser";
import {logger} from "@/utils/logger";
import {textboxThemes} from "./constants";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {Add, Plus, Write} from "@icon-park/react";
import {Button, Dropdown, Input, Option} from "@fluentui/react-components";
import {AddFilled, AddRegular, Dismiss24Filled, Dismiss24Regular, IconsFilled, IconsRegular, bundleIcon} from "@fluentui/react-icons";
import useEditorStore from "@/store/useEditorStore";
import {api} from "@/api";
import {t, Trans} from "@lingui/macro";
import useSWR from "swr";
import axios from "axios";
import {WsUtil} from "@/utils/wsUtil";
import { TemplateConfigDto, TemplateInfoDto } from "@/api/Api";
import { IconWithTextItem } from "../../components/IconWithTextItem";
import IconCreator from "@/components/IconCreator/IconCreator";
import { extNameMap } from "@/pages/editor/ChooseFile/chooseFileConfig";
import { IWebgalConfig } from "@/types/gameConfig";

const IconsIcon = bundleIcon(IconsFilled, IconsRegular);
const AddIcon = bundleIcon(AddFilled, AddRegular);

export default function GameConfig() {
  const gameDir = useEditorStore.use.subPage();

  // 拿到游戏配置
  const gameConfig = useValue<IWebgalConfig>({});
  console.log(gameConfig);
  const getGameConfig = () => {
    api.manageGameControllerGetGameConfig(gameDir)
      .then((r: any) => parseAndSetGameConfigState(r.data));
  };

  useEffect(() => {
    getGameConfig();
  }, []);

  const { data: templateList } = useSWR('template-list', async () => (await api.manageTemplateControllerGetTemplateList()).data);

  const currentTemplateResp = useSWR(`game-${gameDir}-template-config`, async () => {
    const resp = await axios.get(`/games/${gameDir}/game/template/template.json`);
    return resp.data as TemplateConfigDto;
  });

  const currentTemplateName = currentTemplateResp.data?.name ?? '';

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfoDto | null>(null);

  useEffect(() => {
    if (templateList && currentTemplateResp.data && currentTemplateResp.data.id) {
      const selectedTemplate = templateList.find(template => template.id === currentTemplateResp.data?.id);
      selectedTemplate && setSelectedTemplate(selectedTemplate);
    }
  }, [templateList, currentTemplateResp.data]);

  async function applyNewTemplate() {
    if (selectedTemplate) {
      await api.manageTemplateControllerApplyTemplateToGame({gameDir, templateDir: selectedTemplate.dir});
      // 更新模板后，让游戏再去拉一次模板的样式文件
      WsUtil.sendTemplateRefetchCommand();
      await currentTemplateResp.mutate();
    }
  }

  function updateGameConfig() {
    const newConfig = JSON.stringify(gameConfig.value, null, 2);
    api.manageGameControllerSetGameConfig({gameName: gameDir, newConfig}).then(getGameConfig);
  }

  function parseAndSetGameConfigState(data: IWebgalConfig) {
    console.log(data);
    gameConfig.set(data);
    if (gameConfig.value.gameKey === undefined || gameConfig.value.gameKey === '') {
      // 设置默认识别码
      const randomCode = (Math.random() * 100000).toString(16).replace(".", "d");
      gameConfig.value.gameKey = randomCode;
    }
  }

  return (
    <>
      <TabItem title={t`游戏名称`}>
        <GameConfigEditor key="gameName" value={gameConfig.value.gameName ?? ""}
          onChange={(e: string) => {
            gameConfig.value.gameName = e === "" ? undefined : e;
            updateGameConfig();
          }}
        />
      </TabItem>
      <TabItem title={t`游戏识别码`}>
        <GameConfigEditor key="gameKey" value={gameConfig.value.gameKey ?? ""}
          onChange={(e: string) => {
            gameConfig.value.gameKey = e === "" ? undefined : e;
            updateGameConfig();
          }}
        />
      </TabItem>
      <TabItem title={t`游戏简介`}>
        <GameConfigEditor key="gameDescription" value={gameConfig.value.description ?? ""}
          onChange={(e: string) => {
            gameConfig.value.description = e === "" ? undefined : e;
            updateGameConfig();
          }}
        />
      </TabItem>
      <TabItem title={t`游戏包名`}>
        <GameConfigEditor key="packageName" value={gameConfig.value.packageName ?? ""}
          onChange={(e: string) => {
            gameConfig.value.packageName = e === "" ? undefined : e;
            updateGameConfig();
          }}
        />
      </TabItem>
      <TabItem title={t`Steam AppID`}>
        <GameConfigEditor key="steamAppId" value={gameConfig.value.steamAppId ?? ""}
          onChange={(e: string) => {
            gameConfig.value.steamAppId = e === "" ? undefined : e;
            updateGameConfig();
          }}
        />
      </TabItem>
      {/* <TabItem title={t`文本框主题`}> */}
      {/*  <GameConfigEditorWithSelector key="packageName" value={getConfigContentAsString('Textbox_theme')} */}
      {/*    onChange={(e: string) => updateGameConfigSimpleByKey('Textbox_theme', e)} */}
      {/*    selectItems={textboxThemes}/> */}
      {/* </TabItem> */}
      <TabItem title={t`标题背景图片`}>
        <GameConfigEditorWithFileChoose
          sourceBase="background"
          extNameList={extNameMap.get('image') ?? []}
          key="titleBackground"
          value={gameConfig.value.titleImage ?? ""}
          onChange={(e: string) => {
            gameConfig.value.titleImage = e === "" ? undefined : e;
            updateGameConfig();
          }}
        />
      </TabItem>
      <TabItem title={t`标题背景音乐`}>
        <div className={styles.sidebar_gameconfig_title}>{}</div>
        <GameConfigEditorWithFileChoose
          extNameList={extNameMap.get('audio') ?? []}
          sourceBase="bgm" key="titleBgm"
          value={gameConfig.value.titleBgm ?? ""}
          onChange={(e: string) => {
            gameConfig.value.titleBgm = e === "" ? undefined : e;
            updateGameConfig();
          }}
        />
      </TabItem>
      <TabItem title={t`启动图`}>
        <GameConfigEditorWithImageFileChoose
          sourceBase="background"
          extNameList={extNameMap.get('image') ?? []}
          key="logoImage"
          value={gameConfig.value.gameLogo ?? ""}
          onChange={(e: string) => {
            gameConfig.value.gameLogo = e === "" ? undefined : e;
            updateGameConfig();
          }}
        />
      </TabItem>
      <TabItem title={t`应用的模板`}>
        <div className={styles.applyTemplateWrapper}>
          <Trans>
            <div>
              当前应用的模板：{currentTemplateName}
            </div>
          </Trans>
          <div className={styles.applyTemplateSelectorLine}>
            <Dropdown
              style={{minWidth: 150}}
              value={!selectedTemplate ? '' : selectedTemplate.name}
              selectedOptions={[!selectedTemplate ? '' : selectedTemplate.dir]}
              onOptionSelect={(_, data) => {
                if (data.optionValue){
                  const t = templateList?.find(template => template.dir === data.optionValue);
                  t && setSelectedTemplate(t);
                }
              }}
            >
              {/* 应用模板的接口还不支持应用默认模板 */}
              {/* <Option key="__standard" value="__STANDARD__WG__">{t`WebGAL Classic`}</Option> */}
              {(templateList ?? []).map(template => <Option key={template.name} value={template.dir}>{template.name}</Option>)}
            </Dropdown>
            <Trans>
              <Button onClick={applyNewTemplate}>应用新的模板</Button>
            </Trans>
          </div>
        </div>
      </TabItem>
      <TabItem title={t`游戏图标`}>
        <IconCreator
          gameDir={gameDir}
          triggerButton={
            <IconWithTextItem
              onClick={() => {}}
              icon={<IconsIcon />}
              text={t`修改游戏图标`}
            />
          }
        />
      </TabItem>
      <TabItem title={t`紧急回避`}>
        <GameConfigEditorWithSelector
          key="isUserForward"
          value={gameConfig.value.enablePanic === true ? 'true' : 'false'}
          selectItems={[
            {key: 'true', text: t`启用`},
            {key: 'false', text: t`禁用`}
          ]}
          onChange={(e: string) => {
            gameConfig.value.enablePanic = e === 'true';
            updateGameConfig();
          }}
        />
      </TabItem>
      <TabItem title={t`鉴赏功能`}>
        <GameConfigEditorWithSelector
          key="isUserForward"
          value={gameConfig.value.enableExtra === true ? 'true' : 'false'}
          selectItems={[
            {key: 'true', text: t`启用`},
            {key: 'false', text: t`禁用`}
          ]}
          onChange={(e: string) => {
            gameConfig.value.enableExtra = e === 'true';
            updateGameConfig();
          }}
        />
      </TabItem>
      <TabItem title={t`默认语言`}>
        <GameConfigEditorWithSelector
          key="language_select"
          value={gameConfig.value.defaultLanguage ?? ''}
          selectItems={[
            {key: '', text: t`不设定`},
            {key: 'zh_CN', text: t`简体中文`},
            {key: 'zh_TW', text: t`繁体中文`},
            {key: 'en', text: t`英语`},
            {key: 'ja', text: t`日语`},
            {key: 'fr', text: t`法语`},
            {key: 'de', text: t`德语`},
          ]}
          onChange={(e: string) => {
            gameConfig.value.defaultLanguage = e === '' ? undefined : e;
            updateGameConfig();
          }}
        />
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
  value: string;
  onChange: Function;
}

function GameConfigEditor(props: IGameConfigEditor) {
  const showEditBox = useValue(false);

  return <div className={styles.textEditArea} style={{maxWidth: 200}}>
    {!showEditBox.value && props.value}
    {!showEditBox.value &&
      <span className={styles.editButton} onClick={() => showEditBox.set(true)}>
        <Write theme="outline" size="16" fill="var(--primary)" strokeWidth={3}/>
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
  const inputBoxRef = useRef<HTMLInputElement>(null);
  return <div className={styles.textEditArea}>
    {props.value}
    <ChooseFile
      basePath={[props.sourceBase]}
      button={
        <span className={styles.editButton}>
          <Write theme="outline" size="16" fill="var(--primary)" strokeWidth={3}/>
        </span>
      }
      selectedFilePath={props.value}
      onChange={(file) => {
        if (file) {
          props.onChange(file.name);
        }
      }}
      extNames={props.extNameList}/>
  </div>;
}

function GameConfigEditorWithImageFileChoose(props: IGameConfigEditorMulti & {
  sourceBase: string,
  extNameList: string[]
}) {
  const gameDir = useEditorStore.use.subPage();
  const inputBoxRef = useRef<HTMLInputElement>(null);
  const images = String(props.value ?? '').split('|').map(img => img.trim()).filter(img => img !== '');

  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);

  const addImage = (imageName: string) => {
    const newImages = [...images, imageName];
    // setImages(newImages);
    props.onChange(newImages.join('|'));
  };

  const removeImage = (imageName: string) => {
    const newImages = images.filter((image) => image !== imageName);
    // setImages(newImages);
    props.onChange(newImages.join('|'));
  };

  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      {/* {props.value.join(' | ')} */}
      <div style={{display: 'flex'}}>
        {images.map((imageName, index) => (
          <div key={index} className={styles.imageChooseItem}>
            <img className={styles.imageChooseItemImage} src={`games/${gameDir}/game/${props.sourceBase}/${imageName}`}
              alt={`logo-${index}`}/>
            {/* <div className={styles.imageChooseItemText}>{imageName}</div> */}
            <Button
              appearance="subtle"
              icon={<DismissIcon/>}
              onClick={() => removeImage(imageName)}
            />
          </div>
        ))}</div>
      <ChooseFile
        title={t`选择图片文件`}
        basePath={[props.sourceBase]}
        button={<Button icon={<AddIcon/>} />}
        onChange={(file) => {
          if (file) {
            addImage(file.name);
          }
        }}
        extNames={props.extNameList}/>
    </div>
  );
}
