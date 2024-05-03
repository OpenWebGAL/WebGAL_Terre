import GameElement from "./GameElement";
import styles from "./sidebar.module.scss";
import {useState} from "react";
import {GameInfo} from "./DashBoard";
import {
  Button, Dropdown,
  Input,
  Option,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Select,
  Subtitle1
} from "@fluentui/react-components";
import {AddFilled, AddRegular, ArrowSyncFilled, ArrowSyncRegular, bundleIcon} from "@fluentui/react-icons";
import {t} from "@lingui/macro";
import useSWR from "swr";
import {api} from "@/api";

interface ISidebarProps {
  gameList: GameInfo[];
  currentSetGame: string | null;
  setCurrentGame: (currentGame: string) => void;
  createGame: (name: string, derivative?: string, templateName?: string) => void;
  refreash?: () => void;
}

const AddIcon = bundleIcon(AddFilled, AddRegular);
const ArrowSyncIcon = bundleIcon(ArrowSyncFilled, ArrowSyncRegular);

export default function Sidebar(props: ISidebarProps) {

  const [createGameFormOpen, setCreateGameFormOpen] = useState(false);
  const [newGameName, setNewGameName] = useState(t`新的游戏`);
  const [derivative, setDerivative] = useState<string | undefined>('__STANDARD__WG__');
  const [templateName, setTemplateName] = useState<string | undefined>('__STANDARD__WG__');

  // 可用的衍生版
  const derivativeEnginesResp = useSWR('derivativeEngines', async () => {
    const resp = await api.manageGameControllerGetDerivativeEngines();
    return resp.data as unknown as string[];
  });

  const templatesResp = useSWR('template-list-selector', async () => {
    const resp = await api.manageTemplateControllerGetTemplateList();
    return resp.data as unknown as { name: string }[];
  });


  const selector = <Dropdown value={derivative === '__STANDARD__WG__' ? t`WebGAL Standard` : derivative}
    selectedOptions={[derivative ?? '__STANDARD__WG__']} onOptionSelect={(_, elem) => {
      setDerivative(elem.optionValue);
    }}>
    <Option key="__standard" value="__STANDARD__WG__">{t`WebGAL Standard`}</Option>
    {(derivativeEnginesResp.data ?? []).map(e =>
      <Option key={e} value={e}>{e}</Option>
    )}
  </Dropdown>;

  const selectorTemplate = <Dropdown value={templateName === '__STANDARD__WG__' ? t`WebGAL Classic` : templateName}
    selectedOptions={[templateName ?? '__STANDARD__WG__']}
    onOptionSelect={(_, elem) => {
      setTemplateName(elem.optionValue);
    }}>
    <Option key="__standard" value="__STANDARD__WG__">{t`WebGAL Classic`}</Option>
    {(templatesResp.data ?? []).map(e =>
      <Option key={e.name} value={e.name}>{e.name}</Option>
    )}
  </Dropdown>;

  function createNewGame() {
    if (newGameName && newGameName.trim() !== '' && !props.gameList.find((item) => item.dir === newGameName.trim())) {
      props.createGame(newGameName, derivative === '__STANDARD__WG__' ? undefined : derivative, templateName === '__STANDARD__WG__' ? undefined : templateName);
      setCreateGameFormOpen(false);
      setNewGameName(t`新的游戏`);
    }
  }

  return <div className={`${styles.sidebar_main} ${!props.currentSetGame ? styles.sidebar_main_fullwidth : ""}`}>
    <div className={styles.sidebar_top}>
      <span className={styles.sidebar_top_title}>{t`游戏列表`}</span>
      <div className={styles.sidebar_top_buttons}>
        <Popover
          withArrow
          trapFocus
          open={createGameFormOpen}
          onOpenChange={() => setCreateGameFormOpen(!createGameFormOpen)}
        >
          <PopoverTrigger>
            <Button appearance='primary' icon={<AddIcon/>}>{t`新建游戏`}</Button>
          </PopoverTrigger>
          <PopoverSurface>
            <form style={{display: "flex", flexDirection: "column", gap: '16px'}}>
              <Subtitle1>{t`创建新游戏`}</Subtitle1>
              <Input
                value={newGameName}
                onChange={(event) => setNewGameName(event.target.value)}
                onKeyDown={(event) => (event.key === 'Enter') && createNewGame()}
                defaultValue={t`新的游戏`}
                placeholder={t`新游戏名`}/>
              选择游戏引擎版本
              {selector}
              选择应用的模板
              {selectorTemplate}
              <Button appearance='primary' disabled={newGameName.trim() === ''}
                onClick={createNewGame}>{t`创建`}</Button>
            </form>
          </PopoverSurface>
        </Popover>
        <Button appearance='secondary' onClick={props.refreash} icon={<ArrowSyncIcon/>}/>
      </div>
    </div>
    <div className={styles.game_list}>
      {
        props.gameList.map(e => {
          const checked = props.currentSetGame === e.dir;
          return <GameElement
            onClick={() => props.setCurrentGame(e.dir)}
            refreash={props.refreash}
            gameInfo={e}
            key={e.dir}
            checked={checked}
          />;
        })
      }
    </div>
  </div>;
}
