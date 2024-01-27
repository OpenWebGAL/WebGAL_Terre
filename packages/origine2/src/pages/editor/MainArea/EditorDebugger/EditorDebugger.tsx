import s from './editorDebugger.module.scss';
import {useValue} from "@/hooks/useValue";
import JsonView from '@uiw/react-json-view';
import {githubLightTheme} from "@/pages/editor/MainArea/EditorDebugger/theme";
import {ReactNode, useEffect} from "react";
import {eventBus} from "@/utils/eventBus";
import {Terminal} from 'primereact/terminal';
import {TerminalService} from 'primereact/terminalservice';
import {WsUtil} from "@/utils/wsUtil";

export default function EditorDebugger() {
  const mode = useValue<'state' | 'console'>('console');

  const editorValue = useValue<Object>({});

  useEffect(() => {

    const handleMessage = (message: string) => {
      let obj = {};
      try {
        const result = JSON.parse(message);
        if(result) obj=result;
      }catch (e){
        // 什么也不做
        // 错误处理，你为什么只是看着！！！！！！
      }
      // @ts-ignore
      const value = obj?.stageSyncMsg;
      if (value) {
        editorValue.set(value);
      }
    };

    // @ts-ignore
    eventBus.on('get-ws-message', handleMessage);

    return () => {
      // @ts-ignore
      eventBus.off('get-ws-message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const commandHandler = (text: string) => {
      WsUtil.sendExeCommand(text);
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
