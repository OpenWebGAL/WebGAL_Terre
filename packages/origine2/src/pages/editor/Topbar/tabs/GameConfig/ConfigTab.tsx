import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import GameConfig, {
  GameConfigDialog,
  GameConfigDialogButton,
} from "@/pages/editor/Topbar/tabs/GameConfig/GameConfig";
import { TabItem } from "@/pages/editor/Topbar/components/TabItem";
import { t } from "@lingui/macro";
import { useState } from "react";

export default function ConfigTab(){
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <>
      <TopbarTab>
        <GameConfig mode="quick"/>
        <TabItem title={t`游戏配置`}>
          <GameConfigDialogButton onClick={() => setConfigOpen(true)} />
        </TabItem>
      </TopbarTab>
      <GameConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </>
  );
}
