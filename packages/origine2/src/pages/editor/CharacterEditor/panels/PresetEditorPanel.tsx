import { KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Input } from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { ICharacterLayer } from '../model/characterDocument';
import styles from './characterPanels.module.scss';

interface IPresetEditorPanelProps {
  layers: ICharacterLayer[];
  presets?: Record<string, string[]>;
  selectedPresetKey: string | null;
  onSelectPreset: (key: string) => void;
  onCreatePreset: () => void;
  onRenamePreset: (oldKey: string, newKey: string) => boolean;
  onTogglePresetLayer: (presetKey: string, layerKey: string) => void;
  onRemovePreset: (key: string) => void;
}

/**
 * 右下预设编辑器：左侧选中即应用预设，右侧勾选预设包含的图层并实时同步
 */
export function PresetEditorPanel(props: IPresetEditorPanelProps) {
  const {
    layers,
    presets,
    selectedPresetKey,
    onSelectPreset,
    onCreatePreset,
    onRenamePreset,
    onTogglePresetLayer,
    onRemovePreset,
  } = props;

  const presetEntries = useMemo(() => Object.entries(presets ?? {}), [presets]);
  const activeKey = selectedPresetKey && presets && Object.hasOwn(presets, selectedPresetKey)
    ? selectedPresetKey
    : null;
  const includedSet = useMemo(() => new Set(activeKey ? presets?.[activeKey] ?? [] : []), [activeKey, presets]);

  const [nameDraft, setNameDraft] = useState(activeKey ?? '');

  useEffect(() => {
    setNameDraft(activeKey ?? '');
  }, [activeKey]);

  const commitName = () => {
    if (!activeKey) return;
    if (!onRenamePreset(activeKey, nameDraft)) setNameDraft(activeKey);
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
    if (event.key === 'Escape' && activeKey) {
      setNameDraft(activeKey);
      event.currentTarget.blur();
    }
  };

  return (
    <div className={styles.presetSplit}>
      <div className={styles.presetLeft}>
        <div className={styles.toolbar}>
          <Button size="small" appearance="subtle" icon={<AddRegular />} onClick={onCreatePreset}>
            {t`新建预设`}
          </Button>
        </div>
        <div className={styles.scrollList}>
          {presetEntries.map(([key]) => (
            <div
              key={key}
              className={`${styles.listRow} ${key === activeKey ? styles.selected : ''}`}
              onClick={() => onSelectPreset(key)}
            >
              <span className={styles.ellipsis} title={key}>{key}</span>
              <Button
                className={styles.hoverAction}
                size="small"
                appearance="transparent"
                icon={<DeleteRegular />}
                title={t`删除预设`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePreset(key);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.presetRight}>
        {activeKey ? (
          <>
            <div className={styles.toolbar}>
              <Input
                className={styles.fullInput}
                size="small"
                appearance="filled-darker"
                value={nameDraft}
                onChange={(_, data) => setNameDraft(data.value)}
                onBlur={commitName}
                onKeyDown={handleNameKeyDown}
              />
            </div>
            <div className={styles.scrollList}>
              {layers.map((layer) => (
                <label key={layer.key} className={styles.checkRow}>
                  <Checkbox
                    size="medium"
                    checked={includedSet.has(layer.key)}
                    onChange={() => onTogglePresetLayer(activeKey, layer.key)}
                  />
                  <span className={styles.ellipsis} title={layer.key}>{layer.key}</span>
                </label>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            {presetEntries.length > 0 ? t`未选择预设` : t`暂无预设`}
          </div>
        )}
      </div>
    </div>
  );
}
