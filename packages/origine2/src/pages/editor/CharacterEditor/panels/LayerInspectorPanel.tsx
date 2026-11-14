import { KeyboardEvent, useEffect, useState } from 'react';
import { Button, Input, SpinButton } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import ChooseFile from '@/pages/editor/ChooseFile/ChooseFile';
import { extNameMap } from '@/pages/editor/ChooseFile/chooseFileConfig';
import { INaturalSize } from '../canvas/hitTestLayer';
import {
  buildFigureAssetUrl,
  ICharacterComponent,
  ICharacterLayer,
  resolveComponentScale,
} from '../model/characterDocument';
import styles from './characterPanels.module.scss';

interface ILayerInspectorPanelProps {
  charDirPath: string;
  layer: ICharacterLayer | null;
  naturalSizes: Record<string, INaturalSize>;
  onImageLoad: (url: string, size: INaturalSize) => void;
  onRenameLayer: (oldKey: string, newKey: string) => boolean;
  onUpdateLayer: (key: string, updater: (comp: ICharacterComponent) => ICharacterComponent) => void;
}

function parseSpinNumber(value: number | null | undefined, displayValue: string | undefined): number | null {
  const raw = value ?? (displayValue !== undefined && displayValue.trim() !== '' ? Number(displayValue) : NaN);
  return Number.isFinite(raw) ? raw : null;
}

interface IAxisSpinFieldProps {
  tag: string;
  value: number | null;
  step: number;
  min?: number;
  disabled?: boolean;
  placeholder?: string;
  onCommit: (next: number | null) => void;
}

function AxisSpinField({ tag, value, step, min, disabled, placeholder, onCommit }: IAxisSpinFieldProps) {
  return (
    <div className={styles.pairField}>
      <span className={styles.axisTag}>{tag}</span>
      <SpinButton
        className={styles.spin}
        size="small"
        appearance="filled-darker"
        step={step}
        min={min}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(_, data) => onCommit(parseSpinNumber(data.value, data.displayValue))}
      />
    </div>
  );
}

/**
 * 右上属性检查器：编辑当前选中图层的名称、素材、位置、缩放、旋转与宽高
 */
export function LayerInspectorPanel(props: ILayerInspectorPanelProps) {
  const { charDirPath, layer, naturalSizes, onImageLoad, onRenameLayer, onUpdateLayer } = props;
  const [nameDraft, setNameDraft] = useState(layer?.key ?? '');

  useEffect(() => {
    setNameDraft(layer?.key ?? '');
  }, [layer?.key]);

  if (!layer) {
    return <div className={styles.emptyState}>{t`未选择图层`}</div>;
  }

  const comp = layer.component;
  const assetUrl = buildFigureAssetUrl(charDirPath, comp.src);
  const natural = naturalSizes[assetUrl];
  const hasExplicitSize = (comp.width ?? 0) > 0 && (comp.height ?? 0) > 0;
  const hasAnySize = (comp.width ?? 0) > 0 || (comp.height ?? 0) > 0;
  const { scaleX, scaleY } = resolveComponentScale(comp);

  const commitName = () => {
    if (!onRenameLayer(layer.key, nameDraft)) setNameDraft(layer.key);
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
    if (event.key === 'Escape') {
      setNameDraft(layer.key);
      event.currentTarget.blur();
    }
  };

  const updateDimension = (axis: 'width' | 'height', nextValue: number | null) => {
    if (nextValue === null || nextValue <= 0) return;
    onUpdateLayer(layer.key, (prev) => {
      if (axis === 'width') {
        const height = (prev.height ?? 0) > 0 ? prev.height : (natural?.height || nextValue);
        return { ...prev, width: nextValue, height, scale: undefined, scaleX: undefined, scaleY: undefined };
      }
      const width = (prev.width ?? 0) > 0 ? prev.width : (natural?.width || nextValue);
      return { ...prev, width, height: nextValue, scale: undefined, scaleX: undefined, scaleY: undefined };
    });
  };

  const updateScale = (axis: 'x' | 'y', nextValue: number | null) => {
    if (nextValue === null || nextValue <= 0) return;
    onUpdateLayer(layer.key, (prev) => {
      const current = resolveComponentScale(prev);
      const nextX = axis === 'x' ? nextValue : current.scaleX;
      const nextY = axis === 'y' ? nextValue : current.scaleY;
      if (nextX === nextY) {
        return { ...prev, scale: nextX, scaleX: undefined, scaleY: undefined, width: undefined, height: undefined };
      }
      return { ...prev, scale: undefined, scaleX: nextX, scaleY: nextY, width: undefined, height: undefined };
    });
  };

  return (
    <div className={styles.inspector}>
      <div className={styles.row}>
        <span className={styles.label}>{t`名称`}</span>
        <div className={styles.control}>
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
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{t`素材`}</span>
        <div className={styles.control}>
          {comp.src && (
            <img
              className={styles.thumb24}
              src={assetUrl}
              alt={layer.key}
              draggable={false}
              onLoad={(e) =>
                onImageLoad(assetUrl, { width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })
              }
            />
          )}
          <span className={styles.ellipsis} title={comp.src}>{comp.src}</span>
          <ChooseFile
            rootPath={charDirPath.split('/')}
            selectedFilePath={comp.src}
            extNames={extNameMap.get('image')}
            button={<Button size="small" appearance="subtle">{t`选择`}</Button>}
            onChange={(file) => {
              if (file) onUpdateLayer(layer.key, (prev) => ({ ...prev, src: file.name }));
            }}
          />
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{t`位置`}</span>
        <div className={styles.pairGroup}>
          <AxisSpinField
            tag="X"
            step={1}
            value={comp.x ?? 0}
            onCommit={(next) => next !== null && onUpdateLayer(layer.key, (prev) => ({ ...prev, x: next }))}
          />
          <AxisSpinField
            tag="Y"
            step={1}
            value={comp.y ?? 0}
            onCommit={(next) => next !== null && onUpdateLayer(layer.key, (prev) => ({ ...prev, y: next }))}
          />
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{t`缩放`}</span>
        <div className={styles.pairGroup}>
          <AxisSpinField
            tag="X"
            step={0.05}
            min={0.01}
            disabled={hasExplicitSize}
            value={scaleX}
            onCommit={(next) => updateScale('x', next)}
          />
          <AxisSpinField
            tag="Y"
            step={0.05}
            min={0.01}
            disabled={hasExplicitSize}
            value={scaleY}
            onCommit={(next) => updateScale('y', next)}
          />
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{t`旋转`}</span>
        <div className={styles.control}>
          <SpinButton
            className={styles.spin}
            size="small"
            appearance="filled-darker"
            step={0.05}
            value={Number((comp.rotation ?? 0).toFixed(3))}
            onChange={(_, data) => {
              const next = parseSpinNumber(data.value, data.displayValue);
              if (next === null) return;
              const rounded = Number(next.toFixed(3));
              onUpdateLayer(layer.key, (prev) => ({
                ...prev,
                rotation: Math.abs(rounded) < 0.001 ? undefined : rounded,
              }));
            }}
          />
          {Boolean(comp.rotation) && (
            <Button
              size="small"
              appearance="subtle"
              icon={<DismissRegular />}
              title={t`重置旋转`}
              onClick={() => onUpdateLayer(layer.key, (prev) => ({ ...prev, rotation: undefined }))}
            />
          )}
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{t`宽高`}</span>
        <div className={styles.pairGroup}>
          <AxisSpinField
            tag="W"
            min={1}
            step={1}
            placeholder={t`自动`}
            value={comp.width ?? null}
            onCommit={(next) => updateDimension('width', next)}
          />
          <AxisSpinField
            tag="H"
            min={1}
            step={1}
            placeholder={t`自动`}
            value={comp.height ?? null}
            onCommit={(next) => updateDimension('height', next)}
          />
          {hasAnySize && (
            <Button
              size="small"
              appearance="subtle"
              icon={<DismissRegular />}
              title={t`清除宽高`}
              onClick={() => onUpdateLayer(layer.key, (prev) => ({ ...prev, width: undefined, height: undefined }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
