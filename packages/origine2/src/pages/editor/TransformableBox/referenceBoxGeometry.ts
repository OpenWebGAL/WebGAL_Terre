import type { ReferenceBox, Transform } from '@webgal/editor-preview-protocol';
import { degreesToRadians, radiansToDegrees } from './baseUtils';

export interface TransformFrame {
  translate: [number, number];
  rotate: number;
  scale: [number, number];
  width: number;
  height: number;
}

interface ParentSize {
  width: number;
  height: number;
}

interface ResolveTargetInput {
  lineContent: string;
  lineSentence: {
    args?: Array<{
      key: string;
      value: unknown;
    }>;
  } | null;
}

function getArgValue(
  lineSentence: ResolveTargetInput['lineSentence'],
  key: string,
) {
  return lineSentence?.args?.find((arg) => arg.key === key)?.value;
}

function readDirection(input: ResolveTargetInput): 'left' | 'center' | 'right' {
  if (getArgValue(input.lineSentence, 'left') === true || /(?:^|\s)-left(?:\s|;|$)/.test(input.lineContent)) {
    return 'left';
  }
  if (getArgValue(input.lineSentence, 'right') === true || /(?:^|\s)-right(?:\s|;|$)/.test(input.lineContent)) {
    return 'right';
  }
  return 'center';
}

export function resolveTransformTarget(input: ResolveTargetInput): string | undefined {
  if (input.lineContent.startsWith('changeFigure')) {
    const id = getArgValue(input.lineSentence, 'id');
    if (typeof id === 'string' && id.trim()) {
      return id.trim();
    }

    return `fig-${readDirection(input)}`;
  }

  if (input.lineContent.startsWith('changeBg')) {
    return 'bg-main';
  }

  if (
    input.lineContent.startsWith('setTransform') ||
    input.lineContent.startsWith('setTempAnimation')
  ) {
    const target = getArgValue(input.lineSentence, 'target');
    return typeof target === 'string' && target.trim()
      ? target.trim()
      : undefined;
  }

  return undefined;
}

export function isWriteDefaultDisabled(
  lineSentence: ResolveTargetInput['lineSentence'],
): boolean {
  return getArgValue(lineSentence, 'writeDefault') !== true;
}

function stageToControl(
  point: { x: number; y: number },
  box: ReferenceBox,
  parentSize: ParentSize,
) {
  return {
    x: (point.x / box.stageWidth) * parentSize.width,
    y: (point.y / box.stageHeight) * parentSize.height,
  };
}

function controlToStage(
  point: { x: number; y: number },
  box: ReferenceBox,
  parentSize: ParentSize,
) {
  return {
    x: (point.x / parentSize.width) * box.stageWidth,
    y: (point.y / parentSize.height) * box.stageHeight,
  };
}

export function createFrameFromReferenceBox(
  box: ReferenceBox,
  displayTransform: Transform,
  parentSize: ParentSize,
): TransformFrame {
  const position = displayTransform.position ?? {};
  const currentOriginX = box.originX + (position.x ?? 0);
  const currentOriginY = box.originY + (position.y ?? 0);
  const currentLeft = currentOriginX - box.width * box.anchorX;
  const currentTop = currentOriginY - box.height * box.anchorY;
  const controlLeftTop = stageToControl(
    { x: currentLeft, y: currentTop },
    box,
    parentSize,
  );
  const controlSize = stageToControl(
    { x: box.width, y: box.height },
    box,
    parentSize,
  );

  return {
    translate: [controlLeftTop.x, controlLeftTop.y],
    rotate: radiansToDegrees(displayTransform.rotation ?? 0),
    scale: [
      displayTransform.scale?.x ?? 1,
      displayTransform.scale?.y ?? 1,
    ],
    width: controlSize.x,
    height: controlSize.y,
  };
}

export function createTransformFromReferenceFrame(
  box: ReferenceBox,
  frame: TransformFrame,
  parentSize: ParentSize,
): Transform {
  const anchorInControl = {
    x: frame.width * box.anchorX,
    y: frame.height * box.anchorY,
  };
  const nextOrigin = controlToStage(
    {
      x: frame.translate[0] + anchorInControl.x,
      y: frame.translate[1] + anchorInControl.y,
    },
    box,
    parentSize,
  );

  return {
    position: {
      x: Math.round(nextOrigin.x - box.originX),
      y: Math.round(nextOrigin.y - box.originY),
    },
    rotation: Number(degreesToRadians(frame.rotate).toFixed(3)),
    scale: {
      x: Number(frame.scale[0].toFixed(3)),
      y: Number(frame.scale[1].toFixed(3)),
    },
  };
}
