import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import s from './export.module.scss';
import AndroidIcon from "material-icon-theme/icons/android.svg";
import {api} from "@/api";
import { Desktop24Filled, Desktop24Regular, Globe24Filled, Globe24Regular, bundleIcon } from "@fluentui/react-icons";
import useEditorStore from "@/store/useEditorStore";
import { t } from "@lingui/macro";

export function ExportTab() {
  const gameDir = useEditorStore.use.subPage();
  const GlobeIcon = bundleIcon(Globe24Filled, Globe24Regular);
  const DesktopIcon = bundleIcon(Desktop24Filled, Desktop24Regular);

  return <TopbarTab>
    <TabItem title={t`导出`}>
      <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsWeb(gameDir)}
        icon={<GlobeIcon aria-label="Export Web" className={s.iconColor}/>}
        text={t`导出为网页`}/>
      <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsExe(gameDir)}
        icon={<DesktopIcon aria-label="Export Exe" className={s.iconColor}/>}
        text={t`导出为可执行文件`}/>
      <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsAndroid(gameDir)}
        icon={<img src={AndroidIcon} className={s.iconColor} alt="Export Android"/>}
        text={t`导出为安卓项目文件`}/>
    </TabItem>
  </TopbarTab>;
}
