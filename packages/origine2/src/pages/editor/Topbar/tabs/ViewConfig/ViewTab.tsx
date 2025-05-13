import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import s from './viewTab.module.scss';
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import {eventBus} from "@/utils/eventBus";
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
  TextEffectsFilled,
  TextEffectsRegular,
} from "@fluentui/react-icons";
import useEditorStore from "@/store/useEditorStore";
import { useGameEditorContext } from "@/store/useGameEditorStore";
import { t } from "@lingui/macro";
import { Tooltip } from "@fluentui/react-components";

const PanelLeftIcon = bundleIcon(PanelLeft24Filled, PanelLeft24Regular);
const PanelLeftContractIcon = bundleIcon(PanelLeftContract24Filled, PanelLeftContract24Regular);
const ArrowClockwiseIcon = bundleIcon(ArrowClockwise24Filled, ArrowClockwise24Regular);
const OpenIcon = bundleIcon(Open24Filled, Open24Regular);

export function ViewTab() {
  const subPage = useEditorStore.use.subPage();
  const currentEditGame = subPage;

  const isShowSidebar = useGameEditorContext((state) => state.isShowSidebar);
  const updateIsShowSidebar = useGameEditorContext((state) => state.updateIsShowSidebar);
  const isUseFontOptimization = useEditorStore.use.isUseFontOptimization();
  const updateIsUseFontOptimization = useEditorStore.use.updateIsUseFontOptimization();

  return <TopbarTab>
    <TabItem title={t`侧边栏`}>
      <IconWithTextItem
        onClick={() => {
          updateIsShowSidebar(!isShowSidebar);
        }}
        icon={isShowSidebar ? <PanelLeftIcon className={s.iconColor}/> : <PanelLeftContractIcon className={s.iconColor}/>}
        text={isShowSidebar ? t`显示侧边栏` : t`隐藏侧边栏`}
      />
    </TabItem>
    <TabItem title={t`侧边栏游戏预览`}>
      <IconWithTextItem
        onClick={() => {
          eventBus.emit('refGame');
        }}
        icon={<ArrowClockwiseIcon className={s.iconColor}/>}
        text={t`刷新游戏`}
      />
      <IconWithTextItem
        onClick={() => {
          window.open(`/games/${currentEditGame}`, "_blank");
        }}
        icon={<OpenIcon className={s.iconColor}/>}
        text={t`新标签页预览`}
      />
    </TabItem>
    <TabItem title={t`字体优化`}>
      <Tooltip
        content={<div
          className={s.previewTips}
        >
          {t`字体优化将在游戏预览窗口低于特定尺寸时，关闭对话文本字体描边，以提升可读性。`}
          <br />
          {t`如果使用了自定义模板导致预览效果异常，请关闭此选项。`}
        </div>}
        relationship="description"
        showDelay={0}
        hideDelay={0}
      >
        <div>
          <IconWithTextItem
            onClick={() => updateIsUseFontOptimization(!isUseFontOptimization)}
            icon={isUseFontOptimization ? <TextEffectsRegular className={s.iconColor} /> : <TextEffectsFilled className={s.iconColor} />}
            text={isUseFontOptimization ? t`启用` : t`关闭`}
          />
        </div>
      </Tooltip>
    </TabItem>
  </TopbarTab>;
}
