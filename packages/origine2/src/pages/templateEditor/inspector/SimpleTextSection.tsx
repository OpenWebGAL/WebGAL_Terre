import { Input, Select, Switch } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import type {
  ColorOrGradientValue,
  ShadowValue,
  SimpleStyleModel,
  TextStrokeValue,
} from '../styleModel';
import { CompactColorField, InspectorRow, PxSpinField } from './SimpleFieldHelpers';
import styles from './inspectorCommon.module.scss';

export interface ISimpleSectionProps {
  model: SimpleStyleModel;
  onPatch: <K extends keyof SimpleStyleModel>(
    group: K,
    value: SimpleStyleModel[K],
    immediateCommit?: boolean,
  ) => void;
}

export function SimpleTextSection({ model, onPatch }: ISimpleSectionProps) {
  const { textFill, textStroke, textShadow } = model;

  const updateFillMode = (mode: ColorOrGradientValue['mode']) => {
    if (mode === 'none') {
      onPatch('textFill', { mode: 'none' }, true);
    } else if (mode === 'solid') {
      onPatch('textFill', {
        mode: 'solid',
        solidColor: textFill.solidColor || textFill.startColor || '#FFFFFFFF',
      }, true);
    } else {
      onPatch('textFill', {
        mode: 'gradient',
        angle: textFill.angle ?? 180,
        startColor: textFill.startColor || textFill.solidColor || '#FFFFFFFF',
        endColor: textFill.endColor || '#8EC5FCFF',
      }, true);
    }
  };

  const updateStroke = (patch: Partial<TextStrokeValue>, commit = false) => {
    onPatch('textStroke', { ...textStroke, ...patch }, commit);
  };

  const updateTextShadow = (patch: Partial<ShadowValue>, commit = false) => {
    onPatch('textShadow', { ...textShadow, ...patch }, commit);
  };

  return (
    <div className={styles.section}>
      <InspectorRow label={t`字色`}>
        <Select
          size="small"
          value={textFill.mode}
          onChange={(_, data) => updateFillMode(data.value as ColorOrGradientValue['mode'])}
        >
          <option value="none">{t`继承`}</option>
          <option value="solid">{t`纯色`}</option>
          <option value="gradient">{t`渐变`}</option>
        </Select>
      </InspectorRow>

      {textFill.mode === 'solid' && (
        <InspectorRow label={t`颜色`}>
          <CompactColorField
            color={textFill.solidColor || '#FFFFFFFF'}
            onChange={(solidColor) => onPatch('textFill', { ...textFill, solidColor }, true)}
          />
        </InspectorRow>
      )}

      {textFill.mode === 'gradient' && (
        <>
          <InspectorRow label={t`角度`}>
            <PxSpinField
              value={textFill.angle ?? 180}
              min={0}
              max={360}
              onChange={(angle) => onPatch('textFill', { ...textFill, angle: angle ?? 180 })}
            />
            <span className={styles.unitTag}>deg</span>
          </InspectorRow>
          <InspectorRow label={t`起色`}>
            <CompactColorField
              color={textFill.startColor || '#FFFFFFFF'}
              onChange={(startColor) => onPatch('textFill', { ...textFill, startColor }, true)}
            />
          </InspectorRow>
          <InspectorRow label={t`终色`}>
            <CompactColorField
              color={textFill.endColor || '#8EC5FCFF'}
              onChange={(endColor) => onPatch('textFill', { ...textFill, endColor }, true)}
            />
          </InspectorRow>
        </>
      )}

      <InspectorRow label={t`字号`}>
        <div className={styles.pairGroup}>
          <PxSpinField
            tag="px"
            min={8}
            value={model.fontSizePx}
            placeholder="28"
            onChange={(fontSizePx) => onPatch('fontSizePx', fontSizePx)}
          />
          <Select
            size="small"
            value={model.fontWeight || ''}
            onChange={(_, data) => onPatch('fontWeight', data.value || undefined, true)}
          >
            <option value="">{t`默认字重`}</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="bold">bold</option>
          </Select>
        </div>
      </InspectorRow>

      <InspectorRow label={t`排版`}>
        <div className={styles.pairGroup}>
          <Input
            size="small"
            placeholder={t`行高`}
            value={model.lineHeight ?? ''}
            onChange={(_, data) => onPatch('lineHeight', data.value || undefined)}
          />
          <PxSpinField
            tag={t`字距`}
            value={model.letterSpacingPx}
            placeholder="0"
            onChange={(letterSpacingPx) => onPatch('letterSpacingPx', letterSpacingPx)}
          />
        </div>
      </InspectorRow>

      <InspectorRow label={t`描边`}>
        <Switch
          checked={textStroke.enabled}
          onChange={(_, data) => updateStroke({ enabled: data.checked }, true)}
        />
        {textStroke.enabled && (
          <PxSpinField
            tag="px"
            min={0}
            value={textStroke.widthPx}
            onChange={(widthPx) => updateStroke({ widthPx: widthPx ?? 0 })}
          />
        )}
      </InspectorRow>
      {textStroke.enabled && (
        <InspectorRow label={t`描边色`}>
          <CompactColorField
            color={textStroke.color || '#000000FF'}
            onChange={(color) => updateStroke({ color }, true)}
          />
        </InspectorRow>
      )}

      <InspectorRow label={t`字影`}>
        <Switch
          checked={textShadow.enabled}
          onChange={(_, data) => updateTextShadow({ enabled: data.checked }, true)}
        />
      </InspectorRow>
      {textShadow.enabled && (
        <>
          <InspectorRow label={t`偏移`}>
            <div className={styles.pairGroup}>
              <PxSpinField
                tag="X"
                value={textShadow.offsetX}
                onChange={(offsetX) => updateTextShadow({ offsetX: offsetX ?? 0 })}
              />
              <PxSpinField
                tag="Y"
                value={textShadow.offsetY}
                onChange={(offsetY) => updateTextShadow({ offsetY: offsetY ?? 0 })}
              />
            </div>
          </InspectorRow>
          <InspectorRow label={t`模糊`}>
            <PxSpinField
              tag="px"
              min={0}
              value={textShadow.blur}
              onChange={(blur) => updateTextShadow({ blur: blur ?? 0 })}
            />
          </InspectorRow>
          <InspectorRow label={t`影色`}>
            <CompactColorField
              color={textShadow.color || '#00000080'}
              onChange={(color) => updateTextShadow({ color }, true)}
            />
          </InspectorRow>
        </>
      )}
    </div>
  );
}
