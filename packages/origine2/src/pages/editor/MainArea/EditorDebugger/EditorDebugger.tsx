import s from './editorDebugger.module.scss';
import {useValue} from "@/hooks/useValue";
import JsonView from '@uiw/react-json-view';
import {githubLightTheme} from "@/pages/editor/MainArea/EditorDebugger/theme";
import {ReactNode, useEffect} from "react";
import {eventBus} from "@/utils/eventBus";
import {Terminal} from 'primereact/terminal';
import {TerminalService} from 'primereact/terminalservice';
import {EditorPreviewClient} from "@/utils/editorPreviewClient";

export default function EditorDebugger() {
  const mode = useValue<'state' | 'console'>('console');

  const editorValue = useValue<object>(EditorPreviewClient.getLastStageSnapshot()?.stageState ?? {});

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

  const stateEditor = <div>
    <JsonView style={{...githubLightTheme, overflow: 'auto',fontFamily:'"JetBrains Mono", monospace'}} value={editorValue.value}/>
  </div>;

  const webgalConsole = <div>
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

  const showComp = mode.value === 'state' ? stateEditor : webgalConsole;
  return <div className={s.main}>
    <div className={s.debuggerChecker}>
      <DebuggerCheckButton isChecked={mode.value === 'console'} onClick={() => mode.set('console')}>
        Console
      </DebuggerCheckButton>
      <DebuggerCheckButton isChecked={mode.value === 'state'} onClick={() => mode.set('state')}>
        State
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
