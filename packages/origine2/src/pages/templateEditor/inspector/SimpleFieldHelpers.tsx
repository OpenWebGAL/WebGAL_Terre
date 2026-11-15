import { ReactNode } from 'react';
import { Button, Input, SpinButton, Tooltip } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { ColorPickerPopup } from '@/components/ColorPickerPopup/ColorPickerPopup';
import ChooseFile from '@/pages/editor/ChooseFile/ChooseFile';
import { extNameMap } from '@/pages/editor/ChooseFile/chooseFileConfig';
import { buildTemplateAssetCssUrl, extractAssetDisplayName } from '../screenCatalog';
import styles from './inspectorCommon.module.scss';

export function InspectorRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.label} title={label}>{label}</span>
      <div className={styles.control}>{children}</div>
    </div>
  );
}

function parseNumeric(value: number | null | undefined, displayValue: string | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (displayValue !== undefined && displayValue.trim() !== '') {
    const parsed = Number(displayValue);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

interface IPxSpinFieldProps {
  tag?: string;
  value?: number;
  placeholder?: string;
  step?: number;
  min?: number;
  max?: number;
  onChange: (next: number | undefined) => void;
}

export function PxSpinField({
  tag,
  value,
  placeholder,
  step = 1,
  min,
  max,
  onChange,
}: IPxSpinFieldProps) {
  return (
    <div className={styles.axisField}>
      {tag && <span className={styles.axisTag}>{tag}</span>}
      <SpinButton
        className={styles.spin}
        size="small"
        appearance="filled-darker"
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        value={value ?? null}
        onChange={(_, data) => {
          const next = parseNumeric(data.value, data.displayValue);
          onChange(next === null ? undefined : next);
        }}
      />
    </div>
  );
}

interface IColorControlProps {
  color: string;
  onChange: (color: string) => void;
}

export function CompactColorField({ color, onChange }: IColorControlProps) {
  return (
    <div className={styles.control}>
      <ColorPickerPopup key={color} color={color || '#000000FF'} onChange={onChange} />
      <Input
        size="small"
        style={{ flex: 1, minWidth: 0 }}
        value={color}
        onChange={(_, data) => onChange(data.value)}
      />
    </div>
  );
}

interface IAssetImageFieldProps {
  value?: string;
  templateDir: string;
  scssPath?: string | null;
  onChange: (cssUrl: string) => void;
  onClear?: () => void;
}

export function AssetImageField({
  value,
  templateDir,
  scssPath,
  onChange,
  onClear,
}: IAssetImageFieldProps) {
  const displayName = extractAssetDisplayName(value);
  return (
    <div className={styles.control}>
      <span className={styles.assetPreviewName} title={value || ''}>
        {displayName || t`未选择`}
      </span>
      <ChooseFile
        title={t`选择图片`}
        rootPath={['templates', templateDir]}
        extNames={extNameMap.get('image')}
        button={<Button size="small" appearance="secondary">{t`选择`}</Button>}
        onChange={(file) => {
          if (!file) return;
          onChange(buildTemplateAssetCssUrl(file.path, templateDir, scssPath));
        }}
      />
      {onClear && value && (
        <Tooltip content={t`清除`} relationship="label">
          <Button
            size="small"
            appearance="subtle"
            icon={<DismissRegular />}
            onClick={onClear}
          />
        </Tooltip>
      )}
    </div>
  );
}
