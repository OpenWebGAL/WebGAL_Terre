import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import TerreToggle from "@/components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/origineStore";
import {setEnableLivePreview, setShowSidebar} from "@/store/userDataReducer";
import s from './viewTab.module.scss';
import { TooltipHost } from "@fluentui/react";

export function ViewTab(){

  const tSidebar = useTrans("editor.sideBar.");
  const dispatch = useDispatch();
  const isEnableLivePreview = useSelector((state:RootState)=>state.userData.isEnableLivePreview);
  const isShowSidebar = useSelector((state:RootState)=>state.userData.isShowSidebar);

  return <TopbarTab>
    <TabItem title="侧边栏">
      <TerreToggle title="显示侧边栏" isChecked={isShowSidebar} onChange={(v) => {
        dispatch(setShowSidebar(v));
      }} onText="" offText=""/>
    </TabItem>
    <TabItem title={tSidebar('preview.livePreview')}>
      <TooltipHost
        content={<div className={s.previewTips}>
          {tSidebar('preview.notice')}
        </div>}
      ><TerreToggle title={tSidebar('preview.livePreview')} isChecked={isEnableLivePreview} onChange={(v) => {
          dispatch(setEnableLivePreview(v));
        }} onText="" offText=""/></TooltipHost>
    </TabItem>
  </TopbarTab>;
}
