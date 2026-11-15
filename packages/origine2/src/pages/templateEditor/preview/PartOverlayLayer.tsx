import { useEffect, useMemo, useRef, useState } from 'react';
import { throttle } from 'lodash';
import Moveable from 'react-moveable';
import type { UiLogicalBox, UiPartDescriptor } from '@webgal/editor-preview-protocol';
import {
  applyPartDragDelta,
  applyPartResizeBox,
  capturePartDragSnapshot,
  type PartDragLayoutSnapshot,
} from '../styleModel/layoutModel';
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

interface ScreenBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface LastDelta {
  tx: number;
  ty: number;
  width: number;
  height: number;
}

function isSameLogicalBox(a: UiLogicalBox | null, b: UiLogicalBox | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
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

  const [lockedBox, setLockedBox] = useState<ScreenBox | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const dragSnapshotRef = useRef<PartDragLayoutSnapshot | null>(null);
  const pendingScssRef = useRef<string | null>(null);
  const originBoxRef = useRef<ScreenBox | null>(null);
  const lastDeltaRef = useRef<LastDelta | null>(null);
  const postCommitWaitRef = useRef<{ partId: string; prevBox: UiLogicalBox | null; timer: number } | null>(null);

  const selectedBox = useMemo<ScreenBox | null>(() => {
    if (!selectedPart?.box || scaleX <= 0 || scaleY <= 0) return null;
    return {
      left: selectedPart.box.x * scaleX,
      top: selectedPart.box.y * scaleY,
      width: Math.max(8, selectedPart.box.width * scaleX),
      height: Math.max(8, selectedPart.box.height * scaleY),
    };
  }, [selectedPart, scaleX, scaleY]);

  const clearPostCommitWait = () => {
    if (postCommitWaitRef.current) {
      window.clearTimeout(postCommitWaitRef.current.timer);
      postCommitWaitRef.current = null;
    }
  };

  useEffect(() => {
    clearPostCommitWait();
    setIsInteracting(false);
    setLockedBox(null);
    dragSnapshotRef.current = null;
    pendingScssRef.current = null;
    originBoxRef.current = null;
    lastDeltaRef.current = null;
  }, [selectedPartId]);

  useEffect(() => {
    const waiting = postCommitWaitRef.current;
    if (!waiting || !selectedPart) return;
    if (waiting.partId === selectedPart.id && !isSameLogicalBox(waiting.prevBox, selectedPart.box)) {
      clearPostCommitWait();
      setLockedBox(null);
    }
  }, [selectedPart]);

  useEffect(() => () => clearPostCommitWait(), []);

  const activeBox = lockedBox ?? selectedBox;

  useEffect(() => {
    if (!isInteracting) {
      if (targetRef.current && activeBox) {
        targetRef.current.style.width = `${activeBox.width}px`;
        targetRef.current.style.height = `${activeBox.height}px`;
        targetRef.current.style.transform = 'translate(0px, 0px)';
      }
      moveableRef.current?.updateRect();
    }
  }, [activeBox, isInteracting]);

  const beginInteraction = (part: UiPartDescriptor, box: ScreenBox) => {
    if (!part.box) return;
    clearPostCommitWait();
    setIsInteracting(true);
    setLockedBox(box);
    originBoxRef.current = box;
    lastDeltaRef.current = { tx: 0, ty: 0, width: box.width, height: box.height };
    dragSnapshotRef.current = capturePartDragSnapshot(latestScssRef.current, part.selector, part.box);
    pendingScssRef.current = null;
  };

  const finishInteraction = () => {
    setIsInteracting(false);
    throttledPreview.cancel();
    if (targetRef.current) {
      targetRef.current.style.transform = 'translate(0px, 0px)';
    }

    const nextScss = pendingScssRef.current;
    const origin = originBoxRef.current;
    const delta = lastDeltaRef.current;
    pendingScssRef.current = null;
    dragSnapshotRef.current = null;
    originBoxRef.current = null;
    lastDeltaRef.current = null;

    if (nextScss !== null && selectedPart) {
      if (origin && delta) {
        setLockedBox({
          left: origin.left + delta.tx,
          top: origin.top + delta.ty,
          width: delta.width,
          height: delta.height,
        });
        clearPostCommitWait();
        postCommitWaitRef.current = {
          partId: selectedPart.id,
          prevBox: selectedPart.box,
          timer: window.setTimeout(() => {
            postCommitWaitRef.current = null;
            setLockedBox(null);
          }, 400),
        };
      } else {
        setLockedBox(null);
      }
      latestScssRef.current = nextScss;
      onCommitScss(nextScss);
      return;
    }

    setLockedBox(null);
  };

  const selectPartAtPoint = (clientX: number, clientY: number) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect || scaleX <= 0 || scaleY <= 0) return;
    const lx = (clientX - rect.left) / scaleX;
    const ly = (clientY - rect.top) / scaleY;
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

  const showEditableMoveable = Boolean(selectedPart?.allowLayoutEdit && activeBox && scaleX > 0 && scaleY > 0);

  return (
    <div ref={overlayRef} className={styles.overlay}>
      {sortedParts.map((part) => {
        const isSelected = part.id === selectedPartId;
        const left = part.box.x * scaleX;
        const top = part.box.y * scaleY;
        const width = Math.max(6, part.box.width * scaleX);
        const height = Math.max(6, part.box.height * scaleY);
        const stateClass = isInteracting
          ? styles.hitboxInteracting
          : isSelected && !part.allowLayoutEdit
            ? styles.hitboxReadonly
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

      {showEditableMoveable && selectedPart && activeBox && (
        <>
          <div
            ref={targetRef}
            className={styles.moveTarget}
            style={{
              left: `${activeBox.left}px`,
              top: `${activeBox.top}px`,
              width: `${activeBox.width}px`,
              height: `${activeBox.height}px`,
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
            onDragStart={() => beginInteraction(selectedPart, activeBox)}
            onDrag={({ beforeTranslate }) => {
              if (targetRef.current) {
                targetRef.current.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
              }
              const origin = originBoxRef.current;
              if (origin) {
                lastDeltaRef.current = {
                  tx: beforeTranslate[0],
                  ty: beforeTranslate[1],
                  width: origin.width,
                  height: origin.height,
                };
              }
              const snap = dragSnapshotRef.current;
              if (!snap || scaleX <= 0 || scaleY <= 0) return;
              const dx = Math.round(beforeTranslate[0] / scaleX);
              const dy = Math.round(beforeTranslate[1] / scaleY);
              const nextScss = applyPartDragDelta({
                scssText: latestScssRef.current,
                selector: selectedPart.selector,
                snapshot: snap,
                dx,
                dy,
              });
              pendingScssRef.current = nextScss;
              throttledPreview(nextScss);
            }}
            onDragEnd={finishInteraction}
            onResizeStart={() => beginInteraction(selectedPart, activeBox)}
            onResize={({ width, height, drag }) => {
              if (targetRef.current) {
                targetRef.current.style.width = `${width}px`;
                targetRef.current.style.height = `${height}px`;
                targetRef.current.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px)`;
              }
              lastDeltaRef.current = {
                tx: drag.beforeTranslate[0],
                ty: drag.beforeTranslate[1],
                width,
                height,
              };
              const snap = dragSnapshotRef.current;
              if (!snap || scaleX <= 0 || scaleY <= 0) return;
              const dx = Math.round(drag.beforeTranslate[0] / scaleX);
              const dy = Math.round(drag.beforeTranslate[1] / scaleY);
              const nextWidth = Math.max(1, Math.round(width / scaleX));
              const nextHeight = Math.max(1, Math.round(height / scaleY));
              const nextScss = applyPartResizeBox({
                scssText: latestScssRef.current,
                selector: selectedPart.selector,
                snapshot: snap,
                dx,
                dy,
                nextWidth,
                nextHeight,
              });
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
