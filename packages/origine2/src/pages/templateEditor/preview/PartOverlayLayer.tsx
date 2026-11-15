import { useEffect, useMemo, useRef } from 'react';
import { throttle } from 'lodash';
import Moveable from 'react-moveable';
import type { UiPartDescriptor } from '@webgal/editor-preview-protocol';
import { applyPartLayoutPatch, parsePartLayout, type LayoutFields } from '../styleModel';
import styles from './partOverlayLayer.module.scss';

const LOGICAL_STAGE_WIDTH = 2560;
const LOGICAL_STAGE_HEIGHT = 1440;

interface IPartOverlayLayerProps {
  parts: UiPartDescriptor[];
  selectedPartId: string | null;
  stageWidth: number;
  stageHeight: number;
  scssText: string;
  onSelectPart: (partId: string) => void;
  onPreviewScss: (nextScss: string) => void;
  onCommitScss: (nextScss: string) => void;
}

interface DragSnapshot {
  left: number;
  top: number;
  hasLeft: boolean;
  hasTop: boolean;
}

export function PartOverlayLayer({
  parts,
  selectedPartId,
  stageWidth,
  stageHeight,
  scssText,
  onSelectPart,
  onPreviewScss,
  onCommitScss,
}: IPartOverlayLayerProps) {
  const scaleX = stageWidth > 0 ? stageWidth / LOGICAL_STAGE_WIDTH : 0;
  const scaleY = stageHeight > 0 ? stageHeight / LOGICAL_STAGE_HEIGHT : 0;
  const scale = Math.min(scaleX, scaleY);

  const selectedPart = useMemo(
    () => parts.find((part) => part.id === selectedPartId) ?? null,
    [parts, selectedPartId],
  );

  const sortedParts = useMemo(
    () =>
      [...parts]
        .filter((part): part is UiPartDescriptor & { box: NonNullable<UiPartDescriptor['box']> } => Boolean(part.box))
        .sort((a, b) => b.box.width * b.box.height - a.box.width * a.box.height),
    [parts],
  );

  const smallestFirstParts = useMemo(() => [...sortedParts].reverse(), [sortedParts]);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const moveableRef = useRef<Moveable | null>(null);
  const latestScssRef = useRef(scssText);
  latestScssRef.current = scssText;

  const previewCallbackRef = useRef(onPreviewScss);
  previewCallbackRef.current = onPreviewScss;

  const throttledPreview = useMemo(
    () => throttle((next: string) => previewCallbackRef.current(next), 40),
    [],
  );

  useEffect(() => () => throttledPreview.cancel(), [throttledPreview]);

  const dragSnapshotRef = useRef<DragSnapshot | null>(null);
  const pendingScssRef = useRef<string | null>(null);
  const isInteractingRef = useRef(false);

  const selectedBox = useMemo(() => {
    if (!selectedPart?.box || scale <= 0) return null;
    return {
      left: selectedPart.box.x * scale,
      top: selectedPart.box.y * scale,
      width: Math.max(8, selectedPart.box.width * scale),
      height: Math.max(8, selectedPart.box.height * scale),
    };
  }, [selectedPart, scale]);

  useEffect(() => {
    if (!isInteractingRef.current) {
      if (targetRef.current) {
        targetRef.current.style.transform = 'translate(0px, 0px)';
      }
      moveableRef.current?.updateRect();
    }
  }, [selectedBox]);

  const captureSnapshot = (part: UiPartDescriptor): DragSnapshot => {
    const parsed = parsePartLayout(latestScssRef.current, part.selector);
    return {
      left: parsed.left ?? Math.round(part.box?.x ?? 0),
      top: parsed.top ?? Math.round(part.box?.y ?? 0),
      hasLeft: parsed.left !== undefined,
      hasTop: parsed.top !== undefined,
    };
  };

  const finishInteraction = () => {
    isInteractingRef.current = false;
    throttledPreview.cancel();
    if (targetRef.current) {
      targetRef.current.style.transform = 'translate(0px, 0px)';
    }
    const nextScss = pendingScssRef.current;
    pendingScssRef.current = null;
    dragSnapshotRef.current = null;
    if (nextScss !== null) {
      latestScssRef.current = nextScss;
      onCommitScss(nextScss);
    }
  };

  const selectPartAtPoint = (clientX: number, clientY: number) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect || scale <= 0) return;
    const lx = (clientX - rect.left) / scale;
    const ly = (clientY - rect.top) / scale;
    const hit = smallestFirstParts.find(
      (part) =>
        lx >= part.box.x
        && lx <= part.box.x + part.box.width
        && ly >= part.box.y
        && ly <= part.box.y + part.box.height,
    );
    if (hit && hit.id !== selectedPartId) {
      onSelectPart(hit.id);
    }
  };

  const showEditableMoveable = Boolean(selectedPart?.allowLayoutEdit && selectedBox && scale > 0);

  return (
    <div ref={overlayRef} className={styles.overlay}>
      {sortedParts.map((part) => {
        const isSelected = part.id === selectedPartId;
        const left = part.box.x * scale;
        const top = part.box.y * scale;
        const width = Math.max(6, part.box.width * scale);
        const height = Math.max(6, part.box.height * scale);
        const stateClass = isSelected
          ? part.allowLayoutEdit
            ? styles.hitboxSelected
            : styles.hitboxReadonly
          : '';
        return (
          <div
            key={part.id}
            className={`${styles.hitbox} ${stateClass}`}
            style={{ left, top, width, height }}
            title={part.name}
            onClick={(event) => {
              event.stopPropagation();
              onSelectPart(part.id);
            }}
          />
        );
      })}

      {showEditableMoveable && selectedPart && selectedBox && (
        <>
          <div
            ref={targetRef}
            className={styles.moveTarget}
            style={{
              left: `${selectedBox.left}px`,
              top: `${selectedBox.top}px`,
              width: `${selectedBox.width}px`,
              height: `${selectedBox.height}px`,
            }}
          />
          <Moveable
            ref={moveableRef}
            key={`${selectedPart.id}-${Math.round(stageWidth)}`}
            target={targetRef}
            origin={false}
            draggable={true}
            resizable={true}
            throttleDrag={0}
            throttleResize={0}
            renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
            onClick={({ clientX, clientY }) => selectPartAtPoint(clientX, clientY)}
            onDragStart={() => {
              isInteractingRef.current = true;
              dragSnapshotRef.current = captureSnapshot(selectedPart);
              pendingScssRef.current = null;
            }}
            onDrag={({ beforeTranslate }) => {
              if (targetRef.current) {
                targetRef.current.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
              }
              const snap = dragSnapshotRef.current;
              if (!snap || scale <= 0) return;
              const patch: Partial<LayoutFields> = {
                left: Math.round(snap.left + beforeTranslate[0] / scale),
                top: Math.round(snap.top + beforeTranslate[1] / scale),
              };
              const nextScss = applyPartLayoutPatch(latestScssRef.current, selectedPart.selector, patch);
              pendingScssRef.current = nextScss;
              throttledPreview(nextScss);
            }}
            onDragEnd={finishInteraction}
            onResizeStart={() => {
              isInteractingRef.current = true;
              dragSnapshotRef.current = captureSnapshot(selectedPart);
              pendingScssRef.current = null;
            }}
            onResize={({ width, height, drag }) => {
              if (targetRef.current) {
                targetRef.current.style.width = `${width}px`;
                targetRef.current.style.height = `${height}px`;
                targetRef.current.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px)`;
              }
              const snap = dragSnapshotRef.current;
              if (!snap || scale <= 0) return;
              const patch: Partial<LayoutFields> = {
                width: Math.max(1, Math.round(width / scale)),
                height: Math.max(1, Math.round(height / scale)),
              };
              if (drag.beforeTranslate[0] !== 0 || snap.hasLeft) {
                patch.left = Math.round(snap.left + drag.beforeTranslate[0] / scale);
              }
              if (drag.beforeTranslate[1] !== 0 || snap.hasTop) {
                patch.top = Math.round(snap.top + drag.beforeTranslate[1] / scale);
              }
              const nextScss = applyPartLayoutPatch(latestScssRef.current, selectedPart.selector, patch);
              pendingScssRef.current = nextScss;
              throttledPreview(nextScss);
            }}
            onResizeEnd={finishInteraction}
          />
        </>
      )}
    </div>
  );
}
