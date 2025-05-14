import * as monaco from 'monaco-editor';
import Editor, { Monaco } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import styles from './textEditor.module.scss';
import axios from 'axios';
import { logger } from '../../../utils/logger';
import debounce from 'lodash/debounce';

// 语法高亮文件
import { editorLineHolder, lspSceneName, WG_ORIGINE_RUNTIME } from '../../../runtime/WG_ORIGINE_RUNTIME';
import { WsUtil } from '../../../utils/wsUtil';
import { eventBus } from '@/utils/eventBus';
import useEditorStore from '@/store/useEditorStore';
import { useGameEditorContext } from '@/store/useGameEditorStore';
import { api } from '@/api';
import {useValue} from "@/hooks/useValue";

interface ITextEditorProps {
  targetPath: string;
  isHide: boolean;
}

export default function TextEditor(props: ITextEditorProps) {
  const target = useGameEditorContext((state) => state.currentTag);
  const tags = useGameEditorContext((state) => state.tags);
  const currentText = { value: 'Loading Scene Data......' };
  const sceneName = tags.find((e) => e.path === target?.path)!.name;
  const isAutoWarp = useEditorStore.use.isAutoWarp();
  const isEditorReady = useValue(false); // 读取完脚本才能算准备就绪

  // 准备获取 Monaco
  // 建立 Ref
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  /**
   * 处理挂载事件
   * @param {any} editor
   * @param {any} monaco
   */
  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) {
    logger.debug('脚本编辑器挂载');
    lspSceneName.value = sceneName;
    editorRef.current = editor;

    configureMonaco(editor, monaco);

    editor.onDidChangeCursorPosition(debounce((event:monaco.editor.ICursorPositionChangedEvent) => {
      const previousCursorPosition = editorLineHolder.getScenePosition(props.targetPath)
      const editorValue = editor.getValue();
      const targetValue = editorValue.split('\n')[event.position.lineNumber - 1];
      if (event.reason === monaco.editor.CursorChangeReason.Explicit) {
        if (event.position.lineNumber !== previousCursorPosition.lineNumber) {
          WsUtil.sendSyncCommand(target?.path??'', event.position.lineNumber, targetValue);
        }
      }
      editorLineHolder.recordSceneEditingPosition(props.targetPath, event.position);
    }));
    editor.updateOptions({
      unicodeHighlight: { ambiguousCharacters: false },
      wordWrap: isAutoWarp ? 'on' : 'off' ,
      smoothScrolling: true,
    });
    updateEditData();
  }

  function configureMonaco(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) {
    const languageConfiguration: monaco.languages.LanguageConfiguration = {
      comments: {
        lineComment: ";",
      },
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
      ],
    }
    monaco.languages.setLanguageConfiguration('webgal', languageConfiguration);
  }

  useEffect(() => {
    editorRef?.current?.updateOptions?.({ wordWrap: isAutoWarp ? 'on' : 'off' });
  }, [isAutoWarp]);

  /**
   * handle monaco change
   * @param {string} value
   * @param {any} ev
   */
  const handleChange = debounce((value: string | undefined, ev: monaco.editor.IModelContentChangedEvent) => {
    if(!isEditorReady.value) return;
    logger.debug('编辑器提交更新');
    const previousCursorPosition = editorLineHolder.getScenePosition(props.targetPath)
    // const trueLineNumber = getTrueLinenumber(lineNumber, value ?? "");
    if (value) currentText.value = value;
    eventBus.emit('update-scene', currentText.value);
    api.assetsControllerEditTextFile({textFile: currentText.value, path: props.targetPath}).then((res) => {
      const targetValue = currentText.value.split('\n')[previousCursorPosition.lineNumber - 1];
      WsUtil.sendSyncCommand(target?.path??'', previousCursorPosition.lineNumber, targetValue);
    });
  }, 500);

  function updateEditData() {
    const path = props.targetPath;
    axios
      .get(path)
      .then((res) => res.data)
      .then((data) => {
        // currentText.set(data);
        currentText.value = data.toString();
        eventBus.emit('update-scene', data.toString());
        editorRef.current?.getModel()?.setValue(currentText.value);
        isEditorReady.value = true;
        const targetPosition = editorLineHolder.getScenePosition(props.targetPath);
        editorRef?.current?.setPosition(targetPosition);
        editorRef?.current?.revealPositionInCenterIfOutsideViewport(targetPosition);
      });
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateEditData();
      }
    };

    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      style={{ display: props.isHide ? 'none' : 'block', zIndex: 999, overflow: 'auto' }}
      className={styles.textEditor_main}
    >
      <Editor
        height="100%"
        width="100%"
        onMount={handleEditorDidMount}
        onChange={handleChange}
        defaultLanguage="webgal"
        language="webgal"
        defaultValue={currentText.value}
      />
    </div>
  );
}
