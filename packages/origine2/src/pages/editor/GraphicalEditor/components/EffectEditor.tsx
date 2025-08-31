import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { ColorPicker, IColor } from '@fluentui/react';
import { Button, Checkbox, Input } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import { debounce } from 'lodash';
import { useValue } from '@/hooks/useValue';
import { logger } from '@/utils/logger';
import { OptionCategory } from '@/pages/editor/GraphicalEditor/components/OptionCategory';
import CommonOptions from '@/pages/editor/GraphicalEditor/components/CommonOption';
import styles from './effectEditor.module.scss';
import { useEffectEditorConfig } from '@/pages/editor/GraphicalEditor/utils/useEffectEditorConfig';
import type { EffectKey, EffectFields } from '@/pages/editor/GraphicalEditor/utils/useEffectEditorConfig';
import { rgbToColor } from '@/pages/editor/GraphicalEditor/utils/rgbToColor';
import WheelDropdown from './WheelDropdown';

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
 * 递归处理对象，将全undefined子属性的父属性置为undefined
 */
const deepUndefined = <T extends Record<string, any>>(obj: T): T => {
  // 判断对象所有属性值是否为undefined
  const allUndefined = (o: Record<string, any>) => Object.values(o).every((v) => v === undefined);

  // 递归处理函数（带根节点标记）
  const process = (target: any, isRoot = false): any => {
    // 非对象类型直接返回
    if (typeof target !== 'object' || target === null) return target;

    // 处理数组类型
    if (Array.isArray(target)) {
      return target.map((item) => process(item, false));
    }

    // 处理普通对象
    const processed: Record<string, any> = {};
    for (const key in target) {
      if (target.hasOwnProperty(key)) {
        processed[key] = process(target[key], false);
      }
    }

    // 非根节点且全属性为undefined时返回undefined
    return !isRoot && allUndefined(processed) ? undefined : processed;
  };

  return process(obj, true);
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
    const { effectConfig } = useEffectEditorConfig();
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
    submit: () => void;
  }) => {
    const { effectFields, fieldKey, updateField, submit } = props;
    const { effectConfig } = useEffectEditorConfig();
    const val = effectFields[fieldKey];
    const config = effectConfig[fieldKey];
    const handleChange = useCallback(
      (value: boolean | string) => {
        let newVal = value ? 1 : undefined;
        updateField(fieldKey, newVal);
        submit();
      },
      [fieldKey, updateField, submit],
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
/**
 * 效果下拉菜单字段
 */
const EffectDropdownField = memo(
  (props: {
    effectFields: EffectFields;
    fieldKey: EffectKey;
    updateField: (key: EffectKey, value: number | undefined) => void;
    submit: () => void;
    options: Map<string, string>;
  }) => {
    const { effectFields, fieldKey, updateField, submit, options } = props;
    const { effectConfig } = useEffectEditorConfig();
    const val = effectFields[fieldKey];
    const config = effectConfig[fieldKey];
    const handleChange = useCallback(
      (value: string | undefined) => {
        let newVal: number | undefined;
        if (value === undefined || value === '') {
          newVal = undefined;
        } else {
          const num = Number(value);
          newVal = isNaN(num) ? undefined : num;
        }
        updateField(fieldKey, newVal);
        submit();
      },
      [fieldKey, updateField, submit],
    );
    return (
      <CommonOptions title={config.label ?? fieldKey} key={fieldKey}>
        <WheelDropdown
          options={options}
          value={(val ?? '').toString()}
          onValueChange={handleChange}
        />
      </CommonOptions>
    );
  },
);
/**
 * 通用效果字段
 */
const EffectField = memo(
  (props: {
    type?: string;
    effectFields: EffectFields;
    fieldKey: EffectKey;
    updateField: (key: EffectKey, value: number | undefined) => void;
    submit: () => void;
    options?: Map<string, string>;
  }) => {
    const { type, effectFields, fieldKey, updateField, submit, options } = props;
    switch (type) {
    case 'checkbox':
      return (
        <EffectCheckboxField
          key={fieldKey}
          fieldKey={fieldKey}
          effectFields={effectFields}
          updateField={updateField}
          submit={submit}
        />
      );
    case 'dropdown':
      return (
        <EffectDropdownField
          key={fieldKey}
          fieldKey={fieldKey}
          effectFields={effectFields}
          updateField={updateField}
          submit={submit}
          options={options!}
        />
      );
    default:
      return (
        <EffectInputField
          key={fieldKey}
          fieldKey={fieldKey}
          effectFields={effectFields}
          updateField={updateField}
          submit={submit}
        />
      );
    }
  },
);

/**
 * 效果编辑器
 */
export function EffectEditor(props: { json: string; onChange: (newJson: string) => void }) {
  const { effectConfig, fieldGroups } = useEffectEditorConfig();
  /**
   * 解析初始JSON字符串，生成效果参数的初始状态
   * @param json 初始效果配置的JSON字符串
   * @returns 初始EffectFields对象
   */
  const getInitialFields = useCallback((json: string) => {
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
  }, []);
  // 状态：存储所有效果参数的当前值（键为EffectKey，值为数值或undefined）
  const effectFields = useValue<EffectFields>(getInitialFields(props.json));
  // 当父组件传递的 json 变化时，重新初始化状态
  useEffect(() => {
    effectFields.value = getInitialFields(props.json);
  }, [props.json]);
  /**
   * 更新单个效果参数的值
   * @param key 参数键（EffectKey）
   * @param value 新值（数值或undefined）
   */
  const updateField = useCallback((key: EffectKey, value: number | undefined) => {
    effectFields.set({ ...effectFields.value, [key]: value });
  }, [effectFields.value]);
  /** 颜色选择器的当前颜色（基于colorRed/colorGreen/colorBlue） */
  const color = useMemo(
    () => rgbToColor(effectFields.value.colorRed, effectFields.value.colorGreen, effectFields.value.colorBlue),
    [effectFields.value.colorRed, effectFields.value.colorGreen, effectFields.value.colorBlue],
  );
  /**
   * 颜色选择器变化时的回调
   * 更新colorRed/colorGreen/colorBlue参数
   */
  const handleLocalColorChange = useCallback(
    debounce((_ev: React.SyntheticEvent<HTMLElement>, newColor: IColor) => {
      effectFields.set({
        ...effectFields.value,
        colorRed: newColor.r,
        colorGreen: newColor.g,
        colorBlue: newColor.b,
      });
    }, 100),
    [],
  );
  /** 倒角颜色选择器的当前颜色（基于bevelRed/bevelGreen/bevelBlue） */
  const bevelColor = useMemo(
    () => rgbToColor(effectFields.value.bevelRed, effectFields.value.bevelGreen, effectFields.value.bevelBlue),
    [effectFields.value.bevelRed, effectFields.value.bevelGreen, effectFields.value.bevelBlue],
  );
  /** 倒角颜色选择器变化时的回调 */
  const handleLocalBevelColorChange = useCallback(
    debounce((_ev: React.SyntheticEvent<HTMLElement>, newColor: IColor) => {
      effectFields.set({
        ...effectFields.value,
        bevelRed: newColor.r,
        bevelGreen: newColor.g,
        bevelBlue: newColor.b,
      });
    }, 100),
    [],
  );
  /**
   * 切换选项
   */
  const toggleOptions = useMemo(
    () =>
      new Map<string, string>([
        ['', t`默认`],
        ['1', t`开启`],
        ['0', t`关闭`],
      ]),
    [],
  );
  /**
   * 生成包含所有参数的最终结果对象（按path路径嵌套）
   * @returns 结构化的结果对象
   */
  const getUpdatedObject = useCallback(() => {
    const result: any = {};
    for (const key of Object.keys(effectFields.value) as EffectKey[]) {
      setValueByPath(result, effectConfig[key].path, effectFields.value[key]);
    }
    return deepUndefined(result);
  }, [effectFields.value]);
  /**
   * 提交更新
   * 将最终结果对象转换为JSON字符串，通过onChange通知父组件
   */
  const submit = useCallback(
    debounce(() => {
      const updatedObject = getUpdatedObject();
      const str = JSON.stringify(updatedObject);
      props.onChange(str === '{}' ? '' : str);
    }, 100),
    [getUpdatedObject],
  );
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
                  <EffectField
                    type={effectConfig[key].type}
                    key={key}
                    fieldKey={key}
                    effectFields={effectFields.value}
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
          ) : index === 5 ? ( // 滤镜的组
            group.keys.map((key) => (
              <EffectField
                type={effectConfig[key].type}
                key={key}
                fieldKey={key}
                effectFields={effectFields.value}
                updateField={updateField}
                submit={submit}
                options={toggleOptions}
              />
            ))
          ) : (
            // 其他的组
            group.keys.map((key) => (
              <EffectField
                type={effectConfig[key].type}
                key={key}
                fieldKey={key}
                effectFields={effectFields.value}
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
