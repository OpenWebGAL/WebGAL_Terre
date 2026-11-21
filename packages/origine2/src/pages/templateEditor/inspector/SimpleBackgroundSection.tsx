import { Select, Switch } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import type {
  BackdropBlurValue,
  BackgroundFillValue,
  BorderImage9SliceValue,
  MaskFadeValue,
  SimpleStyleModel,
} from '../styleModel';
import {
  AssetImageField,
  CompactColorField,
  InspectorRow,
  PxSpinField,
} from './SimpleFieldHelpers';
import { LinearGradientFields, resolveGradientStops } from './SimpleTextSection';
import styles from './inspectorCommon.module.scss';

interface ISimpleBackgroundSectionProps {
  model: SimpleStyleModel;
  templateDir: string;
  scssPath?: string | null;
  onPatch: <K extends keyof SimpleStyleModel>(
    group: K,
    value: SimpleStyleModel[K],
    immediateCommit?: boolean,
  ) => void;
}

export function SimpleBackgroundSection({
  model,
  templateDir,
  scssPath,
  onPatch,
}: ISimpleBackgroundSectionProps) {
  const { background, borderImage, maskFade, backdropBlur } = model;

  const updateBgMode = (mode: BackgroundFillValue['mode']) => {
    if (mode === 'custom') return;
    if (mode === 'none') {
      onPatch('background', { mode: 'none' }, true);
    } else if (mode === 'solid') {
      onPatch('background', {
        mode: 'solid',
        solidColor: background.solidColor || background.stops?.[0]?.color || background.startColor || '#00000080',
      }, true);
    } else if (mode === 'gradient') {
      const stops = resolveGradientStops(
        background.stops,
        background.startColor || background.solidColor || '#00000099',
        background.endColor || '#00000033',
      );
      onPatch('background', {
        mode: 'gradient',
        angle: background.angle ?? 180,
        stops,
        startColor: stops[0].color,
        endColor: stops[stops.length - 1].color,
      }, true);
    } else {
      onPatch('background', {
        mode: 'image',
        imageUrl: background.imageUrl || '',
        size: background.size || '100% 100%',
        repeat: background.repeat || 'no-repeat',
        position: background.position || 'center',
      }, true);
    }
  };

  const updateBorderImage = (patch: Partial<BorderImage9SliceValue>, commit = false) => {
    onPatch('borderImage', { ...borderImage, ...patch }, commit);
  };

  const updateMaskFade = (patch: Partial<MaskFadeValue>, commit = false) => {
    onPatch('maskFade', { ...maskFade, ...patch }, commit);
  };

  const updateBackdropBlur = (patch: Partial<BackdropBlurValue>, commit = false) => {
    onPatch('backdropBlur', { ...backdropBlur, ...patch }, commit);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{t`背景与材质`}</div>
      <InspectorRow label={t`背景`}>
        <Select
          size="small"
          value={background.mode}
          onChange={(_, data) => updateBgMode(data.value as BackgroundFillValue['mode'])}
        >
          <option value="none">{t`无`}</option>
          <option value="solid">{t`纯色`}</option>
          <option value="gradient">{t`渐变`}</option>
          <option value="image">{t`图片`}</option>
          {background.mode === 'custom' && <option value="custom">{t`自定义 (CSS)`}</option>}
        </Select>
      </InspectorRow>

      {background.mode === 'solid' && (
        <InspectorRow label={t`颜色`}>
          <CompactColorField
            color={background.solidColor || '#00000080'}
            onChange={(solidColor) => onPatch('background', { ...background, solidColor }, true)}
          />
        </InspectorRow>
      )}

      {background.mode === 'gradient' && (
        <LinearGradientFields
          angle={background.angle ?? 180}
          stops={resolveGradientStops(
            background.stops,
            background.startColor || '#00000099',
            background.endColor || '#00000033',
          )}
          onChange={(angle, stops, commit) =>
            onPatch('background', {
              mode: 'gradient',
              angle,
              stops,
              startColor: stops[0]?.color,
              endColor: stops[stops.length - 1]?.color,
            }, commit)
          }
        />
      )}

      {background.mode === 'image' && (
        <>
          <InspectorRow label={t`图片`}>
            <AssetImageField
              value={background.imageUrl}
              templateDir={templateDir}
              scssPath={scssPath}
              onChange={(imageUrl) => onPatch('background', { ...background, imageUrl }, true)}
              onClear={() => onPatch('background', { ...background, imageUrl: '' }, true)}
            />
          </InspectorRow>
          <InspectorRow label={t`填充`}>
            <div className={styles.pairGroup}>
              <Select
                size="small"
                value={background.size || '100% 100%'}
                onChange={(_, data) => onPatch('background', { ...background, size: data.value }, true)}
              >
                <option value="100% 100%">{t`拉伸`}</option>
                <option value="cover">{t`覆盖`}</option>
                <option value="contain">{t`包含`}</option>
                <option value="auto">{t`原尺寸`}</option>
              </Select>
              <Select
                size="small"
                value={background.position || 'center'}
                onChange={(_, data) => onPatch('background', { ...background, position: data.value }, true)}
              >
                <option value="center">{t`居中`}</option>
                <option value="top">{t`靠上`}</option>
                <option value="bottom">{t`靠下`}</option>
                <option value="left">{t`靠左`}</option>
                <option value="right">{t`靠右`}</option>
              </Select>
            </div>
          </InspectorRow>
        </>
      )}

      <InspectorRow label={t`九宫格`}>
        <Switch
          checked={borderImage.enabled}
          onChange={(_, data) => updateBorderImage({ enabled: data.checked }, true)}
        />
      </InspectorRow>
      {borderImage.enabled && (
        <>
          <InspectorRow label={t`底框图`}>
            <AssetImageField
              value={borderImage.imageUrl}
              templateDir={templateDir}
              scssPath={scssPath}
              onChange={(imageUrl) => updateBorderImage({ imageUrl }, true)}
              onClear={() => updateBorderImage({ imageUrl: '' }, true)}
            />
          </InspectorRow>
          <InspectorRow label={t`切片`}>
            <div className={styles.quadGroup}>
              <PxSpinField
                min={0}
                value={borderImage.sliceTop}
                onChange={(v) => updateBorderImage({ sliceTop: v ?? 0 })}
              />
              <PxSpinField
                min={0}
                value={borderImage.sliceRight}
                onChange={(v) => updateBorderImage({ sliceRight: v ?? 0 })}
              />
              <PxSpinField
                min={0}
                value={borderImage.sliceBottom}
                onChange={(v) => updateBorderImage({ sliceBottom: v ?? 0 })}
              />
              <PxSpinField
                min={0}
                value={borderImage.sliceLeft}
                onChange={(v) => updateBorderImage({ sliceLeft: v ?? 0 })}
              />
            </div>
          </InspectorRow>
          <InspectorRow label={t`边框宽`}>
            <div className={styles.pairGroup}>
              <PxSpinField
                tag="px"
                min={0}
                value={borderImage.widthPx}
                onChange={(widthPx) => updateBorderImage({ widthPx: widthPx ?? 0 })}
              />
              <Select
                size="small"
                value={borderImage.repeat}
                onChange={(_, data) =>
                  updateBorderImage({ repeat: data.value as BorderImage9SliceValue['repeat'] }, true)
                }
              >
                <option value="stretch">{t`拉伸`}</option>
                <option value="repeat">{t`平铺`}</option>
                <option value="round">{t`环绕`}</option>
              </Select>
            </div>
            <Switch
              checked={borderImage.fill}
              onChange={(_, data) => updateBorderImage({ fill: data.checked }, true)}
            />
          </InspectorRow>
        </>
      )}

      <InspectorRow label={t`渐隐`}>
        <Switch
          checked={maskFade.enabled}
          onChange={(_, data) => updateMaskFade({ enabled: data.checked }, true)}
        />
        {maskFade.enabled && (
          <Select
            size="small"
            value={maskFade.direction}
            onChange={(_, data) =>
              updateMaskFade({ direction: data.value as MaskFadeValue['direction'] }, true)
            }
          >
            <option value="to bottom">{t`向下`}</option>
            <option value="to top">{t`向上`}</option>
            <option value="to right">{t`向右`}</option>
            <option value="to left">{t`向左`}</option>
          </Select>
        )}
      </InspectorRow>
      {maskFade.enabled && (
        <InspectorRow label={t`起止`}>
          <div className={styles.pairGroup}>
            <PxSpinField
              tag="%"
              min={0}
              max={100}
              value={maskFade.startPercent}
              onChange={(startPercent) => updateMaskFade({ startPercent: startPercent ?? 0 })}
            />
            <PxSpinField
              tag="%"
              min={0}
              max={100}
              value={maskFade.endPercent}
              onChange={(endPercent) => updateMaskFade({ endPercent: endPercent ?? 100 })}
            />
          </div>
        </InspectorRow>
      )}

      <InspectorRow label={t`毛玻璃`}>
        <Switch
          checked={backdropBlur.enabled}
          onChange={(_, data) => updateBackdropBlur({ enabled: data.checked }, true)}
        />
        {backdropBlur.enabled && (
          <PxSpinField
            tag="px"
            min={0}
            value={backdropBlur.blurPx}
            onChange={(blurPx) => updateBackdropBlur({ blurPx: blurPx ?? 0 })}
          />
        )}
      </InspectorRow>
      {backdropBlur.enabled && (
        <InspectorRow label={t`叠色`}>
          <CompactColorField
            color={backdropBlur.tintColor || 'transparent'}
            onChange={(tintColor) => updateBackdropBlur({ tintColor }, true)}
          />
        </InspectorRow>
      )}
    </div>
  );
}
