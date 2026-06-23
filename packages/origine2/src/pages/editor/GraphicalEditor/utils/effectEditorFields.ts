import type {
  EffectConfig,
  EffectFields,
  EffectKey,
} from './useEffectEditorConfig';

function getValueByPath(obj: Record<string, any>, path: string) {
  let value = obj;
  for (const key of path.split('.')) {
    if (value === undefined) {
      return undefined;
    }
    value = value[key];
  }
  return value;
}

function setValueByPath(
  obj: Record<string, any>,
  path: string,
  value: number,
) {
  const pathArray = path.split('.').filter(Boolean);
  if (pathArray.length === 0) {
    return;
  }

  let target = obj;
  for (let i = 0; i < pathArray.length - 1; i += 1) {
    const key = pathArray[i];
    if (typeof target[key] !== 'object' || target[key] === null) {
      target[key] = {};
    }
    target = target[key];
  }
  target[pathArray[pathArray.length - 1]] = value;
}

export function createEffectFieldsFromObject(
  effectObject: Record<string, any>,
  effectConfig: Record<EffectKey, EffectConfig>,
): EffectFields {
  const effectFields: EffectFields = {};
  for (const key of Object.keys(effectConfig) as EffectKey[]) {
    const value = getValueByPath(effectObject, effectConfig[key].path);
    effectFields[key] = typeof value === 'number' ? value : undefined;
  }
  return effectFields;
}

export function createEffectObjectFromFields(
  effectFields: Partial<EffectFields>,
  effectConfig: Record<EffectKey, EffectConfig>,
) {
  const result: Record<string, any> = {};
  for (const key of Object.keys(effectFields) as EffectKey[]) {
    const value = effectFields[key];
    if (value !== undefined) {
      setValueByPath(result, effectConfig[key].path, value);
    }
  }
  return result;
}

export function mergeVisibleEffectFields(
  explicitFields: Partial<EffectFields>,
  baselineFields: Partial<EffectFields>,
): EffectFields {
  const result: EffectFields = { ...baselineFields };
  for (const key of Object.keys(explicitFields) as EffectKey[]) {
    const value = explicitFields[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}
