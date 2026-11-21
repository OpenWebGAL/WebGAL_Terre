import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { t } from '@lingui/macro';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Spinner,
} from '@fluentui/react-components';
import { api } from '@/api';

export interface UpgradeLegacyTemplateDialogProps {
  open: boolean;
  templateDir: string;
  templateName: string;
  allowApplyDirectly?: boolean;
  onClose: () => void;
  onProceed: () => void | Promise<void>;
}

export function UpgradeLegacyTemplateDialog({
  open,
  templateDir,
  templateName,
  allowApplyDirectly = false,
  onClose,
  onProceed,
}: UpgradeLegacyTemplateDialogProps) {
  const { mutate } = useSWRConfig();
  const [upgrading, setUpgrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpgradeAndProceed = async () => {
    if (upgrading || !templateDir) return;
    setUpgrading(true);
    setErrorMsg(null);
    try {
      await api.manageTemplateControllerUpgradeTemplate({ templateDir });
      await Promise.all([
        mutate('template-list'),
        mutate('template-list-selector'),
        mutate(`/templateConfig/${templateDir}`),
        mutate(`/templateScreens/${templateDir}`),
      ]);
      onClose();
      await onProceed();
    } catch {
      setErrorMsg(t`模板升级失败，请检查模板目录是否可写后重试。`);
    } finally {
      setUpgrading(false);
    }
  };

  const handleApplyDirectly = async () => {
    if (upgrading) return;
    onClose();
    await onProceed();
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && !upgrading && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{t`所选模板为旧版格式`}</DialogTitle>
          <DialogContent>
            <p>
              {t`模板 "${templateName}" 仍是旧版格式，WebGAL 4.7 引擎已不再直接兼容旧版模板。`}
            </p>
            <p>
              {t`建议先将其升级为 4.7 模板后再继续应用（旧版 Stage、UI 目录会自动备份至 legacy-backup）。`}
            </p>
            {errorMsg && (
              <p style={{ color: 'var(--status-error, #d13438)' }}>{errorMsg}</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" disabled={upgrading} onClick={onClose}>
              {t`取消`}
            </Button>
            {allowApplyDirectly && (
              <Button appearance="subtle" disabled={upgrading} onClick={handleApplyDirectly}>
                {t`仍直接应用`}
              </Button>
            )}
            <Button
              appearance="primary"
              icon={upgrading ? <Spinner size="tiny" /> : undefined}
              disabled={upgrading}
              onClick={handleUpgradeAndProceed}
            >
              {upgrading ? t`正在升级...` : t`升级并继续`}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
