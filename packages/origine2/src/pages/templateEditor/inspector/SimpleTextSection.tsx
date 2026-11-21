import { Button, Input, Select, Switch } from '@fluentui/react-components';
import { AddRegular, DismissRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import type {
  ColorOrGradientValue,
  GradientColorStop,
  ShadowValue,
  SimpleStyleModel,
  TextStrokeValue,
} from '../styleModel';
import { CompactColorField, InspectorRow, PxSpinField } from './SimpleFieldHelpers';
import styles from './inspectorCommon.module.scss';

export function resolveGradientStops(
  stops: GradientColorStop[] | undefined,
  fallbackStart: string,
  fallbackEnd: string,
): GradientColorStop[] {
  if (stops && stops.length >= 2) return stops;
  return [{ color: fallbackStart, position: 0 }, { color: fallbackEnd, position: 100 }];
}

function insertMiddleStop(stops: GradientColorStop[]): GradientColorStop[] {
  const effectivePos = (idx: number) =>
    stops[idx].position ?? Math.round((idx / Math.max(1, stops.length - 1)) * 100);

  let bestIndex = 0;
  let bestSpan = -1;
  for (let i = 0; i < stops.length - 1; i += 1) {
    const span = Math.abs(effectivePos(i + 1) - effectivePos(i));
    if (span > bestSpan) {
      bestSpan = span;
      bestIndex = i;
    }
  }

  const midPos = Math.round((effectivePos(bestIndex) + effectivePos(bestIndex + 1)) / 2);
  const nextStops = [...stops];
  nextStops.splice(bestIndex + 1, 0, { color: stops[bestIndex].color, position: midPos });
  return nextStops;
}

interface ILinearGradientFieldsProps {
  angle: number;
  stops: GradientColorStop[];
  onChange: (angle: number, stops: GradientColorStop[], commit: boolean) => void;
}

export function LinearGradientFields({ angle, stops, onChange }: ILinearGradientFieldsProps) {
  const updateStop = (index: number, patch: Partial<GradientColorStop>, commit: boolean) => {
    const nextStops = stops.map((stop, i) => (i === index ? { ...stop, ...patch } : stop));
    onChange(angle, nextStops, commit);
  };

  return (
    <>
      <InspectorRow label={t`角度`}>
        <PxSpinField
          value={angle}
          min={0}
          max={360}
          onChange={(nextAngle) => onChange(nextAngle ?? 180, stops, false)}
        />
        <span className={styles.unitTag}>deg</span>
        <div className={styles.barSpacer} />
        <Button
          size="small"
          appearance="subtle"
          icon={<AddRegular />}
          title={t`添加色标`}
          onClick={() => onChange(angle, insertMiddleStop(stops), true)}
        />
      </InspectorRow>
      {stops.map((stop, idx) => (
        <InspectorRow key={idx} label={`#${idx + 1}`}>
          <div className={styles.gradientStopRow}>
            <div className={styles.gradientStopColor}>
              <CompactColorField
                color={stop.color}
                onChange={(color) => updateStop(idx, { color }, true)}
              />
            </div>
            <div className={styles.gradientStopPos}>
              <PxSpinField
                tag="%"
                min={0}
                max={100}
                placeholder={String(Math.round((idx / Math.max(1, stops.length - 1)) * 100))}
                value={stop.position}
                onChange={(pos) => updateStop(idx, { position: pos, rawPosition: undefined }, false)}
              />
            </div>
            {stops.length > 2 && (
              <Button
                size="small"
                appearance="subtle"
                icon={<DismissRegular />}
                onClick={() => onChange(angle, stops.filter((_, i) => i !== idx), true)}
              />
            )}
          </div>
        </InspectorRow>
      ))}
    </>
  );
}

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
    if (mode === 'custom') return;
    if (mode === 'none') {
      onPatch('textFill', { mode: 'none' }, true);
    } else if (mode === 'solid') {
      onPatch('textFill', {
        mode: 'solid',
        solidColor: textFill.solidColor || textFill.stops?.[0]?.color || textFill.startColor || '#FFFFFFFF',
      }, true);
    } else {
      const stops = resolveGradientStops(
        textFill.stops,
        textFill.startColor || textFill.solidColor || '#FFFFFFFF',
        textFill.endColor || '#8EC5FCFF',
      );
      onPatch('textFill', {
        mode: 'gradient',
        angle: textFill.angle ?? 180,
        stops,
        startColor: stops[0].color,
        endColor: stops[stops.length - 1].color,
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
      <div className={styles.sectionTitle}>{t`文字样式`}</div>
      <InspectorRow label={t`字色`}>
        <Select
          size="small"
          value={textFill.mode}
          onChange={(_, data) => updateFillMode(data.value as ColorOrGradientValue['mode'])}
        >
          <option value="none">{t`继承`}</option>
          <option value="solid">{t`纯色`}</option>
          <option value="gradient">{t`渐变`}</option>
          {textFill.mode === 'custom' && <option value="custom">{t`自定义 (CSS)`}</option>}
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
        <LinearGradientFields
          angle={textFill.angle ?? 180}
          stops={resolveGradientStops(
            textFill.stops,
            textFill.startColor || '#FFFFFFFF',
            textFill.endColor || '#8EC5FCFF',
          )}
          onChange={(angle, stops, commit) =>
            onPatch('textFill', {
              mode: 'gradient',
              angle,
              stops,
              startColor: stops[0]?.color,
              endColor: stops[stops.length - 1]?.color,
            }, commit)
          }
        />
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
