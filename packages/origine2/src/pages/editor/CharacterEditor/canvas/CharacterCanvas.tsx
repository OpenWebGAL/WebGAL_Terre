import { PointerEvent, useMemo, useRef, useState } from 'react';
import {
  buildFigureAssetUrl,
  ICharacterCanvas,
  ICharacterComponent,
  ICharacterLayer,
  resolveComponentScale,
} from '../model/characterDocument';
import { CanvasToolbar } from './CanvasToolbar';
import { findHitLayer, inferCanvasSize, INaturalSize, resolveLayerMetrics } from './hitTestLayer';
import { LayerTransformGizmo } from './LayerTransformGizmo';
import { useCanvasViewport } from './useCanvasViewport';
import styles from './characterCanvas.module.scss';

interface ICharacterCanvasProps {
  charDirPath: string;
  canvas?: ICharacterCanvas;
  layers: ICharacterLayer[];
  visibleKeys: Set<string>;
  selectedLayerKey: string | null;
  naturalSizes: Record<string, INaturalSize>;
  onImageLoad: (url: string, size: INaturalSize) => void;
  onCanvasChange: (canvas: ICharacterCanvas) => void;
  onSelectLayer: (key: string | null) => void;
  onUpdateLayer: (key: string, updater: (comp: ICharacterComponent) => ICharacterComponent) => void;
}

type DragState =
  | { kind: 'pan'; lastClientX: number; lastClientY: number }
  | { kind: 'layer'; layerKey: string; startClientX: number; startClientY: number; startX: number; startY: number };

/**
 * 左侧交互画布：画布尺寸、缩放控制、透明像素穿透选层与拖拽定位
 */
export function CharacterCanvas(props: ICharacterCanvasProps) {
  const {
    charDirPath,
    canvas,
    layers,
    visibleKeys,
    selectedLayerKey,
    naturalSizes,
    onImageLoad,
    onCanvasChange,
    onSelectLayer,
    onUpdateLayer,
  } = props;
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgElementsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const dragRef = useRef<DragState | null>(null);
  const [dragKind, setDragKind] = useState<'pan' | 'layer' | null>(null);

  const effectiveCanvas = useMemo(
    () => canvas ?? inferCanvasSize(layers, naturalSizes, charDirPath),
    [canvas, layers, naturalSizes, charDirPath],
  );
  const { view, spacePressed, fitToViewport, zoomBy, panBy, markInteracted } = useCanvasViewport(
    viewportRef,
    effectiveCanvas,
    canvas === undefined,
  );

  const bottomToTopVisible = useMemo(
    () => [...layers].reverse().filter((layer) => visibleKeys.has(layer.key)),
    [layers, visibleKeys],
  );

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.key === selectedLayerKey && visibleKeys.has(layer.key)) ?? null,
    [layers, selectedLayerKey, visibleKeys],
  );
  const selectedAssetUrl = selectedLayer ? buildFigureAssetUrl(charDirPath, selectedLayer.component.src) : null;
  const selectedMetrics = useMemo(() => {
    if (!selectedLayer || !selectedAssetUrl) return null;
    return resolveLayerMetrics(selectedLayer.component, naturalSizes[selectedAssetUrl]);
  }, [selectedLayer, selectedAssetUrl, naturalSizes]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const isPanGesture = event.button === 1 || (spacePressed && event.button === 0);
    if (isPanGesture) {
      viewport.setPointerCapture(event.pointerId);
      dragRef.current = { kind: 'pan', lastClientX: event.clientX, lastClientY: event.clientY };
      setDragKind('pan');
      return;
    }
    if (event.button !== 0) return;

    const rect = viewport.getBoundingClientRect();
    const stageX = (event.clientX - rect.left - view.panX) / view.zoom;
    const stageY = (event.clientY - rect.top - view.panY) / view.zoom;
    const hit = findHitLayer({
      layers,
      visibleKeys,
      naturalSizes,
      imgElements: imgElementsRef.current,
      charDirPath,
      stageX,
      stageY,
    });
    viewport.setPointerCapture(event.pointerId);
    if (hit) {
      markInteracted();
      onSelectLayer(hit.key);
      dragRef.current = {
        kind: 'layer',
        layerKey: hit.key,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: hit.component.x ?? 0,
        startY: hit.component.y ?? 0,
      };
      setDragKind('layer');
    } else {
      dragRef.current = { kind: 'pan', lastClientX: event.clientX, lastClientY: event.clientY };
      setDragKind('pan');
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === 'pan') {
      panBy(event.clientX - drag.lastClientX, event.clientY - drag.lastClientY);
      drag.lastClientX = event.clientX;
      drag.lastClientY = event.clientY;
      return;
    }
    const dx = Math.round((event.clientX - drag.startClientX) / view.zoom);
    const dy = Math.round((event.clientY - drag.startClientY) / view.zoom);
    onUpdateLayer(drag.layerKey, (comp) => ({ ...comp, x: drag.startX + dx, y: drag.startY + dy }));
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragKind(null);
  };

  const cursor = dragKind === 'pan' ? 'grabbing' : dragKind === 'layer' ? 'move' : spacePressed ? 'grab' : 'default';

  return (
    <div className={styles.root}>
      <CanvasToolbar
        width={effectiveCanvas.width}
        height={effectiveCanvas.height}
        zoom={view.zoom}
        onCanvasChange={onCanvasChange}
        onZoomBy={zoomBy}
        onFitToViewport={fitToViewport}
      />

      <div
        ref={viewportRef}
        className={styles.viewport}
        style={{ cursor }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className={styles.stage}
          style={{
            width: effectiveCanvas.width,
            height: effectiveCanvas.height,
            transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom})`,
            boxShadow: `0 0 0 ${1 / view.zoom}px var(--black-15pct)`,
          }}
        >
          {bottomToTopVisible.map((layer) => {
            const comp = layer.component;
            const url = buildFigureAssetUrl(charDirPath, comp.src);
            const metrics = resolveLayerMetrics(comp, naturalSizes[url]);
            const { scaleX, scaleY } = resolveComponentScale(comp);
            const rotation = comp.rotation ?? 0;
            const fallbackTransform = [
              rotation ? `rotate(${rotation}rad)` : '',
              scaleX !== 1 || scaleY !== 1 ? `scale(${scaleX}, ${scaleY})` : '',
            ].filter(Boolean).join(' ');
            return (
              <img
                key={layer.key}
                ref={(el) => {
                  if (el) imgElementsRef.current.set(layer.key, el);
                  else imgElementsRef.current.delete(layer.key);
                }}
                className={styles.layerImage}
                src={url}
                alt={layer.key}
                draggable={false}
                style={{
                  left: metrics ? metrics.left : (comp.x ?? 0),
                  top: metrics ? metrics.top : (comp.y ?? 0),
                  ...(metrics
                    ? {
                      width: metrics.width,
                      height: metrics.height,
                      ...(metrics.rotation ? { transform: `rotate(${metrics.rotation}rad)`, transformOrigin: '50% 50%' } : {}),
                    }
                    : fallbackTransform
                      ? { transform: fallbackTransform, transformOrigin: '0 0' }
                      : {}),
                }}
                onLoad={(e) =>
                  onImageLoad(url, { width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })
                }
              />
            );
          })}
        </div>
        {selectedLayer && selectedMetrics && (
          <LayerTransformGizmo
            component={selectedLayer.component}
            metrics={selectedMetrics}
            naturalSize={selectedAssetUrl ? naturalSizes[selectedAssetUrl] : undefined}
            view={view}
            viewportRef={viewportRef}
            onStartInteract={markInteracted}
            onUpdate={(updater) => onUpdateLayer(selectedLayer.key, updater)}
          />
        )}
      </div>
    </div>
  );
}
