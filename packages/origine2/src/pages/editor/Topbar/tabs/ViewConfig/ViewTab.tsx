import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import useTrans from "@/hooks/useTrans";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/origineStore";
import {setEnableLivePreview, setShowSidebar} from "@/store/userDataReducer";
import s from './viewTab.module.scss';
import {FontIcon, TooltipDelay, TooltipHost} from "@fluentui/react";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import {eventBus} from "@/utils/eventBus";

export function ViewTab() {

  const tSidebar = useTrans("editor.sideBar.");
  const dispatch = useDispatch();
  const isEnableLivePreview = useSelector((state: RootState) => state.userData.isEnableLivePreview);
  const isShowSidebar = useSelector((state: RootState) => state.userData.isShowSidebar);
  const currentEditGame = useSelector((state: RootState) => state.status.editor.currentEditingGame);

  return <TopbarTab>
    <TabItem title="侧边栏">
      <IconWithTextItem onClick={() => {
        dispatch(setShowSidebar(!isShowSidebar));
      }} icon={<FontIcon iconName={isShowSidebar ? "SidePanel" : "ClosePaneMirrored"} className={s.iconColor}/>}
      text={isShowSidebar ? '显示侧边栏' : '隐藏侧边栏'}/>
    </TabItem>
    <TabItem title="侧边栏游戏预览">
      <IconWithTextItem
        onClick={() => {
          eventBus.emit('refGame');
        }}
        icon={<FontIcon iconName="Refresh" className={s.iconColor}/>}
        text="刷新游戏"
      />
      <TooltipHost
        delay={TooltipDelay.zero}
        content={<div className={s.previewTips}>
          {tSidebar('preview.notice')}
        </div>}
      >
        <IconWithTextItem
          onClick={() => {
            dispatch(setEnableLivePreview(!isEnableLivePreview));
          }}
          icon={<FontIcon iconName={isEnableLivePreview ? "Streaming" : "StreamingOff"} className={s.iconColor}/>}
          text={isEnableLivePreview ? '实时预览' : '实时预览关闭'}
        />
      </TooltipHost>
      <IconWithTextItem
        onClick={() => {
          window.open(`/games/${currentEditGame}`, "_blank");
        }}
        icon={<FontIcon iconName="OpenInNewWindow" className={s.iconColor}/>}
        text="新标签页预览"
      />
    </TabItem>
  </TopbarTab>;
}
