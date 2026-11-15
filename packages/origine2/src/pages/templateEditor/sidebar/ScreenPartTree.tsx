import { ChangeEvent, useRef, useState } from 'react';
import {
  Button,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Toast,
  Toaster,
  ToastIntent,
  ToastTitle,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import {
  ArrowSwapRegular,
  ArrowUploadRegular,
  ChevronDownRegular,
  ChevronRightRegular,
  LockClosedRegular,
} from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import type { UiPartDescriptor, UiScreenId } from '@webgal/editor-preview-protocol';
import {
  DEFAULT_SCREEN_VARIANTS,
  getScreenDisplayName,
  UI_SCREEN_IDS,
  type TemplateScreenEntryMeta,
  type TemplateScreensInfo,
} from '../screenCatalog';
import styles from './screenPartTree.module.scss';

interface IScreenPartTreeProps {
  screensInfo: TemplateScreensInfo | null;
  activeScreenId: UiScreenId | null;
  parts: UiPartDescriptor[];
  selectedPartId: string | null;
  onSelectScreen: (screen: UiScreenId) => void;
  onSelectPart: (partId: string) => void;
  onSwitchVariant: (screen: UiScreenId, variantId: string) => Promise<void>;
  onImportVariant: (screen: UiScreenId, file: File) => Promise<void>;
}

interface IScreenTreeItemProps {
  screenId: UiScreenId;
  entry: TemplateScreenEntryMeta;
  isActive: boolean;
  parts: UiPartDescriptor[];
  selectedPartId: string | null;
  onSelectScreen: (screen: UiScreenId) => void;
  onSelectPart: (partId: string) => void;
  onSwitchVariant: (screen: UiScreenId, variantId: string) => Promise<void>;
  onPickImportFile: (screen: UiScreenId) => void;
}

function ScreenTreeItem({
  screenId,
  entry,
  isActive,
  parts,
  selectedPartId,
  onSelectScreen,
  onSelectPart,
  onSwitchVariant,
  onPickImportFile,
}: IScreenTreeItemProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div className={styles.screenGroup}>
      <div
        className={`${styles.screenRow} ${isActive ? styles.screenRowActive : ''}`}
        onClick={() => onSelectScreen(screenId)}
      >
        {isActive ? <ChevronDownRegular /> : <ChevronRightRegular />}
        <span className={styles.screenName}>{getScreenDisplayName(screenId)}</span>
        <div className={styles.screenActions} onClick={(event) => event.stopPropagation()}>
          <Popover
            open={popoverOpen}
            onOpenChange={(_ev, data) => setPopoverOpen(data.open)}
            positioning="after"
          >
            <PopoverTrigger disableButtonEnhancement>
              <Tooltip content={t`更换界面`} relationship="label">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<ArrowSwapRegular />}
                />
              </Tooltip>
            </PopoverTrigger>
            <PopoverSurface>
              <div className={styles.variantPopover}>
                {entry.variants.map((variant) => {
                  const isCurrent = variant.variantId === entry.activeVariant;
                  return (
                    <div
                      key={variant.variantId}
                      className={`${styles.variantItem} ${isCurrent ? styles.variantItemActive : ''}`}
                      onClick={async () => {
                        setPopoverOpen(false);
                        if (!isCurrent) {
                          await onSwitchVariant(screenId, variant.variantId);
                        }
                      }}
                    >
                      <span>{variant.name}</span>
                      <span className={styles.variantTag}>
                        {variant.builtIn ? t`内置` : t`自定义`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </PopoverSurface>
          </Popover>

          <Tooltip content={t`导入自定义界面`} relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<ArrowUploadRegular />}
              onClick={() => onPickImportFile(screenId)}
            />
          </Tooltip>
        </div>
      </div>

      {isActive && (
        <div className={styles.partList}>
          {parts.length === 0 ? (
            <div className={styles.emptyParts}>{t`等待预览上报部件`}</div>
          ) : (
            parts.map((part) => (
              <div
                key={part.id}
                className={`${styles.partRow} ${part.id === selectedPartId ? styles.partRowActive : ''}`}
                onClick={() => onSelectPart(part.id)}
              >
                <span className={styles.partName}>{part.name}</span>
                {!part.allowLayoutEdit && (
                  <Tooltip content={t`布局由列表控制`} relationship="label">
                    <span className={styles.lockBadge}>
                      <LockClosedRegular fontSize={12} />
                    </span>
                  </Tooltip>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function ScreenPartTree({
  screensInfo,
  activeScreenId,
  parts,
  selectedPartId,
  onSelectScreen,
  onSelectPart,
  onSwitchVariant,
  onImportVariant,
}: IScreenPartTreeProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTargetScreenRef = useRef<UiScreenId>('title');
  const toasterId = useId('screen-tree-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const notify = (message: string, intent: ToastIntent) => {
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { intent },
    );
  };

  const resolveEntry = (screenId: UiScreenId): TemplateScreenEntryMeta => {
    const matched = screensInfo?.screens.find((item) => item.screen === screenId);
    if (matched) return matched;
    const defaultVariant = DEFAULT_SCREEN_VARIANTS[screenId];
    return {
      screen: screenId,
      activeVariant: defaultVariant,
      variants: [
        {
          variantId: defaultVariant,
          name: defaultVariant,
          builtIn: true,
          hasEntryJs: false,
          scssPath: `screens/${screenId}/${defaultVariant}/style.scss`,
        },
      ],
    };
  };

  const handlePickImportFile = (screenId: UiScreenId) => {
    uploadTargetScreenRef.current = screenId;
    fileInputRef.current?.click();
  };

  const resolveSwitchErrorMessage = (error: unknown, fallback: string): string => {
    const responseMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
    const raw = typeof responseMessage === 'string'
      ? responseMessage
      : error instanceof Error
        ? error.message
        : '';
    if (raw.includes('Built-in templates cannot be modified')) {
      return t`内置模板为只读，请新建模板后再更换界面`;
    }
    return raw || fallback;
  };

  const handleSwitchVariant = async (screen: UiScreenId, variantId: string) => {
    try {
      await onSwitchVariant(screen, variantId);
    } catch (error) {
      notify(resolveSwitchErrorMessage(error, t`更换界面失败`), 'error');
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      await onImportVariant(uploadTargetScreenRef.current, file);
      notify(t`界面导入成功`, 'success');
    } catch (error) {
      notify(resolveSwitchErrorMessage(error, t`界面导入失败`), 'error');
    }
  };

  return (
    <div className={styles.treeRoot}>
      <Toaster toasterId={toasterId} />
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {UI_SCREEN_IDS.map((screenId) => (
        <ScreenTreeItem
          key={screenId}
          screenId={screenId}
          entry={resolveEntry(screenId)}
          isActive={screenId === activeScreenId}
          parts={screenId === activeScreenId ? parts : []}
          selectedPartId={selectedPartId}
          onSelectScreen={onSelectScreen}
          onSelectPart={onSelectPart}
          onSwitchVariant={handleSwitchVariant}
          onPickImportFile={handlePickImportFile}
        />
      ))}
    </div>
  );
}
