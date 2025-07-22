import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { ColorPicker, IColor } from '@fluentui/react';
import { Button, Checkbox, Input } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import { debounce } from 'lodash';
import { logger } from '@/utils/logger';
import { OptionCategory } from '@/pages/editor/GraphicalEditor/components/OptionCategory';
import CommonOptions from '@/pages/editor/GraphicalEditor/components/CommonOption';
import styles from './effectEditor.module.scss';
import {
  EffectKey,
  effectConfig,
  EffectFields,
  fieldGroups,
} from '@/pages/editor/GraphicalEditor/utils/effectEditorConfig';

/**
 * 根据对象路径获取值（支持嵌套路径，如"position.x"）
 * @param obj 目标对象
 * @param path 路径字符串（如"a.b.c"）
 * @returns 路径对应的 value，若路径不存在则返回undefined
 */
const getValueByPath = (obj: Record<string, any>, path: string) => {
  let value = obj;
  const pathArray = path.split('.'); // 拆分路径为数组（如["position", "x"]）
  for (let key of pathArray) {
    if (value === undefined) return undefined; // 路径不存在时终止
    value = value[key];
  }
  return value;
};
/**
 * 根据对象路径设置值
 * @param obj 目标对象
 * @param path 路径字符串
 * @param value 路径要设置的的 value
 */
const setValueByPath = (obj: Record<string, any>, path: string, value: any) => {
  if (!path.trim()) return;
  let p = obj;
  const pathArray = path.split('.').filter(Boolean);
  if (pathArray.length === 0) return;
  for (let i = 0; i < pathArray.length - 1; i++) {
    const key = pathArray[i];
    if (typeof p[key] !== 'object' || p[key] === null) {
      p[key] = {};
    }
    p = p[key];
  }
  p[pathArray[pathArray.length - 1]] = value;
};

/**
 * 解析初始JSON字符串，生成效果参数的初始状态
 * @param json 初始效果配置的JSON字符串
 * @returns 初始EffectFields对象
 */
const getInitialFields = (json: string) => {
  let effectObject = {} as any;
  try {
    if (json !== '') {
      effectObject = JSON.parse(json);
    }
  } catch (e) {
    logger.error('EffectEditor JSON.parse error', e);
  }
  let effectFields = {} as any;
  try {
    for (const key of Object.keys(effectConfig)) {
      effectFields[key] = getValueByPath(effectObject, effectConfig[key as EffectKey].path);
    }
  } catch (e) {
    logger.error('EffectEditor getEffectFields error', e);
  }
  return effectFields as EffectFields;
};

/**
 * 将RGB数值（0-255）转换为ColorPicker所需的IColor类型
 * @param redColor R通道值（0-255）
 * @param greenColor G通道值（0-255）
 * @param blueColor B通道值（0-255）
 * @returns IColor对象（包含RGBA、HSV、十六进制等格式）
 */
const rgbToColor = (redColor?: number, greenColor?: number, blueColor?: number): IColor => {
  const red = redColor ?? 255; // 若参数是 undefined 则取 255
  const green = greenColor ?? 255;
  const blue = blueColor ?? 255;
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const cmax = Math.max(r, g, b);
  const cmin = Math.min(r, g, b);
  let delta = cmax - cmin;

  let h = 0;
  if (delta !== 0) {
    if (cmax === r) h = ((g - b) / delta) * 60;
    else if (cmax === g) h = ((b - r) / delta) * 60 + 120;
    else h = ((r - g) / delta) * 60 + 240;
    if (h < 0) h += 360;
  }

  let s = cmax === 0 ? 0 : (delta / cmax) * 100.0;
  let v = cmax * 100.0;

  return {
    r: red,
    g: green,
    b: blue,
    a: 100,
    h,
    s,
    v,
    hex: red.toString(16).padStart(2, '0') + green.toString(16).padStart(2, '0') + blue.toString(16).padStart(2, '0'),
    str: `rgba(${red}, ${green}, ${blue}, 100)`,
  };
};
/**
 * 效果输入框字段
 */
const EffectInputField = memo(
  (props: {
    effectFields: EffectFields;
    fieldKey: EffectKey;
    updateField: (key: EffectKey, value: number | undefined) => void;
    submit: () => void;
  }) => {
    const { effectFields, fieldKey, submit, updateField } = props;
    const val = effectFields[fieldKey];
    let [innerVal, setInnerVal] = useState((val ?? '').toString());
    const config = effectConfig[fieldKey];
    const handleChange = useCallback(
      (value: string) => {
        let newVal: number | undefined;
        setInnerVal((value ?? '').toString());
        if (value === '') {
          newVal = undefined;
        } else {
          const num = Number(value);
          newVal = isNaN(num) ? undefined : num;
        }
        updateField(fieldKey, newVal);
      },
      [fieldKey, updateField],
    );
    return (
      <CommonOptions title={config.label ?? fieldKey} key={fieldKey}>
        <Input
          value={innerVal}
          placeholder={config.placeholder}
          onChange={(_, data) => handleChange(data.value)}
          onBlur={submit}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </CommonOptions>
    );
  },
);
/**
 * 效果复选框字段
 */
const EffectCheckboxField = memo(
  (props: {
    effectFields: EffectFields;
    fieldKey: EffectKey;
    updateField: (key: EffectKey, value: number | undefined) => void;
    setCheckbox: (label: boolean) => void;
    checkboxEffectLabel: boolean;
  }) => {
    const { effectFields, fieldKey, updateField, setCheckbox, checkboxEffectLabel } = props;
    const val = effectFields[fieldKey];
    const config = effectConfig[fieldKey];
    const handleChange = useCallback(
      (value: boolean | string) => {
        let newVal = value ? 1 : undefined;
        updateField(fieldKey, newVal);
        setCheckbox(!checkboxEffectLabel);
      },
      [fieldKey, updateField, setCheckbox, checkboxEffectLabel],
    );
    return (
      <Checkbox
        key={fieldKey}
        label={config.label ?? fieldKey}
        checked={val === 1}
        onChange={(_, data) => handleChange(data.checked)}
      />
    );
  },
);

export function EffectEditor(props: { json: string; onChange: (newJson: string) => void }) {
  const isInitialMount = useRef(true);
  // 状态：存储所有效果参数的当前值（键为EffectKey，值为数值或undefined）
  const initialFields = useMemo(() => getInitialFields(props.json), []);
  const [effectFields, setEffectFields] = useState<EffectFields>(initialFields);
  // 当父组件传递的 json 变化时，重新初始化状态
  useEffect(() => {
    setEffectFields(getInitialFields(props.json));
  }, [props.json]);
  /**
   * 更新单个效果参数的值
   * @param key 参数键（EffectKey）
   * @param value 新值（数值或undefined）
   */
  const updateField = useCallback((key: EffectKey, value: number | undefined) => {
    setEffectFields((prev) => ({ ...prev, [key]: value }));
  }, []);
  /** 颜色选择器的当前颜色（基于colorRed/colorGreen/colorBlue） */
  const color = useMemo(
    () => rgbToColor(effectFields.colorRed, effectFields.colorGreen, effectFields.colorBlue),
    [effectFields.colorRed, effectFields.colorGreen, effectFields.colorBlue],
  );
  /**
   * 颜色选择器变化时的回调
   * 更新colorRed/colorGreen/colorBlue参数
   */
  const handleLocalColorChange = useCallback(
    debounce((_ev: React.SyntheticEvent<HTMLElement>, newColor: IColor) => {
      setEffectFields((prev) => ({
        ...prev,
        colorRed: newColor.r,
        colorGreen: newColor.g,
        colorBlue: newColor.b,
      }));
    }, 100),
    [],
  );
  /** 倒角颜色选择器的当前颜色（基于bevelRed/bevelGreen/bevelBlue） */
  const bevelColor = useMemo(
    () => rgbToColor(effectFields.bevelRed, effectFields.bevelGreen, effectFields.bevelBlue),
    [effectFields.bevelRed, effectFields.bevelGreen, effectFields.bevelBlue],
  );
  /** 倒角颜色选择器变化时的回调 */
  const handleLocalBevelColorChange = useCallback(
    debounce((_ev: React.SyntheticEvent<HTMLElement>, newColor: IColor) => {
      setEffectFields((prev) => ({
        ...prev,
        bevelRed: newColor.r,
        bevelGreen: newColor.g,
        bevelBlue: newColor.b,
      }));
    }, 100),
    [],
  );
  /**
   * 生成包含所有参数的最终结果对象（按path路径嵌套）
   * @returns 结构化的结果对象
   */
  const getUpdatedObject = useCallback(() => {
    const result: any = {};
    for (const key of Object.keys(effectFields) as EffectKey[]) {
      setValueByPath(result, effectConfig[key].path, effectFields[key]);
    }
    return result;
  }, [effectFields]);
  /**
   * 提交更新
   * 将最终结果对象转换为JSON字符串，通过onChange通知父组件
   */
  const submit = useCallback(
    debounce(() => {
      const updatedObject = getUpdatedObject();
      props.onChange(JSON.stringify(updatedObject));
    }, 100),
    [getUpdatedObject],
  );
  const [checkboxEffectLabel, setCheckbox] = useState(true);
  /** 监听复选框类型参数的变化，自动触发提交 */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      submit();
    }
    // 依赖项：标识checkbox变换的标签（因为修改是异步的，如果在修改时提交，参数来不及更新）
  }, [checkboxEffectLabel]);
  return (
    <>
      {fieldGroups.map((group, index) => (
        <OptionCategory key={index + 1} title={group.title}>
          {index === 2 || index === 4 ? ( // 有拾色器的组
            <>
              <ColorPicker
                color={index === 2 ? color : bevelColor}
                alphaType="none"
                onChange={index === 2 ? handleLocalColorChange : handleLocalBevelColorChange}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}>
                {group.keys.map((key) => (
                  <EffectInputField
                    key={key}
                    fieldKey={key}
                    effectFields={effectFields}
                    updateField={updateField}
                    submit={submit}
                  />
                ))}
                <div style={{ flexGrow: 1 }} />
                <Button style={{ marginBottom: '14px' }} onClick={submit}>
                  {t`应用颜色变化`}
                </Button>
              </div>
            </>
          ) : index === 5 ? ( // 复选框
            group.keys.map((key) => (
              <EffectCheckboxField
                key={key}
                fieldKey={key}
                effectFields={effectFields}
                updateField={updateField}
                setCheckbox={setCheckbox}
                checkboxEffectLabel={checkboxEffectLabel}
              />
            ))
          ) : (
            // 普通输入框
            group.keys.map((key) => (
              <EffectInputField
                key={key}
                fieldKey={key}
                effectFields={effectFields}
                updateField={updateField}
                submit={submit}
              />
            ))
          )}
        </OptionCategory>
      ))}
    </>
  );
}
