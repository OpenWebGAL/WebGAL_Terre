import { Select, Switch } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import type { BorderBoxValue, ShadowValue } from '../styleModel';
import { CompactColorField, InspectorRow, PxSpinField } from './SimpleFieldHelpers';
import { ISimpleSectionProps } from './SimpleTextSection';
import styles from './inspectorCommon.module.scss';

export function SimpleBorderSection({ model, onPatch }: ISimpleSectionProps) {
  const { border, boxShadow, opacity } = model;

  const updateBorder = (patch: Partial<BorderBoxValue>, commit = false) => {
    onPatch('border', { ...border, ...patch }, commit);
  };

  const updateBoxShadow = (patch: Partial<ShadowValue>, commit = false) => {
    onPatch('boxShadow', { ...boxShadow, ...patch }, commit);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{t`边框与效果`}</div>
      <InspectorRow label={t`圆角`}>
        <PxSpinField
          tag="px"
          min={0}
          value={border.radiusPx}
          placeholder="0"
          onChange={(radiusPx) => updateBorder({ radiusPx })}
        />
      </InspectorRow>

      <InspectorRow label={t`边框`}>
        <div className={styles.pairGroup}>
          <PxSpinField
            tag="px"
            min={0}
            value={border.borderWidthPx}
            placeholder="0"
            onChange={(borderWidthPx) => updateBorder({ borderWidthPx })}
          />
          <Select
            size="small"
            value={border.borderStyle || 'none'}
            onChange={(_, data) =>
              updateBorder({ borderStyle: data.value as BorderBoxValue['borderStyle'] }, true)
            }
          >
            <option value="none">{t`无`}</option>
            <option value="solid">{t`实线`}</option>
            <option value="dashed">{t`虚线`}</option>
            <option value="double">{t`双线`}</option>
          </Select>
        </div>
      </InspectorRow>

      {border.borderStyle && border.borderStyle !== 'none' && (
        <InspectorRow label={t`边框色`}>
          <CompactColorField
            color={border.borderColor || '#FFFFFF66'}
            onChange={(borderColor) => updateBorder({ borderColor }, true)}
          />
        </InspectorRow>
      )}

      <InspectorRow label={t`盒影`}>
        <Switch
          checked={boxShadow.enabled}
          onChange={(_, data) => updateBoxShadow({ enabled: data.checked }, true)}
        />
        {boxShadow.enabled && (
          <Switch
            checked={Boolean(boxShadow.inset)}
            label={t`内`}
            onChange={(_, data) => updateBoxShadow({ inset: data.checked }, true)}
          />
        )}
      </InspectorRow>
      {boxShadow.enabled && (
        <>
          <InspectorRow label={t`偏移`}>
            <div className={styles.pairGroup}>
              <PxSpinField
                tag="X"
                value={boxShadow.offsetX}
                onChange={(offsetX) => updateBoxShadow({ offsetX: offsetX ?? 0 })}
              />
              <PxSpinField
                tag="Y"
                value={boxShadow.offsetY}
                onChange={(offsetY) => updateBoxShadow({ offsetY: offsetY ?? 0 })}
              />
            </div>
          </InspectorRow>
          <InspectorRow label={t`羽化`}>
            <div className={styles.pairGroup}>
              <PxSpinField
                tag={t`模糊`}
                min={0}
                value={boxShadow.blur}
                onChange={(blur) => updateBoxShadow({ blur: blur ?? 0 })}
              />
              <PxSpinField
                tag={t`扩展`}
                value={boxShadow.spread ?? 0}
                onChange={(spread) => updateBoxShadow({ spread: spread ?? 0 })}
              />
            </div>
          </InspectorRow>
          <InspectorRow label={t`影色`}>
            <CompactColorField
              color={boxShadow.color || '#00000080'}
              onChange={(color) => updateBoxShadow({ color }, true)}
            />
          </InspectorRow>
        </>
      )}

      <InspectorRow label={t`不透明`}>
        <PxSpinField
          step={0.05}
          min={0}
          max={1}
          value={opacity}
          placeholder="1"
          onChange={(nextOpacity) => onPatch('opacity', nextOpacity)}
        />
      </InspectorRow>
    </div>
  );
}
