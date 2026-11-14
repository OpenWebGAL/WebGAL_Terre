import { useEffect, useMemo } from 'react';
import { Button, Dropdown, Option } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import CommonOptions from '../components/CommonOption';
import { getArgByKey } from '../utils/getArgByKey';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '../../../../hooks/useValue';
import TerreToggle from '../../../../components/terreToggle/TerreToggle';
import useEditorStore from '@/store/useEditorStore';
import WheelDropdown from '@/pages/editor/GraphicalEditor/components/WheelDropdown';
import { combineSubmitString } from '@/utils/combineSubmitString';
import { useJsonFileText } from '@/pages/editor/ResourceDisplay/JsonResourceDisplay/JsonResourceDisplay';
import {
  buildCharacterOptionsMap, buildPositionArgs, buildPresetOptionsMap, FigurePosition,
  formatCharacterContent, orderSelectedComponents, parseComponentList, parseFigureJsonOptions,
  resolveCharacterTarget, useCharacterDirectories, useCharacterEffect, useFigurePositions,
} from './useCharacterOptions';

interface IAssemblyProps {
  presetName: string;
  isCustomComponents: boolean;
  componentsText: string;
  presetKeys: string[];
  componentKeys: string[];
  onToggleMode: (isCustom: boolean) => void;
  onPresetChange: (preset: string) => void;
  onComponentsChange: (value: string, submitNow: boolean) => void;
  onComponentsBlur: () => void;
}

function CharacterAssemblyFields(props: IAssemblyProps) {
  const presetOptions = useMemo(
    () => buildPresetOptionsMap(props.presetKeys, props.presetName),
    [props.presetKeys, props.presetName],
  );
  const selected = useMemo(() => parseComponentList(props.componentsText), [props.componentsText]);
  return (
    <>
      <CommonOptions key="assemblyMode" title={t`自定义图层`}>
        <TerreToggle
          title="" onChange={props.onToggleMode}
          onText={t`自定义图层`} offText={t`使用预设`} isChecked={props.isCustomComponents}
        />
      </CommonOptions>
      {!props.isCustomComponents ? (
        <CommonOptions key="preset" title={t`预设`}>
          <WheelDropdown
            options={presetOptions} value={props.presetName}
            onValueChange={(v) => props.onPresetChange(v?.toString() ?? '')}
          />
        </CommonOptions>
      ) : (
        <CommonOptions key="components" title={t`图层组合`}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {props.componentKeys.length > 0 && (
              <Dropdown
                size="small" multiselect value={selected.join(', ')} selectedOptions={selected}
                placeholder={t`选择图层`} style={{ minWidth: 0 }}
                onOptionSelect={(_, data) => {
                  const custom = selected.filter((key) => !props.componentKeys.includes(key));
                  const next = orderSelectedComponents([...data.selectedOptions, ...custom], props.componentKeys);
                  props.onComponentsChange(next.join(','), true);
                }}
              >
                {props.componentKeys.map((key) => <Option key={key} value={key}>{key}</Option>)}
              </Dropdown>
            )}
            <input
              value={props.componentsText} onBlur={props.onComponentsBlur} className={styles.sayInput}
              onChange={(ev) => props.onComponentsChange(ev.target.value ?? '', false)}
              placeholder={t`例如：base,dress,smile`}
              style={{ width: props.componentKeys.length > 0 ? '160px' : '100%' }}
            />
          </div>
        </CommonOptions>
      )}
    </>
  );
}

function CharacterAssemblyWithJson(props: Omit<IAssemblyProps, 'presetKeys' | 'componentKeys'> & { figureJsonUrl: string }) {
  const { data } = useJsonFileText(props.figureJsonUrl);
  const { presetKeys, componentKeys } = useMemo(() => parseFigureJsonOptions(data), [data]);
  return <CharacterAssemblyFields {...props} presetKeys={presetKeys} componentKeys={componentKeys} />;
}

export default function Character(props: ISentenceEditorProps) {
  const gameDir = useEditorStore.use.subPage();
  const discoveredPaths = useCharacterDirectories(gameDir);
  const knownCharacterSet = useMemo(() => new Set(discoveredPaths), [discoveredPaths]);
  const componentsArg = String(getArgByKey(props.sentence, 'components') ?? '');
  const hasClearArg = getArgByKey(props.sentence, 'clear') === true;
  const isIncomingClear = hasClearArg || props.sentence.content === '' || props.sentence.content === 'none';
  const initialTarget = isIncomingClear
    ? { characterPath: 'none', presetName: '' }
    : resolveCharacterTarget(props.sentence.content, componentsArg, knownCharacterSet);

  const characterPath = useValue(initialTarget.characterPath);
  const presetName = useValue(initialTarget.presetName);
  const isCustomComponents = useValue(Boolean(componentsArg));
  const componentsText = useValue(componentsArg);
  const figurePosition = useValue<FigurePosition>('');
  const id = useValue(getArgByKey(props.sentence, 'id').toString() ?? '');
  const zIndex = useValue(String(getArgByKey(props.sentence, 'zIndex') ?? ''));
  const isGoNext = useValue(Boolean(getArgByKey(props.sentence, 'next')));
  const figurePositions = useFigurePositions();

  useEffect(() => {
    if (isIncomingClear) {
      characterPath.set('none');
      presetName.set('');
      return;
    }
    const resolved = resolveCharacterTarget(props.sentence.content, componentsArg, knownCharacterSet);
    characterPath.set(resolved.characterPath);
    presetName.set(resolved.presetName);
  }, [props.sentence.content, isIncomingClear, componentsArg, knownCharacterSet]);
  useEffect(() => { componentsText.set(componentsArg); }, [componentsArg]);
  useEffect(() => {
    figurePositions.forEach((_, pos) => { if (pos !== '' && getArgByKey(props.sentence, pos)) figurePosition.set(pos); });
  }, []);

  const isNoFile = characterPath.value === '' || characterPath.value === 'none';
  const submit = () => {
    const noFileNow = characterPath.value === '' || characterPath.value === 'none';
    const content = noFileNow ? 'none' : formatCharacterContent(characterPath.value, presetName.value, isCustomComponents.value);
    const componentsValue = !noFileNow && isCustomComponents.value ? componentsText.value : '';
    props.onSubmit(combineSubmitString(props.sentence.commandRaw, content, props.sentence.args, [
      ...buildPositionArgs(figurePositions, figurePosition.value),
      { key: 'clear', value: false },
      { key: 'id', value: id.value },
      { key: 'components', value: componentsValue },
      { key: 'zIndex', value: zIndex.value },
      ...effect.submitArgs(),
      { key: 'next', value: isGoNext.value },
    ], props.sentence.inlineComment));
  };

  const effect = useCharacterEffect(props, () => id.value || `fig-${figurePosition.value || 'center'}`, submit);
  const characterOptions = useMemo(() => buildCharacterOptionsMap(discoveredPaths, characterPath.value), [discoveredPaths, characterPath.value]);
  const placeholder = t`选择角色`;
  const figureJsonUrl = gameDir && characterPath.value && characterPath.value !== 'none' && characterPath.value !== placeholder
    ? `games/${gameDir}/game/figure/${characterPath.value}/figure.json` : '';
  const assemblyProps: Omit<IAssemblyProps, 'presetKeys' | 'componentKeys'> = {
    presetName: presetName.value,
    isCustomComponents: isCustomComponents.value,
    componentsText: componentsText.value,
    onToggleMode: (custom) => { isCustomComponents.set(custom); if (!custom) componentsText.set(''); submit(); },
    onPresetChange: (preset) => { presetName.set(preset); submit(); },
    onComponentsChange: (value, submitNow) => { componentsText.set(value); if (submitNow) submit(); },
    onComponentsBlur: submit,
  };

  return (
    <div className={styles.sentenceEditorContent}>
      <div className={styles.editItem}>
        <CommonOptions key="isNoDialog" title={t`清除角色`}>
          <TerreToggle
            title="" onText={t`清除角色`} offText={t`显示角色`} isChecked={isNoFile}
            onChange={(v) => {
              if (v) {
                characterPath.set('none');
                presetName.set('');
              } else if (props.sentence.content && props.sentence.content !== 'none') {
                const restored = resolveCharacterTarget(props.sentence.content, componentsArg, knownCharacterSet);
                characterPath.set(restored.characterPath);
                presetName.set(restored.presetName);
              } else {
                characterPath.set(discoveredPaths[0] ?? placeholder);
                presetName.set('');
              }
              submit();
            }}
          />
        </CommonOptions>
        {!isNoFile && (
          <>
            <CommonOptions key="character" title={t`角色`}>
              <WheelDropdown
                options={characterOptions} value={characterPath.value}
                onValueChange={(v) => { characterPath.set(v?.toString() ?? ''); presetName.set(''); submit(); }}
              />
            </CommonOptions>
            {figureJsonUrl
              ? <CharacterAssemblyWithJson figureJsonUrl={figureJsonUrl} {...assemblyProps} />
              : <CharacterAssemblyFields {...assemblyProps} presetKeys={[]} componentKeys={[]} />}
          </>
        )}
        <CommonOptions title={t`z-index`} key="z-index">
          <input
            value={zIndex.value} onChange={(ev) => zIndex.set(ev.target.value ?? '')} onBlur={submit}
            className={styles.sayInput} placeholder="1, 2, 3, ..." style={{ width: '100%' }}
          />
        </CommonOptions>
        <CommonOptions title={t`角色位置`} key="3">
          <WheelDropdown
            options={figurePositions} value={figurePosition.value}
            onValueChange={(v) => { figurePosition.set((v?.toString() as FigurePosition) ?? ''); submit(); }}
          />
        </CommonOptions>
        <CommonOptions title={t`角色ID（可选）`} key="4">
          <input
            value={id.value} onChange={(ev) => id.set(ev.target.value ?? '')} onBlur={submit}
            className={styles.sayInput} placeholder={t`角色 ID`} style={{ width: '100%' }}
          />
        </CommonOptions>
        <CommonOptions key="23" title={t`显示效果`}>
          <Button onClick={effect.showEffectEditor}>{t`打开效果编辑器`}</Button>
        </CommonOptions>
        <CommonOptions key="2" title={t`连续执行`}>
          <TerreToggle
            title="" onText={t`本句执行后执行下一句`} offText={t`本句执行后等待`} isChecked={isGoNext.value}
            onChange={(v) => { isGoNext.set(v); submit(); }}
          />
        </CommonOptions>
        {props.extraOptions}
      </div>
    </div>
  );
}
