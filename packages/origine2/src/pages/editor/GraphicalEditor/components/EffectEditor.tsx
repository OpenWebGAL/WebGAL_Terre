import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { ColorPicker, IColor } from '@fluentui/react';
import { Button, Checkbox, Input, Slider, Switch } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import { debounce } from 'lodash';
import { useValue } from '@/hooks/useValue';
import { logger } from '@/utils/logger';
import { OptionCategory } from '@/pages/editor/GraphicalEditor/components/OptionCategory';
import CommonOptions from '@/pages/editor/GraphicalEditor/components/CommonOption';
import styles from './effectEditor.module.scss';
import { useEffectEditorConfig } from '@/pages/editor/GraphicalEditor/utils/useEffectEditorConfig';
import type {
  EffectKey,
  EffectFields,
  EffectSliderConfig,
} from '@/pages/editor/GraphicalEditor/utils/useEffectEditorConfig';
import {
  createEffectFieldsFromObject,
  createEffectObjectFromFields,
  mergeVisibleEffectFields,
} from '@/pages/editor/GraphicalEditor/utils/effectEditorFields';
import { rgbToColor } from '@/pages/editor/GraphicalEditor/utils/rgbToColor';
import WheelDropdown from './WheelDropdown';
import useEditorStore from '@/store/useEditorStore';
import { eventBus } from '@/utils/eventBus';
import { ISentence } from 'webgal-parser/src/interface/sceneInterface';
import { createPortal } from 'react-dom';
import TransformableBox from '@/pages/editor/TransformableBox/TransformableBox';

/**
 * 效果输入框字段
 */
const EffectInputField = memo(
  (props: {
    effectFields: EffectFields;
    fieldKey: EffectKey;
    updateField: (key: EffectKey, value: number | undefined) => void;
    submit: () => void;
    slider?: EffectSliderConfig;
    update?: () => void;
  }) => {
    const { effectFields, fieldKey, submit, updateField, slider, update } = props;
    const { effectConfig } = useEffectEditorConfig();
    const val = effectFields[fieldKey];
    let [innerVal, setInnerVal] = useState((val ?? '').toString());
    useEffect(() => {
      setInnerVal((val ?? '').toString());
    }, [val]);
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
    const toFixedNumber = useCallback(
      (value: number | undefined) => {
        if (typeof value !== 'number') {
          return 0;
        } else {
          if (!slider?.toFixed) {
            return value;
          } else {
            return Number(value.toFixed(slider.toFixed));
          }
        }
      },
      [slider],
    );
    return (
      <CommonOptions title={config.label ?? fieldKey} key={fieldKey}>
        <Input
          style={{ width: '140px' }}
          value={innerVal}
          placeholder={config.placeholder}
          onChange={(_, data) => handleChange(data.value)}
          onBlur={submit}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        {slider && (
          <Slider
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            style={{ '--fui-Slider--steps-percent': '100.00%', width: '180px' } as React.CSSProperties}
            min={slider.min}
            max={slider.max}
            step={slider.toFixed ? Math.pow(10, -slider.toFixed) : 1}
            value={toFixedNumber(innerVal ? Number(innerVal) : slider.defaultValue)}
            onChange={(_, data) => {
              const num = typeof data.value === 'number' ? data.value : Number(data.value);
              handleChange(toFixedNumber(num).toString());
              update?.();
            }}
            onMouseUp={() => {
              submit();
            }}
          />
        )}
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
        <WheelDropdown options={options} value={(val ?? '').toString()} onValueChange={handleChange} />
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
    slider?: EffectSliderConfig;
    update?: () => void;
  }) => {
    const { type, effectFields, fieldKey, updateField, submit, options, slider } = props;
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
          slider={slider}
          update={props.update}
        />
      );
    }
  },
);

/**
 * 效果编辑器
 */
export function EffectEditor(props: {
  json: string;
  onChange: (newJson: string) => void;
  onUpdate?: (transform: any) => void;
  sentence: ISentence;
  index: number;
  targetPath: string;
}) {
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
    try {
      return createEffectFieldsFromObject(effectObject, effectConfig);
    } catch (e) {
      logger.error('EffectEditor getEffectFields error', e);
    }
    const emptyFields: EffectFields = {};
    return emptyFields;
  }, [effectConfig]);
  // 状态：存储当前语句显式写出的效果参数。继承值只用于显示，不参与写回。
  const explicitEffectFields = useValue<EffectFields>(getInitialFields(props.json));
  const baselineEffectFields = useValue<Partial<EffectFields>>({});
  const visibleEffectFields = useMemo(
    () => mergeVisibleEffectFields(explicitEffectFields.value, baselineEffectFields.value),
    [explicitEffectFields.value, baselineEffectFields.value],
  );
  // 当父组件传递的 json 变化时，重新初始化状态
  useEffect(() => {
    explicitEffectFields.value = getInitialFields(props.json);
  }, [props.json, getInitialFields]);
  /**
   * 更新单个效果参数的值
   * @param key 参数键（EffectKey）
   * @param value 新值（数值或undefined）
   */
  const updateField = useCallback(
    (key: EffectKey, value: number | undefined) => {
      explicitEffectFields.set({ ...explicitEffectFields.value, [key]: value });
    },
    [explicitEffectFields.value],
  );
  /** 颜色选择器的当前颜色（基于colorRed/colorGreen/colorBlue） */
  const color = useMemo(
    () => rgbToColor(visibleEffectFields.colorRed, visibleEffectFields.colorGreen, visibleEffectFields.colorBlue),
    [visibleEffectFields.colorRed, visibleEffectFields.colorGreen, visibleEffectFields.colorBlue],
  );
  /**
   * 颜色选择器变化时的回调
   * 更新colorRed/colorGreen/colorBlue参数
   */
  const handleLocalColorChange = useCallback(
    debounce((_ev: React.SyntheticEvent<HTMLElement>, newColor: IColor) => {
      explicitEffectFields.set({
        ...explicitEffectFields.value,
        colorRed: newColor.r,
        colorGreen: newColor.g,
        colorBlue: newColor.b,
      });
      update();
    }, 10),
    [explicitEffectFields.value],
  );
  /** 倒角颜色选择器的当前颜色（基于bevelRed/bevelGreen/bevelBlue） */
  const bevelColor = useMemo(
    () => rgbToColor(visibleEffectFields.bevelRed, visibleEffectFields.bevelGreen, visibleEffectFields.bevelBlue),
    [visibleEffectFields.bevelRed, visibleEffectFields.bevelGreen, visibleEffectFields.bevelBlue],
  );
  /** 倒角颜色选择器变化时的回调 */
  const handleLocalBevelColorChange = useCallback(
    debounce((_ev: React.SyntheticEvent<HTMLElement>, newColor: IColor) => {
      explicitEffectFields.set({
        ...explicitEffectFields.value,
        bevelRed: newColor.r,
        bevelGreen: newColor.g,
        bevelBlue: newColor.b,
      });
      update();
    }, 10),
    [explicitEffectFields.value],
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
    return createEffectObjectFromFields(explicitEffectFields.value, effectConfig);
  }, [explicitEffectFields.value]);
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
  /**
   * 实时更新, 将最终结果对象通过onUpdate通知父组件
   */
  const isUseRealtimeEffect = useEditorStore.use.isUseRealtimeEffect();
  const update = useCallback(
    debounce(() => {
      if (!isUseRealtimeEffect) return;
      const updatedObject = getUpdatedObject();
      props.onUpdate?.(updatedObject);
    }, 10),
    [getUpdatedObject],
  );

  const isWindowAdjustment = useEditorStore.use.isWindowAdjustment();
  const updateIsWindowAdjustment = useEditorStore.use.updateIsWindowAdjustment();
  const [isDragSupported, setIsDragSupported] = useState(false);

  // 将 sentence 对象转换回原始命令行字符串
  const sentenceToRawLine = useCallback((sentence: ISentence): string => {
    let base = sentence.commandRaw;
    if (sentence.content) {
      base += ':' + sentence.content;
    }
    if (sentence.args && sentence.args.length > 0) {
      for (const arg of sentence.args) {
        let value = arg.value;
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        base += ` -${arg.key}=${value}`;
      }
    }
    return base;
  }, []);

  // 挂载时关闭拖拽框，卸载时也关闭
  useEffect(() => {
    updateIsWindowAdjustment(false);
    return () => {
      updateIsWindowAdjustment(false);
    };
  }, []);

  // 当 sentence 变化时，同步拖拽框状态
  useEffect(() => {
    const lineContent = sentenceToRawLine(props.sentence);
    if (lineContent.startsWith('changeFigure') || lineContent.startsWith('setTransform')) {
      eventBus.emit('editor:pixi-sync-command', {
        targetPath: props.targetPath,
        lineNumber: props.index,
        lineContent,
        lineSentence: props.sentence,
      });
    }
  }, [props.sentence, props.index, props.targetPath]);
  // // 当立绘变换改变时，同步拖拽框与 input
  useEffect(() => {
    eventBus.emit('editor:sync-dragger', {
      x: explicitEffectFields.value.x,
      y: explicitEffectFields.value.y,
      scaleX: explicitEffectFields.value.scaleX,
      scaleY: explicitEffectFields.value.scaleY,
      rotation: explicitEffectFields.value.rotation,
    });
  }, [
    explicitEffectFields.value.x,
    explicitEffectFields.value.y,
    explicitEffectFields.value.scaleX,
    explicitEffectFields.value.scaleY,
    explicitEffectFields.value.rotation,
  ]);
  const previewControl = document.getElementById('gamePreviewControl');
  return (
    <>
      <Switch
        checked={isWindowAdjustment}
        disabled={!isDragSupported}
        onChange={(_, checked) => {
          updateIsWindowAdjustment(checked.checked);
        }}
        label={t`拖拽调整变换（建议打开快速预览效果）`}
      />
      {previewControl && createPortal(
        <TransformableBox
          parent={previewControl}
          sentenceInfo={{
            scenePath: props.targetPath,
            lineNumber: props.index,
            lineContent: sentenceToRawLine(props.sentence),
            lineSentence: props.sentence,
            transform: props.json,
          }}
          onSupportChange={(supported) => {
            setIsDragSupported(supported);
            if (!supported) updateIsWindowAdjustment(false);
          }}
          onDragging={(transform) => {
            if (Object.hasOwn(transform, 'position')) {
              updateField('x', transform.position?.x);
              updateField('y', transform.position?.y);
            }
            if (Object.hasOwn(transform, 'scale')) {
              updateField('scaleX', transform.scale?.x);
              updateField('scaleY', transform.scale?.y);
            }
            if (Object.hasOwn(transform, 'rotation')) {
              updateField('rotation', transform.rotation);
            }
            update();
          }}
          onDragEnd={() => {
            submit();
          }}
          onBaselineChange={(transform) => {
            baselineEffectFields.set(createEffectFieldsFromObject(transform ?? {}, effectConfig));
          }}
        />,
        previewControl,
      )}
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
                    effectFields={visibleEffectFields}
                    updateField={updateField}
                    submit={submit}
                    slider={effectConfig[key].slider}
                    update={update}
                  />
                ))}
                <div style={{ flexGrow: 1 }} />
                <div style={{ color: 'var(--text-weak)' }}>{t`*设置拾色器后，点击此按钮以保存更改`}</div>
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
                effectFields={visibleEffectFields}
                updateField={updateField}
                submit={submit}
                options={toggleOptions}
                slider={effectConfig[key].slider}
                update={update}
              />
            ))
          ) : (
            // 其他的组
            group.keys.map((key) => (
              <EffectField
                type={effectConfig[key].type}
                key={key}
                fieldKey={key}
                effectFields={visibleEffectFields}
                updateField={updateField}
                submit={submit}
                slider={effectConfig[key].slider}
                update={update}
              />
            ))
          )}
        </OptionCategory>
      ))}
    </>
  );
}
