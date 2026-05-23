import s from './editorDebugger.module.scss';
import {useValue} from "@/hooks/useValue";
import JsonView from '@uiw/react-json-view';
import {githubLightTheme} from "@/pages/editor/MainArea/EditorDebugger/theme";
import {ReactNode, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent} from "react";
import {eventBus} from "@/utils/eventBus";
import {Terminal} from 'primereact/terminal';
import {TerminalService} from 'primereact/terminalservice';
import {EditorPreviewClient} from "@/utils/editorPreviewClient";
import {Button, Input, Switch} from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import {createId} from "@/utils/createId";
import type {IDebugVariable} from "@/types/editor";
import {t} from "@lingui/macro";

const DEFAULT_DEBUGGER_HEIGHT = 220;
const MIN_DEBUGGER_HEIGHT = 96;

export default function EditorDebugger() {
  const mode = useValue<'state' | 'console' | 'variables'>('console');
  const [debuggerHeight, setDebuggerHeight] = useState(DEFAULT_DEBUGGER_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const lastYRef = useRef(0);
  const heightRef = useRef(debuggerHeight);

  const editorValue = useValue<object>(EditorPreviewClient.getLastStageSnapshot()?.stageState ?? {});
  const debugVariables = useEditorStore.use.debugVariables();
  const updateDebugVariables = useEditorStore.use.updateDebugVariables();
  const language = useEditorStore.use.language();
  const variableDocUrl = `https://docs.openwebgal.com${language === 'zhCn' ? '' : `/${language === 'ja' ? 'ja' : 'en'}`}/webgal-script/variable.html#%E9%95%BF%E6%95%88%E5%8F%98%E9%87%8F-%E5%85%A8%E5%B1%80%E5%8F%98%E9%87%8F`;

  useEffect(() => {
    const handleStageSnapshot = ({ snapshot }: { snapshot: { stageState: object } }) => {
      editorValue.set(snapshot.stageState);
    };

    eventBus.on('editor-preview:stage-snapshot', handleStageSnapshot);

    return () => {
      eventBus.off('editor-preview:stage-snapshot', handleStageSnapshot);
    };
  }, []);

  useEffect(() => {
    const commandHandler = (text: string) => {
      EditorPreviewClient.runSnippet(text);
      TerminalService.emit('response', 'Command sent.');
    };

    TerminalService.on('command', commandHandler);

    return () => {
      TerminalService.off('command', commandHandler);
    };
  }, []);

  useEffect(() => {
    if (!isDragging) heightRef.current = debuggerHeight;
  }, [debuggerHeight, isDragging]);

  const handleResizeMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    heightRef.current = debuggerHeight;
    lastYRef.current = event.clientY;
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';

    const moveHandler = (event: MouseEvent) => {
      event.preventDefault();
      const deltaY = event.clientY - lastYRef.current;
      const newHeight = Math.max(MIN_DEBUGGER_HEIGHT, heightRef.current - deltaY);
      heightRef.current = newHeight;
      lastYRef.current = event.clientY;
      setDebuggerHeight(newHeight);
    };

    const upHandler = () => setIsDragging(false);

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", upHandler);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      document.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mouseup", upHandler);
    };
  }, [isDragging]);

  const stateEditor = <div>
    <JsonView style={{...githubLightTheme, overflow: 'auto',fontFamily:'"JetBrains Mono", monospace'}} value={editorValue.value}/>
  </div>;

  const gameVars = useMemo(() => {
    const vars = (editorValue.value as { GameVar?: Record<string, string | boolean | number> }).GameVar;
    return vars && typeof vars === 'object' ? Object.entries(vars) : [];
  }, [editorValue.value]);

  const setDebugVariables = (variables: IDebugVariable[]) => updateDebugVariables(variables);
  const updateDebugVariable = (id: string, patch: Partial<IDebugVariable>) =>
    setDebugVariables(debugVariables.map(item => item.id === id ? { ...item, ...patch } : item));
  const deleteDebugVariable = (id: string) => setDebugVariables(debugVariables.filter(item => item.id !== id));
  const addDebugVariable = () => setDebugVariables([...debugVariables, { id: createId(), key: '', value: '', isGlobal: false }]);

  const variablesEditor = <div className={s.variablesPanel}>
    <div className={s.variableSection}>
      <div className={s.variableSectionHeader}>
        <div className={s.variableHeaderText}>
          <div className={s.variableSectionTitle}>{t`调试变量`}</div>
          <div className={s.variableSectionDesc}>
            <span>{t`实时预览开始时自动注入，正式游戏不会触发。`}</span>
            <a href={variableDocUrl} target="_blank" rel="noreferrer">{t`长效变量用途`}</a>
          </div>
        </div>
        <div className={s.variableToolbar}>
          <Button size="small" onClick={addDebugVariable}>{t`新增变量`}</Button>
        </div>
      </div>
      <div className={s.variableTable}>
        <div className={s.variableTableHeader}>
          <span>{t`变量名`}</span>
          <span>{t`值或表达式`}</span>
          <span>{t`长效变量`}</span>
          <span>{t`操作`}</span>
        </div>
        {debugVariables.map(item => <div className={s.variableRow} key={item.id}>
          <Input className={s.variableInput} size="small" value={item.key} placeholder={t`变量名`} onChange={(_, data) => updateDebugVariable(item.id, { key: data.value })} />
          <Input className={s.variableInput} size="small" value={item.value} placeholder={t`值或表达式`} onChange={(_, data) => updateDebugVariable(item.id, { value: data.value })} />
          <Switch className={s.variableSwitch} label={t`长效`} checked={item.isGlobal} onChange={(_, data) => updateDebugVariable(item.id, { isGlobal: data.checked })} />
          <Button size="small" onClick={() => deleteDebugVariable(item.id)}>{t`删除`}</Button>
        </div>)}
        {debugVariables.length === 0 && <div className={s.variableEmpty}>{t`暂无调试变量，点击“新增变量”创建。`}</div>}
      </div>
    </div>
    <div className={s.variableSection}>
      <div className={s.variableSectionHeader}>
        <div className={s.variableHeaderText}>
          <div className={s.variableSectionTitle}>{t`当前预览变量`}</div>
          <div className={s.variableSectionDesc}>{t`来自实时预览快照`}</div>
        </div>
      </div>
      <div className={s.variableSnapshot}>
        {gameVars.length > 0
          ? gameVars.map(([key, value]) => <div className={s.snapshotRow} key={key}><span>{key}</span><code>{String(value)}</code></div>)
          : <div className={s.variableEmpty}>{t`暂无变量快照`}</div>}
      </div>
    </div>
  </div>;

  const webgalConsole = <div className={s.consolePanel}>
    <Terminal
      prompt="WebGAL Script >" pt={{
        root: {className: s.root},
        prompt: {className: s.prompt},
        command: {className: s.command},
        response: {className: s.response},
        container: {className: s.command},
        commandText: {className: s.command}
      }}/>
  </div>;

  const showComp = mode.value === 'state' ? stateEditor : mode.value === 'variables' ? variablesEditor : webgalConsole;
  return <div className={s.main} style={{ height: `${debuggerHeight}px` }}>
    <div
      className={`${s.resizeHandle} ${isDragging ? s.resizeHandleActive : ''}`}
      onMouseDown={handleResizeMouseDown}>
      <div className={s.resizeHandleLine}/>
    </div>
    <div className={s.debuggerChecker}>
      <DebuggerCheckButton isChecked={mode.value === 'console'} onClick={() => mode.set('console')}>
        Console
      </DebuggerCheckButton>
      <DebuggerCheckButton isChecked={mode.value === 'state'} onClick={() => mode.set('state')}>
        State
      </DebuggerCheckButton>
      <DebuggerCheckButton isChecked={mode.value === 'variables'} onClick={() => mode.set('variables')}>
        Variables
      </DebuggerCheckButton>
    </div>
    <div className={s.debuggerContent}>
      {showComp}
    </div>
  </div>;
}

function DebuggerCheckButton(props: { isChecked: boolean, children: ReactNode, onClick: () => void }) {
  return <div className={s.debuggerButton + ' ' + (props.isChecked ? s.checked : '')} onClick={() => props.onClick()}>
    {props.children}
  </div>;
}
