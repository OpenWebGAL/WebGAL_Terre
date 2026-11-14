import { PointerEvent, RefObject, useRef, useState } from 'react';
import { ICharacterComponent, resolveComponentScale } from '../model/characterDocument';
import {
  applyResizedComponent,
  computeNextRotation,
  computeResizedBox,
  getResizeCursor,
  GizmoDragState,
  RESIZE_HANDLES,
  toStagePoint,
} from './gizmoTransform';
import { ILayerMetrics, INaturalSize } from './hitTestLayer';
import { IViewportState } from './useCanvasViewport';
import styles from './characterCanvas.module.scss';

interface ILayerTransformGizmoProps {
  component: ICharacterComponent;
  metrics: ILayerMetrics;
  naturalSize?: INaturalSize;
  view: IViewportState;
  viewportRef: RefObject<HTMLDivElement>;
  onStartInteract: () => void;
  onUpdate: (updater: (comp: ICharacterComponent) => ICharacterComponent) => void;
}

/**
 * 视口屏幕空间变换控制框：提供 8 向缩放手柄（角点等比、边点单轴）与中心旋转手柄
 */
export function LayerTransformGizmo(props: ILayerTransformGizmoProps) {
  const { component, metrics, naturalSize, view, viewportRef, onStartInteract, onUpdate } = props;
  const dragRef = useRef<GizmoDragState | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  const cx = metrics.left + metrics.width / 2;
  const cy = metrics.top + metrics.height / 2;
  const screenW = metrics.width * view.zoom;
  const screenH = metrics.height * view.zoom;
  const screenLeft = view.panX + cx * view.zoom - screenW / 2;
  const screenTop = view.panY + cy * view.zoom - screenH / 2;

  const startRotate = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const stage = toStagePoint(event.clientX, event.clientY, { viewport: viewportRef.current, view });
    if (!stage) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onStartInteract();
    dragRef.current = {
      kind: 'rotate',
      c0: { x: cx, y: cy },
      r0: metrics.rotation,
      startAngle: Math.atan2(stage.y - cy, stage.x - cx),
    };
    setIsRotating(true);
  };

  const startResize = (hx: -1 | 0 | 1, hy: -1 | 0 | 1) => (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onStartInteract();
    const ux = { x: Math.cos(metrics.rotation), y: Math.sin(metrics.rotation) };
    const uy = { x: -Math.sin(metrics.rotation), y: Math.cos(metrics.rotation) };
    const { scaleX, scaleY } = resolveComponentScale(component);
    dragRef.current = {
      kind: 'resize',
      hx,
      hy,
      w0: metrics.width,
      h0: metrics.height,
      ux,
      uy,
      anchor: {
        x: cx - ux.x * ((hx * metrics.width) / 2) - uy.x * ((hy * metrics.height) / 2),
        y: cy - ux.y * ((hx * metrics.width) / 2) - uy.y * ((hy * metrics.height) / 2),
      },
      uniformScale: scaleX === scaleY,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const stage = toStagePoint(event.clientX, event.clientY, { viewport: viewportRef.current, view });
    if (!stage) return;
    event.stopPropagation();
    if (drag.kind === 'rotate') {
      const rotation = computeNextRotation(stage, drag, event.shiftKey);
      onUpdate((prev) => ({ ...prev, rotation }));
      return;
    }
    const box = computeResizedBox(stage, drag);
    const isCorner = drag.hx !== 0 && drag.hy !== 0;
    onUpdate((prev) =>
      applyResizedComponent(prev, box, { isCorner, uniformScale: drag.uniformScale, naturalSize }),
    );
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    event.stopPropagation();
    dragRef.current = null;
    setIsRotating(false);
  };

  return (
    <div
      className={styles.gizmo}
      style={{
        left: screenLeft,
        top: screenTop,
        width: screenW,
        height: screenH,
        transform: `rotate(${metrics.rotation}rad)`,
      }}
    >
      <div className={styles.rotateStem} />
      <div
        className={styles.rotateHandle}
        style={{ cursor: isRotating ? 'grabbing' : 'grab' }}
        onPointerDown={startRotate}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
      {RESIZE_HANDLES.map(({ id, hx, hy }) => (
        <div
          key={id}
          className={styles.resizeHandle}
          style={{
            left: `${(hx + 1) * 50}%`,
            top: `${(hy + 1) * 50}%`,
            cursor: getResizeCursor(hx, hy, metrics.rotation),
          }}
          onPointerDown={startResize(hx, hy)}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      ))}
    </div>
  );
}
