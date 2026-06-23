export interface TransformableBoxVisibilityInput {
  hasFrameSource: boolean;
  isReady: boolean;
  isWindowAdjustment: boolean;
  isFrameCommitted: boolean;
}

export interface TransformableBoxVisibility {
  shouldUpdateFrame: boolean;
  shouldRenderFrame: boolean;
  shouldRenderMoveable: boolean;
}

export function resolveTransformableBoxVisibility({
  hasFrameSource,
  isReady,
  isWindowAdjustment,
  isFrameCommitted,
}: TransformableBoxVisibilityInput): TransformableBoxVisibility {
  const shouldUpdateFrame = hasFrameSource && isWindowAdjustment;
  const shouldRenderFrame = hasFrameSource && isReady && isWindowAdjustment;

  return {
    shouldUpdateFrame,
    shouldRenderFrame,
    shouldRenderMoveable: shouldRenderFrame && isFrameCommitted,
  };
}
