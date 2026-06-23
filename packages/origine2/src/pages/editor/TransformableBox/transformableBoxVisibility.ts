export interface TransformableBoxVisibilityInput {
  isReady: boolean;
  isWindowAdjustment: boolean;
  isFrameCommitted: boolean;
}

export interface TransformableBoxVisibility {
  shouldRenderFrame: boolean;
  shouldRenderMoveable: boolean;
}

export function resolveTransformableBoxVisibility({
  isReady,
  isWindowAdjustment,
  isFrameCommitted,
}: TransformableBoxVisibilityInput): TransformableBoxVisibility {
  const shouldRenderFrame = isReady && isWindowAdjustment;

  return {
    shouldRenderFrame,
    shouldRenderMoveable: shouldRenderFrame && isFrameCommitted,
  };
}
