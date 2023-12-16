import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import useTrans from "@/hooks/useTrans";
import s from './export.module.scss';
import {FontIcon} from "@fluentui/react";
import AndroidIcon from "material-icon-theme/icons/android.svg";
import {api} from "@/api";
import {origineStore} from "@/store/origineStore";

export function ExportTab() {
  const t = useTrans('editor.topBar.');
  const gameName = origineStore.getState().status.editor.currentEditingGame;
  return <TopbarTab>
    <TabItem title="导出">
      <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsWeb(gameName)}
        icon={<FontIcon aria-label="Export Web" iconName="Globe" className={s.iconColor}/>}
        text={t('commandBar.items.release.items.web')}/>
      <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsExe(gameName)}
        icon={<FontIcon aria-label="Export Exe" iconName="Devices2" className={s.iconColor}/>}
        text={t('commandBar.items.release.items.exe')}/>
      <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsAndroid(gameName)}
        icon={<img src={AndroidIcon} className={s.iconColor} alt="Export Android"/>}
        text={t('commandBar.items.release.items.android')}/>
    </TabItem>
  </TopbarTab>;
}
