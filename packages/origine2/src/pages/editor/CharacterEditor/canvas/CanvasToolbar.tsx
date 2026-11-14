import { Button, SpinButton } from '@fluentui/react-components';
import { ZoomInRegular, ZoomOutRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { ICharacterCanvas } from '../model/characterDocument';
import styles from './characterCanvas.module.scss';

interface ICanvasToolbarProps {
  width: number;
  height: number;
  zoom: number;
  onCanvasChange: (canvas: ICharacterCanvas) => void;
  onZoomBy: (factor: number) => void;
  onFitToViewport: () => void;
}

function parseSpinInt(value: number | null | undefined, displayValue: string | undefined): number | null {
  const next = value ?? Number(displayValue);
  if (!Number.isFinite(next)) return null;
  return Math.min(8192, Math.max(1, Math.round(next)));
}

/**
 * 画布顶部工具栏：画布宽高输入与缩放百分比控制
 */
export function CanvasToolbar({ width, height, zoom, onCanvasChange, onZoomBy, onFitToViewport }: ICanvasToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.sizeGroup}>
        <SpinButton
          className={styles.sizeInput}
          size="small"
          appearance="filled-darker"
          min={1}
          max={8192}
          step={10}
          value={width}
          onChange={(_, data) => {
            const nextWidth = parseSpinInt(data.value, data.displayValue);
            if (nextWidth !== null) onCanvasChange({ width: nextWidth, height });
          }}
        />
        <span className={styles.times}>×</span>
        <SpinButton
          className={styles.sizeInput}
          size="small"
          appearance="filled-darker"
          min={1}
          max={8192}
          step={10}
          value={height}
          onChange={(_, data) => {
            const nextHeight = parseSpinInt(data.value, data.displayValue);
            if (nextHeight !== null) onCanvasChange({ width, height: nextHeight });
          }}
        />
      </div>
      <div className={styles.zoomGroup}>
        <Button
          size="small"
          appearance="subtle"
          icon={<ZoomOutRegular />}
          title={t`缩小`}
          onClick={() => onZoomBy(0.8)}
        />
        <Button className={styles.zoomButton} size="small" appearance="subtle" title={t`适配画布`} onClick={onFitToViewport}>
          {Math.round(zoom * 100)}%
        </Button>
        <Button
          size="small"
          appearance="subtle"
          icon={<ZoomInRegular />}
          title={t`放大`}
          onClick={() => onZoomBy(1.25)}
        />
      </div>
    </div>
  );
}
