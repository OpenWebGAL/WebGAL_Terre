import { useEffect, useState } from 'react';
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
import type { TemplateIncompatiblePayload } from '@webgal/editor-preview-protocol';
import { api } from '@/api';
import useEditorStore from '@/store/useEditorStore';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import { eventBus } from '@/utils/eventBus';

export default function TemplateIncompatibleDialog() {
  const gameDir = useEditorStore.use.subPage();
  const { mutate } = useSWRConfig();
  const [payload, setPayload] = useState<TemplateIncompatiblePayload | null>(
    () => EditorPreviewClient.getLastTemplateIncompatiblePayload(),
  );
  const [upgrading, setUpgrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    const handleIncompatible = ({
      payload: nextPayload,
    }: {
      payload: TemplateIncompatiblePayload;
    }) => {
      setPayload(nextPayload);
    };

    eventBus.on('editor-preview:template-incompatible', handleIncompatible);
    return () => {
      eventBus.off('editor-preview:template-incompatible', handleIncompatible);
      EditorPreviewClient.clearTemplateIncompatiblePayload();
    };
  }, [gameDir]);

  const dismiss = () => {
    if (upgrading) return;
    EditorPreviewClient.clearTemplateIncompatiblePayload();
    setPayload(null);
    setErrorMsg(null);
  };

  const canUpgradeTo47 = payload?.reason === 'legacy-template';

  const handleUpgrade = async () => {
    if (!gameDir || upgrading) return;
    setUpgrading(true);
    setErrorMsg(null);
    try {
      await api.manageTemplateControllerUpgradeGameTemplate({ gameDir });
      EditorPreviewClient.reloadTemplates();
      await Promise.all([
        mutate(`game-${gameDir}-template-config`),
        mutate('game-list'),
      ]);
      setPayload(null);
    } catch {
      setErrorMsg(t`升级游戏模板失败，请检查游戏目录权限后重试。`);
    } finally {
      setUpgrading(false);
    }
  };

  const templateLabel = payload?.templateName || t`未命名模板`;
  const templateVersionLabel = payload?.templateVersion || t`未知版本`;
  const engineVersionLabel = payload?.engineVersion || '';

  return (
    <Dialog open={payload !== null} onOpenChange={(_, data) => !data.open && dismiss()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            {canUpgradeTo47 ? t`检测到旧版 UI 模板` : t`模板与引擎版本不匹配`}
          </DialogTitle>
          <DialogContent>
            {canUpgradeTo47 ? (
              <>
                <p>
                  {t`当前游戏使用的模板（${templateLabel}，${templateVersionLabel}）为旧版格式，当前引擎（v${engineVersionLabel}）已不再兼容旧版模板，预览暂时回退至默认界面。`}
                </p>
                <p>
                  {t`是否立即将该游戏的模板升级为 4.7 格式？升级后会自动迁移标题、文本框与分支选择样式，并将原有 Stage、UI 目录备份至 game/template/legacy-backup。`}
                </p>
              </>
            ) : (
              <p>
                {t`当前游戏模板版本（${templateVersionLabel}）与当前引擎版本（v${engineVersionLabel}）大版本不一致，已回退至默认界面。请检查游戏所用的引擎或模板版本。`}
              </p>
            )}
            {errorMsg && (
              <p style={{ color: 'var(--status-error, #d13438)' }}>{errorMsg}</p>
            )}
          </DialogContent>
          <DialogActions>
            {canUpgradeTo47 ? (
              <>
                <Button appearance="secondary" disabled={upgrading} onClick={dismiss}>
                  {t`暂不升级`}
                </Button>
                <Button
                  appearance="primary"
                  icon={upgrading ? <Spinner size="tiny" /> : undefined}
                  disabled={upgrading}
                  onClick={handleUpgrade}
                >
                  {upgrading ? t`正在升级...` : t`升级模板`}
                </Button>
              </>
            ) : (
              <Button appearance="primary" onClick={dismiss}>
                {t`确定`}
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
