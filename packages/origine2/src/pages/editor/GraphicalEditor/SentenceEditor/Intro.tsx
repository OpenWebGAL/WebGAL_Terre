import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { cloneDeep } from "lodash";
import { ColorPicker, IColor } from "@fluentui/react";
import useTrans from "@/hooks/useTrans";
import { getArgByKey } from "../utils/getArgByKey";
import { useState } from "react";
import React from 'react';
import { logger } from "@/utils/logger";
import { TerrePanel } from "../components/TerrePanel";
import { Button, Dropdown, Option, Switch } from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";

type FontSize = "small" | "medium" | "large";
type Animation = "fadeIn" | "slideIn" | "typingEffect" | "pixelateEffect" | "revealAnimation";
type DelayTime = 1500 | 2000 | 2500 | 3000 | 3500 | 4000 | 4500 | 5000;

export default function Intro(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.intro.options.');
  const introTextList = useValue(props.sentence.content.split("|"));
  const isHoldFromSentence = getArgByKey(props.sentence, 'hold');
  const isHold = useValue(!!isHoldFromSentence);
  const initialBackgroundColor: IColor = {
    r: 0,
    g: 0,
    b: 0,
    a: 100,
    h: 0,
    s: 0,
    v: 0,
    hex: '000000',
    str: '000000',
  };
  const initialFontColor: IColor = {
    r: 255,
    g: 255,
    b: 255,
    a: 100,
    h: 0,
    s: 0,
    v: 0,
    hex: 'FFFFFF',
    str: 'FFFFFF',
  };

  const getBackgroundColor = (): IColor => {
    let colorValue = props.sentence.args.find(arg => arg.key === 'backgroundColor')?.value;

    if (typeof colorValue === 'string') {
      const match = colorValue.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*(?:\.\d+)?)\)/);

      if (match && match.length === 5) {
        const [_, r, g, b, a] = match.map(Number);
        return {
          r,
          g,
          b,
          a: a * 100,
          h: 0,
          s: 0,
          v: 0,
          hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
          str: `rgba(${r}, ${g}, ${b}, ${a})`,
        };
      }
    }
    return initialBackgroundColor;
  };

  const getFontColor = (): IColor => {
    let colorValue = props.sentence.args.find(arg => arg.key === 'fontColor')?.value;

    if (typeof colorValue === 'string') {
      const match = colorValue.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*(?:\.\d+)?)\)/);

      if (match && match.length === 5) {
        const [_, r, g, b, a] = match.map(Number);
        return {
          r,
          g,
          b,
          a: a * 100,
          h: 0,
          s: 0,
          v: 0,
          hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
          str: `rgba(${r}, ${g}, ${b}, ${a})`,
        };
      }
    }
    return initialFontColor;
  };

  const fontSizes = new Map<FontSize, string>([
    ["small", "small"],
    ["medium", "medium"],
    ["large", "large"],
  ]);

  const animations = new Map<Animation, string>([
    ["fadeIn", "fadeIn"],
    ["slideIn", "slideIn"],
    ["typingEffect", "typingEffect"],
    ["pixelateEffect", "pixelateEffect"],
    ["revealAnimation", "revealAnimation"],
  ]);

  const delayTimes = new Map<DelayTime, string>([
    [1500, "1.5"],
    [2000, "2"],
    [2500, "2.5"],
    [3000, "3"],
    [3500, "3.5"],
    [4000, "4"],
    [4500, "4.5"],
    [5000, "5"],
  ]);

  const getInitialFontSize = (): string => {
    const fontSizeValue = getArgByKey(props.sentence, "fontSize");

    if (typeof fontSizeValue === 'string' && Array.from(fontSizes.keys()).includes(fontSizeValue as FontSize)) {
      return fontSizeValue;
    }

    return "medium";
  };

  const getInitialAnimation = (): string => {
    const animationValue = getArgByKey(props.sentence, "animation");

    if (typeof animationValue === 'string' && Array.from(animations.keys()).includes(animationValue as Animation)) {
      return animationValue;
    }

    return "fadeIn";
  };

  const getInitialDelayTime = (): string => {
    const delayTimeValue = getArgByKey(props.sentence, "delayTime");

    if (typeof delayTimeValue === 'number' && Array.from(delayTimes.keys()).includes(delayTimeValue as DelayTime)) {
      return delayTimeValue.toString();
    }
    return "1500";
  };

  const backgroundColor = useValue(getBackgroundColor());
  const fontColor = useValue(getFontColor());
  const fontSize = useValue(getInitialFontSize());
  const animation = useValue(getInitialAnimation());
  const delayTime = useValue(getInitialDelayTime());
  const [localBackgroundColor, setLocalBackgroundColor] = useState(backgroundColor.value);
  const [localFontColor, setLocalFontColor] = useState(fontColor.value);
  const updateExpand = useEditorStore.use.updateExpand();

  const handleLocalBackgroundColorChange = (ev: React.SyntheticEvent<HTMLElement>, newColor: IColor) => {
    setLocalBackgroundColor(newColor);
  };

  const handleLocalFontColorChange = (ev: React.SyntheticEvent<HTMLElement>, newColor: IColor) => {
    setLocalFontColor(newColor);
  };

  const handleSubmit = () => {
    backgroundColor.set(localBackgroundColor);
    fontColor.set(localFontColor);
    submit();
  };

  const submit = () => {
    const introText = introTextList.value.join("|");
    const selectedFontSize = fontSize.value;
    const selectedAnimation = animation.value;
    const selectedDelayTime = delayTime.value;
    const backgroundRgbaColor = `rgba(${backgroundColor.value.r}, ${backgroundColor.value.g}, ${backgroundColor.value.b}, ${backgroundColor.value.a ? backgroundColor.value.a / 100 : 1})`;
    const fontRgbaColor = `rgba(${fontColor.value.r}, ${fontColor.value.g}, ${fontColor.value.b}, ${fontColor.value.a ? fontColor.value.a / 100 : 1})`;
    const holdStr = isHold.value ? ` -hold` : '';
    props.onSubmit(`intro:${introText} -fontSize=${selectedFontSize} -backgroundColor=${backgroundRgbaColor} -fontColor=${fontRgbaColor} -animation=${selectedAnimation} -delayTime=${selectedDelayTime}${holdStr};`);
  };

  const introCompList = introTextList.value.map((text, index) => {
    return <div key={index} style={{ display: "flex" }}>
      <Button 
        onClick={() => {
          const newList = cloneDeep(introTextList.value);
          newList.splice(index, 1);
          introTextList.set(newList);
          submit();
        }}
      >
        {t('$common.delete')}
      </Button>
      <div style={{ padding: '0 0 0 4px' }} />
      <input value={text}
        onChange={(ev) => {
          const newValue = ev.target.value;
          const newList = cloneDeep(introTextList.value);
          newList[index] = newValue;
          introTextList.set(newList);
        }}
        onBlur={submit}
        className={styles.sayInput}
        placeholder={t('value.placeholder')}
        style={{ width: "100%" }}
      />
    </div>;
  });

  return <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {introCompList}
    </div>
    <Button onClick={() => {
      const newList = cloneDeep(introTextList.value);
      newList.push('');
      introTextList.set(newList);
      submit();
    }}>{t('add.button')}</Button>
    <Button onClick={() => updateExpand(props.index)}>
      {t('$效果选项')}
    </Button>
    <TerrePanel sentenceIndex={props.index} title="效果选项">
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex' }}>
          <CommonOptions title={t('font.size')}>
            <Dropdown
              value={fontSizes.get(fontSize.value as FontSize) ?? fontSize.value}
              selectedOptions={[fontSize.value]}
              onOptionSelect={(event, data) => {
                data.optionValue && fontSize.set(data.optionValue as string);
                submit();
              }}
              style={{ minWidth: 0 }}
            >
              {Array.from(fontSizes.entries()).map(([key, value]) => <Option key={key} value={key} >{value}</Option>)}
            </Dropdown>
          </CommonOptions>
          <CommonOptions title={t('font.animation')}>
            <Dropdown
              value={animations.get(animation.value as Animation) ?? animation.value}
              selectedOptions={[animation.value]}
              onOptionSelect={(ev, data) => {
                data.optionValue && animation.set(data.optionValue.toString() ?? "");
                submit();
              }}
              style={{ minWidth: 0 }}
            >
              {Array.from(animations.entries()).map(([key, value]) => <Option key={key} value={key} >{value}</Option>)}
            </Dropdown>
          </CommonOptions>
          <CommonOptions title={t('font.delayTime')}>
            <Dropdown
              value={delayTimes.get(Number(delayTime.value) as DelayTime) ?? delayTime.value}
              selectedOptions={[delayTime.value]}
              onOptionSelect={(ev, data) => {
                data.optionValue && delayTime.set(data.optionValue.toString() ?? "");
                submit();
              }}
              style={{ minWidth: 0 }}
            >
              {Array.from(delayTimes.entries()).map(([key, value]) => <Option key={key} value={String(key)} >{value}</Option>)}
            </Dropdown>
          </CommonOptions>
          <CommonOptions title={t('$结束后保持')}>
            <Switch
              checked={isHold.value}
              onChange={(ev, data) => {
                isHold.set(data.checked ?? false);
                submit();
              }}
            />
          </CommonOptions>
        </div>
        <div style={{ display: 'flex' }}>
          <CommonOptions title={t('colorPicker.backgroundColor')}>
            <ColorPicker
              color={localBackgroundColor}
              onChange={handleLocalBackgroundColorChange}
            />
          </CommonOptions>
          <CommonOptions title={t('colorPicker.fontColor')}>
            <ColorPicker
              color={localFontColor}
              onChange={handleLocalFontColorChange}
            />
          </CommonOptions>
        </div>
        <Button
          style={{ marginTop: '8px' }}
          onClick={handleSubmit}
        >
          {t('colorPicker.submit')}
        </Button>
      </div>
    </TerrePanel>
  </div>;
}
