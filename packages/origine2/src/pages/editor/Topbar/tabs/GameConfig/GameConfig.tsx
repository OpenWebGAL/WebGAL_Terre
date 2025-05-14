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
import {eventBus} from "@/utils/eventBus";
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

const IconsIcon = bundleIcon(IconsFilled, IconsRegular);
const AddIcon = bundleIcon(AddFilled, AddRegular);

export default function GameConfig() {
  const gameDir = useEditorStore.use.subPage();

  // 拿到游戏配置
  const gameConfig = useValue<WebgalConfig>([]);
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
    const newConfig = WebgalParser.stringifyConfig(gameConfig.value);
    api.manageGameControllerSetGameConfig({gameName: gameDir, newConfig}).then(getGameConfig);
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
      <TabItem title={t`游戏名称`}>
        <GameConfigEditor key="gameName" value={getConfigContentAsString('Game_name')}
          onChange={(e: string) => updateGameConfigSimpleByKey("Game_name", e)}/>
      </TabItem>
      <TabItem title={t`游戏识别码`}>
        <GameConfigEditor key="gameKey" value={getConfigContentAsString('Game_key')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Game_key', e)}/>
      </TabItem>
      <TabItem title={t`游戏简介`}>
        <GameConfigEditor key="gameDescription" value={getConfigContentAsString('Description')}
          onChange={(e: string) => updateGameConfigSimpleByKey("Description", e)}/>
      </TabItem>
      <TabItem title={t`游戏包名`}>
        <GameConfigEditor key="packageName" value={getConfigContentAsString('Package_name')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Package_name', e)}/>
      </TabItem>
      {/* <TabItem title={t`文本框主题`}> */}
      {/*  <GameConfigEditorWithSelector key="packageName" value={getConfigContentAsString('Textbox_theme')} */}
      {/*    onChange={(e: string) => updateGameConfigSimpleByKey('Textbox_theme', e)} */}
      {/*    selectItems={textboxThemes}/> */}
      {/* </TabItem> */}
      <TabItem title={t`标题背景图片`}>
        <GameConfigEditorWithFileChoose
          sourceBase="background"
          extNameList={extNameMap.get('background') ?? []}
          key="titleBackground"
          value={getConfigContentAsString('Title_img')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Title_img', e)}/>
      </TabItem>
      <TabItem title={t`标题背景音乐`}>
        <div className={styles.sidebar_gameconfig_title}>{}</div>
        <GameConfigEditorWithFileChoose
          extNameList={extNameMap.get('bgm') ?? []}
          sourceBase="bgm" key="titleBgm"
          value={getConfigContentAsString('Title_bgm')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Title_bgm', e)}/>
      </TabItem>
      <TabItem title={t`启动图`}>
        <GameConfigEditorWithImageFileChoose
          sourceBase="background"
          extNameList={extNameMap.get('background') ?? []}
          key="logoImage"
          value={getConfigContentAsStringArray('Game_Logo')}
          onChange={(e: string[]) => updateGameConfigArrayByKey('Game_Logo', e)}/>
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
          value={getConfigContentAsString('Show_panic') ? getConfigContentAsString('Show_panic') : 'true'}
          selectItems={[
            {key: 'true', text: t`启用`},
            {key: 'false', text: t`禁用`}
          ]}
          onChange={(e: string) => updateGameConfigSimpleByKey('Show_panic', e)}/>
      </TabItem>
      <TabItem title={t`鉴赏功能`}>
        <GameConfigEditorWithSelector
          key="isUserForward"
          value={getConfigContentAsString('Enable_Appreciation') ? getConfigContentAsString('Enable_Appreciation') : 'false'}
          selectItems={[
            {key: 'true', text: t`启用`},
            {key: 'false', text: t`禁用`}
          ]}
          onChange={(e: string) => updateGameConfigSimpleByKey('Enable_Appreciation', e)}/>
      </TabItem>
      <TabItem title={t`默认语言`}>
        <GameConfigEditorWithSelector
          key="language_select"
          value={getConfigContentAsString('Default_Language') ? getConfigContentAsString('Default_Language') : ''}
          selectItems={[
            {key: '', text: t`不设定`},
            {key: 'zh_CN', text: t`简体中文`},
            {key: 'zh_TW', text: t`繁体中文`},
            {key: 'en', text: t`英语`},
            {key: 'ja', text: t`日语`},
            {key: 'fr', text: t`法语`},
            {key: 'de', text: t`德语`},
          ]}
          onChange={(e: string) => updateGameConfigSimpleByKey('Default_Language', e)}/>
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
  const inputBoxRef = useRef<HTMLInputElement>(null);
  return <div className={styles.textEditArea}>
    {props.value}
    <ChooseFile
      basePath={[props.sourceBase]}
      button={
        <span className={styles.editButton}>
          <Write theme="outline" size="16" fill="#005CAF" strokeWidth={3}/>
        </span>
      }
      selectedFileName={props.value}
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
        basePath={[props.sourceBase]}
        button={<Button icon={<AddIcon/>} />}
        onChange={(file) => {
          if (file) {
            addImage(file.name);
            // eventBus.emit('scrollTopbarToEnd');
          }
        }}
        extNames={props.extNameList}/>
    </div>
  );
}
