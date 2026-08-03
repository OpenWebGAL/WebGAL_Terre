import * as monaco from 'monaco-editor';
import Editor, { Monaco } from '@monaco-editor/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import styles from './textEditor.module.scss';
import axios from 'axios';
import { logger } from '../../../utils/logger';
import debounce from 'lodash/debounce';

import { editorLineHolder, lspSceneName, WG_ORIGINE_RUNTIME } from '../../../runtime/WG_ORIGINE_RUNTIME';
import { EditorPreviewClient } from '../../../utils/editorPreviewClient';
import { eventBus } from '@/utils/eventBus';
import useEditorStore from '@/store/useEditorStore';
import { useGameEditorContext } from '@/store/useGameEditorStore';
import { api } from '@/api';
import { useValue } from "@/hooks/useValue";

interface ITextEditorProps {
  targetPath: string;
  isHide: boolean;
}

export default function TextEditor(props: ITextEditorProps) {
  const target = useGameEditorContext((state) => state.currentTag);
  const tags = useGameEditorContext((state) => state.tags);
  const currentText = useRef('Loading Scene Data......');
  const sceneName = tags.find((e) => e.path === target?.path)!.name;
  const isAutoWarp = useEditorStore.use.isAutoWarp();
  const isEditorReady = useValue(false);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) {
    logger.debug('脚本编辑器挂载');
    lspSceneName.value = sceneName;
    editorRef.current = editor;

    configureMonaco(editor, monaco);

    editor.onDidChangeCursorPosition(debounce((event: monaco.editor.ICursorPositionChangedEvent) => {
      const previousCursorPosition = editorLineHolder.getScenePosition(props.targetPath);
      const editorValue = editor.getValue();
      const targetValue = editorValue.split('\n')[event.position.lineNumber - 1];
      if (event.reason === monaco.editor.CursorChangeReason.Explicit) {
        if (event.position.lineNumber !== previousCursorPosition.lineNumber) {
          EditorPreviewClient.sendSyncScene({
            scenePath: target?.path ?? '',
            lineNumber: event.position.lineNumber,
            lineCommandString: targetValue,
          });
        }
      }
      editorLineHolder.recordSceneEditingPosition(props.targetPath, event.position);
    }));
    const domNode = editor.getContainerDomNode();
    const dropHandler = (e: DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer?.getData("text/plain");
      const position = editor.getTargetAtClientPoint(e.clientX, e.clientY);
      if (position?.range && data) {
        editor.executeEdits("drop", [
          {
            range: position.range,
            text: data,
            forceMoveMarkers: true,
          },
        ]);
      }
    };
    domNode.addEventListener("drop", dropHandler);
    editor.onDidDispose(() => {
      domNode.removeEventListener("drop", dropHandler);
    });
    editor.updateOptions({
      unicodeHighlight: { ambiguousCharacters: false },
      wordWrap: isAutoWarp ? 'on' : 'off',
      smoothScrolling: true,
      quickSuggestions: { other: true, comments: true, strings: true },
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
    };
    monaco.languages.setLanguageConfiguration('webgal', languageConfiguration);
  }

  useEffect(() => {
    editorRef?.current?.updateOptions?.({ wordWrap: isAutoWarp ? 'on' : 'off' });
  }, [isAutoWarp]);

  const submitChange = useMemo(() => debounce((value: string | undefined, ev: monaco.editor.IModelContentChangedEvent) => {
    logger.debug('编辑器提交更新');
    const lineNumber = editorLineHolder.getSceneLine(props.targetPath);
    if (value || value === '') currentText.current = value;
    eventBus.emit('editor:update-scene', { scene: currentText.current });
    api.assetsControllerEditTextFile({ textFile: currentText.current, path: props.targetPath }).then((res) => {
      const targetValue = currentText.current.split('\n')[lineNumber - 1];
      EditorPreviewClient.sendSyncScene({
        scenePath: target?.path ?? '',
        lineNumber,
        lineCommandString: targetValue,
      });
    });
  }, 500), [props.targetPath, target?.path]);

  const handleChange = (value: string | undefined, ev: monaco.editor.IModelContentChangedEvent) => {
    if (!isEditorReady.value) return;
    submitChange(value, ev);
  };

  useEffect(() => {
    return () => submitChange.flush();
  }, [submitChange]);

  const syncCurrentLine = useCallback(() => {
    const lineNumber = editorLineHolder.getSceneLine(props.targetPath) || editorRef.current?.getPosition()?.lineNumber || 1;
    EditorPreviewClient.sendSyncScene({
      scenePath: target?.path ?? '',
      lineNumber,
      lineCommandString: currentText.current.split('\n')[lineNumber - 1] ?? '',
      force: true,
    });
  }, [props.targetPath, target?.path]);

  useEffect(() => {
    eventBus.on('editor:sync-current-line', syncCurrentLine);
    return () => {
      eventBus.off('editor:sync-current-line', syncCurrentLine);
    };
  }, [syncCurrentLine]);

  function updateEditData() {
    const path = props.targetPath;
    axios
      .get(path)
      .then((res) => res.data)
      .then((data) => {
        const dataStr = data.toString();
        if (dataStr === currentText.current) {
          return;
        }
        currentText.current = dataStr;
        eventBus.emit('editor:update-scene', { scene: dataStr });
        const model = editorRef.current?.getModel();
        model?.applyEdits([
          {
            range: model.getFullModelRange(),
            text: currentText.current,
            forceMoveMarkers: true
          }
        ]);
        isEditorReady.value = true;
        const targetPosition = editorLineHolder.getScenePosition(props.targetPath);
        editorRef?.current?.setPosition(targetPosition);
        editorRef?.current?.revealPositionInCenterIfOutsideViewport(targetPosition, monaco.editor.ScrollType.Immediate);
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
        path={props.targetPath}
        defaultValue={currentText.current}
      />
    </div>
  );
}
