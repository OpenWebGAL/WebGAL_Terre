import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import useTrans from "@/hooks/useTrans";
import s from './viewTab.module.scss';
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import {eventBus} from "@/utils/eventBus";
import {useTranslation} from "react-i18next";
import {
  ArrowClockwise24Filled,
  ArrowClockwise24Regular,
  bundleIcon,
  Open24Filled,
  Open24Regular,
  PanelLeft24Filled,
  PanelLeft24Regular,
  PanelLeftContract24Filled,
  PanelLeftContract24Regular,
} from "@fluentui/react-icons";
import useEditorStore from "@/store/useEditorStore";
import { useGameEditorContext } from "@/store/useGameEditorStore";

const PanelLeftIcon = bundleIcon(PanelLeft24Filled, PanelLeft24Regular);
const PanelLeftContractIcon = bundleIcon(PanelLeftContract24Filled, PanelLeftContract24Regular);
const ArrowClockwiseIcon = bundleIcon(ArrowClockwise24Filled, ArrowClockwise24Regular);
const OpenIcon = bundleIcon(Open24Filled, Open24Regular);

export function ViewTab() {
  const subPage = useEditorStore.use.subPage();
  const currentEditGame = subPage;
  const {t} = useTranslation();
  
  const isShowSidebar = useGameEditorContext((state) => state.isShowSidebar);
  const updateIsShowSidebar = useGameEditorContext((state) => state.updateIsShowSidebar);

  return <TopbarTab>
    <TabItem title={t("侧边栏")}>
      <IconWithTextItem
        onClick={() => {
          updateIsShowSidebar(!isShowSidebar);
        }}
        icon={isShowSidebar ? <PanelLeftIcon className={s.iconColor}/> : <PanelLeftContractIcon className={s.iconColor}/>}
        text={isShowSidebar ? t('显示侧边栏') : t('隐藏侧边栏')}
      />
    </TabItem>
    <TabItem title={t("侧边栏游戏预览")}>
      <IconWithTextItem
        onClick={() => {
          eventBus.emit('refGame');
        }}
        icon={<ArrowClockwiseIcon className={s.iconColor}/>}
        text={t("刷新游戏")}
      />
      <IconWithTextItem
        onClick={() => {
          window.open(`/games/${currentEditGame}`, "_blank");
        }}
        icon={<OpenIcon className={s.iconColor}/>}
        text={t("新标签页预览")}
      />
    </TabItem>
  </TopbarTab>;
}
