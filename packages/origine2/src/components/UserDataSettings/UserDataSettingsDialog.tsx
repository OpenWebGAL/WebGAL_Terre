import {
  Badge,
  Button,
  Input,
  Spinner,
} from '@fluentui/react-components';
import {
  ArrowSync20Regular,
  Database20Regular,
  FolderOpen20Regular,
} from '@fluentui/react-icons';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { t } from '@lingui/macro';
import styles from './UserDataSettingsDialog.module.scss';

declare global {
  interface Window {
    electronFuncs?: {
      dialog?: {
        selectDirectory: (defaultPath?: string) => Promise<string | null>;
      };
    };
  }
}

export interface UserDataLegacyMigrationStatus {
  hasLegacyGames: boolean;
  hasLegacyCustomTemplates: boolean;
  hasLegacyDerivativeEngines: boolean;
  needsMigrationNotice: boolean;
}

export interface UserDataStatus {
  appRoot: string;
  configRoot: string;
  configPath: string;
  defaultUserDataRoot: string;
  configuredUserDataRoot: string;
  activeUserDataRoot: string;
  portableDataRoot: string;
  isPortable: boolean;
  hasPortableDataDir: boolean;
  legacyMigration: UserDataLegacyMigrationStatus;
}

interface UserDataOperationResult {
  success: boolean;
  message: string;
  conflicts: string[];
  status: UserDataStatus;
}

export const USER_DATA_STATUS_KEY = '/api/userData/status';

export const userDataStatusFetcher = async () => {
  const resp = await axios.get<UserDataStatus>(USER_DATA_STATUS_KEY);
  return resp.data;
};

export function UserDataSettingsPanel() {
  const { data: status, isLoading, mutate: mutateStatus } = useSWR(
    USER_DATA_STATUS_KEY,
    userDataStatusFetcher,
  );
  const [targetPath, setTargetPath] = useState('');
  const [operationMessage, setOperationMessage] = useState('');
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status) setTargetPath(status.configuredUserDataRoot);
  }, [status?.configuredUserDataRoot]);

  const migrationText = useMemo(() => {
    if (!status?.legacyMigration.needsMigrationNotice) return '';
    const parts = [];
    if (status.legacyMigration.hasLegacyGames) parts.push(t`旧游戏目录`);
    if (status.legacyMigration.hasLegacyCustomTemplates) parts.push(t`旧自定义模板`);
    if (status.legacyMigration.hasLegacyDerivativeEngines) parts.push(t`旧定制引擎`);
    if (parts.length === 0) return t`当前没有检测到可迁移内容，但新版本已经切换为用户数据目录。`;
    return t`检测到需要迁移的内容：${parts.join('、')}。`;
  }, [status]);

  const refreshAll = async (nextStatus?: UserDataStatus) => {
    await mutateStatus(nextStatus, { revalidate: true });
    await Promise.all([
      mutate('game-list'),
      mutate('template-list'),
      mutate('template-list-selector'),
      mutate('derivativeEngines'),
    ]);
  };

  const runOperation = async (operation: () => Promise<UserDataOperationResult>) => {
    setBusy(true);
    setOperationMessage('');
    setConflicts([]);
    try {
      const result = await operation();
      setOperationMessage(result.message);
      setConflicts(result.conflicts ?? []);
      await refreshAll(result.status);
    } catch (error) {
      setOperationMessage(error instanceof Error ? error.message : t`操作失败`);
    } finally {
      setBusy(false);
    }
  };

  const migrateLegacy = () =>
    runOperation(async () => {
      const resp = await axios.post<UserDataOperationResult>('/api/userData/migrateLegacy');
      return resp.data;
    });

  const setUserDataPath = () => {
    if (!targetPath.trim() || !status) return;
    const confirmed = window.confirm(
      t`即将把用户数据迁移到新的目录。文件较多时可能需要一些时间，迁移完成前请不要关闭 WebGAL Terre。`,
    );
    if (!confirmed) return;
    runOperation(async () => {
      const resp = await axios.post<UserDataOperationResult>('/api/userData/setPath', {
        userDataPath: targetPath.trim(),
      });
      return resp.data;
    });
  };

  const resetUserDataPath = () => {
    const confirmed = window.confirm(
      t`即将把用户数据迁移回默认目录。文件较多时可能需要一些时间。`,
    );
    if (!confirmed) return;
    runOperation(async () => {
      const resp = await axios.post<UserDataOperationResult>('/api/userData/resetPath');
      return resp.data;
    });
  };

  const openPath = async (target: 'active' | 'config' | 'portable' | 'app') => {
    await axios.post('/api/userData/open', { target });
  };

  const chooseDirectory = async () => {
    const selectDirectory = window.electronFuncs?.dialog?.selectDirectory;
    if (selectDirectory) {
      const selectedPath = await selectDirectory(targetPath || status?.configuredUserDataRoot);
      if (selectedPath) {
        setTargetPath(selectedPath);
      }
      return;
    }

    const showDirectoryPicker = (
      window as Window & {
        showDirectoryPicker?: () => Promise<{ name?: string }>;
      }
    ).showDirectoryPicker;

    if (showDirectoryPicker) {
      try {
        await showDirectoryPicker();
        setOperationMessage(
          t`浏览器已选择目录，但出于安全限制不会暴露本地绝对路径，无法直接用于迁移。请手动输入目录路径。`,
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setOperationMessage(t`当前环境不支持系统文件夹选择器，请手动输入路径。`);
      }
      return;
    }

    setOperationMessage(t`当前环境不支持系统文件夹选择器，请手动输入路径。`);
  };

  return (
    <>
      {isLoading && <Spinner label={t`正在读取用户数据设置`} />}
      {status && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t`当前状态`}</div>
            <div className={styles.row}>
              <span>{t`模式`}</span>
              <div>
                <Badge appearance="filled" color={status.isPortable ? 'important' : 'brand'}>
                  {status.isPortable ? t`Portable 模式` : t`用户目录模式`}
                </Badge>
              </div>
            </div>
            <div className={styles.row}>
              <span>{t`用户数据目录`}</span>
              <div className={styles.pathValue} title={status.activeUserDataRoot}>
                {status.activeUserDataRoot}
              </div>
            </div>
            <div className={styles.row}>
              <span>{t`配置目录`}</span>
              <div className={styles.pathValue} title={status.configRoot}>
                {status.configRoot}
              </div>
            </div>
            <div className={styles.actions}>
              <Button icon={<FolderOpen20Regular />} onClick={() => openPath('active')}>
                {t`打开用户数据目录`}
              </Button>
              <Button icon={<FolderOpen20Regular />} onClick={() => openPath('config')}>
                {t`打开配置目录`}
              </Button>
              <Button icon={<FolderOpen20Regular />} onClick={() => openPath('app')}>
                {t`打开安装目录`}
              </Button>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t`用户数据位置`}</div>
            <div className={styles.message}>
              {t`配置始终保存在统一的 .webgal_terre 目录。游戏、自定义模板和定制引擎可以迁移到其他磁盘。`}
            </div>
            <Input
              value={targetPath}
              disabled={status.isPortable || busy}
              onChange={(_, data) => setTargetPath(data.value)}
              contentBefore={<Database20Regular />}
            />
            <div className={styles.actions}>
              <Button
                icon={<FolderOpen20Regular />}
                disabled={status.isPortable || busy}
                onClick={chooseDirectory}
              >
                {t`选择目录`}
              </Button>
              <Button
                appearance="primary"
                disabled={status.isPortable || busy || !targetPath.trim()}
                onClick={setUserDataPath}
              >
                {t`迁移到此目录`}
              </Button>
              <Button disabled={status.isPortable || busy} onClick={resetUserDataPath}>
                {t`恢复默认目录`}
              </Button>
            </div>
            {status.isPortable && (
              <div className={styles.message}>
                {t`当前处于 portable 模式，实际数据目录由安装目录下的 data 文件夹决定。`}
              </div>
            )}
          </div>

          {status.legacyMigration.needsMigrationNotice && (
            <div className={styles.notice}>
              <div className={styles.sectionTitle}>{t`4.6 用户数据迁移`}</div>
              <div className={styles.message}>{migrationText}</div>
              <div className={styles.actions}>
                <Button
                  appearance="primary"
                  icon={<ArrowSync20Regular />}
                  disabled={busy}
                  onClick={migrateLegacy}
                >
                  {t`开始迁移`}
                </Button>
              </div>
            </div>
          )}

          {operationMessage && <div className={styles.message}>{operationMessage}</div>}
          {conflicts.length > 0 && (
            <div className={styles.danger}>
              {t`以下目标路径已存在，未覆盖：`}
              <ul>
                {conflicts.map((conflict) => (
                  <li key={conflict}>{conflict}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
}
