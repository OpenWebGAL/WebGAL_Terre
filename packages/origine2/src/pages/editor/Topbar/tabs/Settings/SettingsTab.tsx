import { useState } from 'react';
import { t } from '@lingui/macro';
import TopbarTab from '@/pages/editor/Topbar/components/TopbarTab';
import { TabItem } from '@/pages/editor/Topbar/components/TabItem';
import {
  AppSettingsDialog,
  SettingsShortcutGrid,
} from '@/components/AppSettings/AppSettingsDialog';

export function SettingsTab() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <TopbarTab>
        <TabItem title={t`设置`}>
          <SettingsShortcutGrid onOpenSettings={() => setSettingsOpen(true)} />
        </TabItem>
      </TopbarTab>
      <AppSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
