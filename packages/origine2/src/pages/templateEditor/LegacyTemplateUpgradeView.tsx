import { useState } from 'react';
import { Button, Spinner } from '@fluentui/react-components';
import { ArrowCircleUp24Regular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import type { TemplateConfigDto } from '@/api/Api';
import { goTo } from '@/router';
import styles from './templateEditor.module.scss';

export interface LegacyTemplateUpgradeViewProps {
  templateConfig?: TemplateConfigDto;
  onUpgrade: () => Promise<void>;
}

export function LegacyTemplateUpgradeView({
  templateConfig,
  onUpgrade,
}: LegacyTemplateUpgradeViewProps) {
  const [upgrading, setUpgrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const versionText = templateConfig?.['webgal-version'] || t`未知版本`;

  const handleUpgrade = async () => {
    if (upgrading) return;
    setUpgrading(true);
    setErrorMsg(null);
    try {
      await onUpgrade();
    } catch {
      setErrorMsg(t`模板升级失败，请检查模板文件是否可写后重试。`);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className={styles.legacyUpgradeContainer}>
      <div className={styles.legacyUpgradeCard}>
        <div className={styles.legacyUpgradeTitle}>
          {t`当前模板为旧版格式（${versionText}）`}
        </div>
        <p className={styles.legacyUpgradeDesc}>
          {t`WebGAL 4.7 已采用全新的独立界面架构，不再支持直接编辑旧版模板。`}
        </p>
        <p className={styles.legacyUpgradeDesc}>
          {t`点击下方升级按钮即可将其转换为 4.7 模板：系统会保留原有字体与资源文件，自动迁移标题、文本框与分支选择样式，并将旧版 Stage、UI 目录备份至 legacy-backup 文件夹。`}
        </p>
        {errorMsg && <div className={styles.legacyUpgradeError}>{errorMsg}</div>}
        <div className={styles.legacyUpgradeActions}>
          <Button
            appearance="secondary"
            disabled={upgrading}
            onClick={() => goTo('dashboard', 'template')}
          >
            {t`返回模板列表`}
          </Button>
          <Button
            appearance="primary"
            icon={upgrading ? <Spinner size="tiny" /> : <ArrowCircleUp24Regular />}
            disabled={upgrading}
            onClick={handleUpgrade}
          >
            {upgrading ? t`正在升级...` : t`升级模板`}
          </Button>
        </div>
      </div>
    </div>
  );
}
