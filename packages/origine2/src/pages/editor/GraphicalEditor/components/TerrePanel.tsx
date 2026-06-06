import React, {ReactNode, useEffect, useMemo, useState} from "react";
import { Button, DrawerBody, DrawerHeader, DrawerHeaderTitle, Input, OverlayDrawer} from "@fluentui/react-components";
import { Dismiss24Filled, Dismiss24Regular, bundleIcon } from "@fluentui/react-icons";
import useEditorStore from "@/store/useEditorStore";
import styles from "./terrePanel.module.scss";
import { EffectEditorOptionKey, eventBus, GlobalEffectEditorPayload } from "@/utils/eventBus";
import { EffectEditor } from "./EffectEditor";
import CommonTips from "./CommonTips";
import CommonOptions from "./CommonOption";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { extNameMap } from "../../ChooseFile/chooseFileConfig";
import WheelDropdown from "./WheelDropdown";
import { useEaseTypeOptions } from "@/hooks/useEaseTypeOptions";
import { t } from "@lingui/macro";

export function TerrePanel(props: {
  children: ReactNode,
  bottomBarChildren?: ReactNode
  width?: number,
  title: string,
  sentenceIndex: number,
}) {
  const {width = 750} = props;
  const expand = useEditorStore.use.expand();
  const updateExpand = useEditorStore.use.updateExpand();
  const isExpand = expand === props.sentenceIndex;
  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
  return (
    <OverlayDrawer
      open={isExpand}
      onOpenChange={() => updateExpand(0)}
      position="end"
      className={styles.overlayDrawer}
      style={{width:`${width}px`}}
      backdrop={null}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<DismissIcon />}
              onClick={() => updateExpand(0)}
            />
          }
        >
          {props.title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        {props.children}
      </DrawerBody>
      <div className={styles.bottomBar} style={{display: props.bottomBarChildren ? 'inherit' : 'none'}}>
        {props.bottomBarChildren}
      </div>
    </OverlayDrawer>
  );
}

export function GlobalTerrePanel() {
  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
  const [panel, setPanel] = useState<{
    title: string;
    children: ReactNode;
    bottomBarChildren?: ReactNode;
    width?: number;
  } | GlobalEffectEditorPayload | null>(null);

  useEffect(() => {
    const handleOpen = (payload: {
      title: string;
      children: ReactNode;
      bottomBarChildren?: ReactNode;
      width?: number;
    }) => setPanel(payload);
    const handleOpenEffectEditor = (payload: GlobalEffectEditorPayload) => setPanel(payload);
    eventBus.on('editor:open-global-terre-panel', handleOpen);
    eventBus.on('editor:open-global-effect-editor', handleOpenEffectEditor);
    return () => {
      eventBus.off('editor:open-global-terre-panel', handleOpen);
      eventBus.off('editor:open-global-effect-editor', handleOpenEffectEditor);
    };
  }, []);

  const effectEditor = panel && 'editorId' in panel ? panel : null;
  const genericPanel = panel && 'children' in panel ? panel : null;
  return (
    <OverlayDrawer
      open={!!panel}
      onOpenChange={(_, data) => !data.open && setPanel(null)}
      position="end"
      className={styles.overlayDrawer}
      style={{ width: `${panel && 'width' in panel ? panel.width ?? 750 : 750}px` }}
      backdrop={null}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<DismissIcon />}
              onClick={() => setPanel(null)}
            />
          }
        >
          {panel?.title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        {effectEditor
          ? <>
            {effectEditor.tip && <CommonTips text={effectEditor.tip}/>}
            <EffectEditor
              key={effectEditor.editorId}
              json={effectEditor.json}
              sentence={effectEditor.sentence}
              index={effectEditor.index}
              targetPath={effectEditor.targetPath}
              onChange={(value) => eventBus.emit('editor:global-effect-editor-event', {
                editorId: effectEditor.editorId,
                action: 'change',
                value,
              })}
              onUpdate={(value) => eventBus.emit('editor:global-effect-editor-event', {
                editorId: effectEditor.editorId,
                action: 'preview',
                value,
              })}
            />
          </>
          : genericPanel?.children}
      </DrawerBody>
      <div className={styles.bottomBar} style={{display: effectEditor?.options || panel && 'bottomBarChildren' in panel && panel.bottomBarChildren ? 'inherit' : 'none'}}>
        {effectEditor?.options
          ? <EffectEditorOptions panel={effectEditor} setPanel={setPanel}/>
          : genericPanel?.bottomBarChildren}
      </div>
    </OverlayDrawer>
  );
}

function EffectEditorOptions({ panel, setPanel }: {
  panel: GlobalEffectEditorPayload;
  setPanel: React.Dispatch<React.SetStateAction<GlobalEffectEditorPayload | {
    title: string;
    children: ReactNode;
    bottomBarChildren?: ReactNode;
    width?: number;
  } | null>>;
}) {
  const easeOptions = useEaseTypeOptions();
  const blendModeOptions = useMemo(() => new Map([
    ['', t`默认`],
    ['normal', t`正常`],
    ['add', t`线性减淡`],
    ['multiply', t`正片叠底`],
    ['screen', t`滤色`],
  ]), []);
  const update = (key: EffectEditorOptionKey, value: string | number, submit = false) => {
    setPanel({ ...panel, options: { ...panel.options, [key]: value } });
    eventBus.emit('editor:global-effect-editor-event', { editorId: panel.editorId, action: 'option', key, value, submit });
  };
  const options = panel.options!;
  const animation = (key: 'enterAnimation' | 'exitAnimation', title: string) => key in options && (
    <CommonOptions title={title}>
      <>{options[key]}{"\u00a0"}<ChooseFile
        title={title}
        basePath={['animation']}
        selectedFilePath={options[key] ? `${String(options[key])}.json` : ''}
        onChange={(file) => update(key, file?.name.replace(/\.json$/i, '') ?? '', true)}
        extNames={extNameMap.get('json')}
        hiddenFiles={['animationTable.json']}
      /></>
    </CommonOptions>
  );
  const input = (key: 'duration' | 'enterDuration' | 'exitDuration', title: string) => key in options && (
    <CommonOptions title={title}>
      <Input
        value={options[key]?.toString()}
        placeholder={title}
        onChange={(_, data) => {
          const value = Number(data.value);
          update(key, data.value === '' || isNaN(value) ? '' : value);
        }}
        onBlur={() => update(key, options[key] ?? '', true)}
      />
    </CommonOptions>
  );
  return <>
    {animation('enterAnimation', t`选择进入动画文件`)}
    {animation('exitAnimation', t`选择退出动画文件`)}
    {input('duration', t`过渡时间（单位为毫秒）`)}
    {input('enterDuration', t`入场时长（单位为毫秒）`)}
    {input('exitDuration', t`退场时长（单位为毫秒）`)}
    {'ease' in options && <CommonOptions title={t`缓动类型`}><WheelDropdown
      options={easeOptions}
      value={String(options.ease ?? '')}
      onValueChange={(value) => update('ease', value?.toString() ?? '', true)}
    /></CommonOptions>}
    {'blendMode' in options && <CommonOptions title={t`混合模式`}><WheelDropdown
      options={blendModeOptions}
      value={String(options.blendMode ?? '')}
      onValueChange={(value) => update('blendMode', value?.toString() ?? '', true)}
    /></CommonOptions>}
  </>;
}
