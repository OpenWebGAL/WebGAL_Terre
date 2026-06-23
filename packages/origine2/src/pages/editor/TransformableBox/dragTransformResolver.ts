import type { Transform } from '@webgal/editor-preview-protocol';

export type DragTransformPath = 'position' | 'scale' | 'rotation';

export interface ResolvedDragTransform {
  explicitTransform: Transform;
  baselineTransform?: Transform;
  baselineSource: 'protocol' | 'base' | 'unknown';
  displayTransform: Transform;
  touchedPaths: Set<DragTransformPath>;
}

interface CreateResolvedDragTransformInput {
  explicitTransform: Transform;
  baseTransform?: Transform;
  inheritedTransform?: Transform;
}

export function pickDragTransformFields(transform: Transform | undefined): Transform {
  if (!transform) {
    return {};
  }

  const result: Transform = {};
  if (transform.position) {
    const position = {
      ...(typeof transform.position.x === 'number'
        ? { x: transform.position.x }
        : {}),
      ...(typeof transform.position.y === 'number'
        ? { y: transform.position.y }
        : {}),
    };
    if ('x' in position || 'y' in position) {
      result.position = position;
    }
  }
  if (transform.scale) {
    const scale = {
      ...(typeof transform.scale.x === 'number' ? { x: transform.scale.x } : {}),
      ...(typeof transform.scale.y === 'number' ? { y: transform.scale.y } : {}),
    };
    if ('x' in scale || 'y' in scale) {
      result.scale = scale;
    }
  }
  if (typeof transform.rotation === 'number') {
    result.rotation = transform.rotation;
  }

  return result;
}

export function mergeDragTransforms(
  base: Transform | undefined,
  override: Transform | undefined,
): Transform {
  const result = pickDragTransformFields(base);
  const next = pickDragTransformFields(override);

  if (next.position) {
    result.position = {
      ...result.position,
      ...next.position,
    };
  }
  if (next.scale) {
    result.scale = {
      ...result.scale,
      ...next.scale,
    };
  }
  if (typeof next.rotation === 'number') {
    result.rotation = next.rotation;
  }

  return result;
}

export function mergeEffectTransforms(
  base: Transform | undefined,
  override: Transform | undefined,
): Transform {
  const result: Transform = { ...base };

  if (base?.position || override?.position) {
    result.position = {
      ...base?.position,
      ...override?.position,
    };
  }
  if (base?.scale || override?.scale) {
    result.scale = {
      ...base?.scale,
      ...override?.scale,
    };
  }

  for (const [key, value] of Object.entries(override ?? {})) {
    if (key !== 'position' && key !== 'scale' && typeof value === 'number') {
      result[key as keyof Transform] = value;
    }
  }

  return result;
}

export function createResolvedDragTransform({
  explicitTransform,
  baseTransform,
  inheritedTransform,
}: CreateResolvedDragTransformInput): ResolvedDragTransform {
  const baselineTransform = inheritedTransform
    ? mergeEffectTransforms(baseTransform, inheritedTransform)
    : mergeEffectTransforms(undefined, baseTransform);
  const baselineSource = inheritedTransform
    ? 'protocol'
    : baseTransform
      ? 'base'
      : 'unknown';

  return {
    explicitTransform: pickDragTransformFields(explicitTransform),
    baselineTransform:
      baselineSource === 'unknown' ? undefined : baselineTransform,
    baselineSource,
    displayTransform: mergeEffectTransforms(baselineTransform, explicitTransform),
    touchedPaths: new Set<DragTransformPath>(),
  };
}

export function createSparseTransformFromTouchedPaths(
  transform: Transform,
  touchedPaths: ReadonlySet<DragTransformPath>,
): Transform {
  const result: Transform = {};

  if (touchedPaths.has('position') && transform.position) {
    result.position = {
      x: transform.position.x,
      y: transform.position.y,
    };
  }

  if (touchedPaths.has('scale') && transform.scale) {
    result.scale = {
      x: transform.scale.x,
      y: transform.scale.y,
    };
  }

  if (touchedPaths.has('rotation') && typeof transform.rotation === 'number') {
    result.rotation = transform.rotation;
  }

  return result;
}
