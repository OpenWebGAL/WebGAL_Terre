import * as monaco from 'monaco-editor';
import Editor, { Monaco } from '@monaco-editor/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import styles from './textEditor.module.scss';
import axios from 'axios';
import { logger } from '../../../utils/logger';
import debounce from 'lodash/debounce';

// 语法高亮文件
import { editorLineHolder, lspSceneName, WG_ORIGINE_RUNTIME } from '../../../runtime/WG_ORIGINE_RUNTIME';
import { EditorPreviewClient } from '../../../utils/editorPreviewClient';
import { eventBus } from '@/utils/eventBus';
import useEditorStore from '@/store/useEditorStore';
import { useGameEditorContext } from '@/store/useGameEditorStore';
import { api } from '@/api';
import { t } from '@lingui/macro';
import { useValue } from '@/hooks/useValue';
import { Button } from '@fluentui/react-components';

// 最近一次通过点击光标同步到引擎的场景，所有文本编辑器标签页共享
let lastClickSyncedScenePath = '';

interface ITextEditorProps {
  targetPath: string;
  isHide: boolean;
}

export default function TextEditor(props: ITextEditorProps) {
  const target = useGameEditorContext((state) => state.currentTag);
  const tags = useGameEditorContext((state) => state.tags);
  // 加载状态只在界面展示，不能作为场景文本进入保存流程。
  const currentText = useRef('');
  const sceneName = tags.find((e) => e.path === target?.path)!.name;
  const isAutoWarp = useEditorStore.use.isAutoWarp();
  const isEditorReady = useValue(false);
  const loadError = useValue<string | null>(null);
  const loadedPath = useRef<string | null>(null);
  const applyingRemoteText = useRef(false);
  const request = useRef<AbortController | null>(null);
  const requestSequence = useRef(0);
  const editVersion = useRef(0);
  const savedVersion = useRef(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

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

    editor.onDidChangeCursorPosition(debounce((event: monaco.editor.ICursorPositionChangedEvent) => {
      const previousCursorPosition = editorLineHolder.getScenePosition(props.targetPath);
      const editorValue = editor.getValue();
      const targetValue = editorValue.split('\n')[event.position.lineNumber - 1];
      if (event.reason === monaco.editor.CursorChangeReason.Explicit) {
        if (loadedPath.current !== props.targetPath) return;
        const scenePath = target?.path ?? '';
        // 切换标签页后引擎仍停留在其他场景，此时即使点击的是已记录的同一行也需要同步
        const isSceneChanged = scenePath !== lastClickSyncedScenePath;
        if (event.position.lineNumber !== previousCursorPosition.lineNumber || isSceneChanged) {
          lastClickSyncedScenePath = scenePath;
          EditorPreviewClient.sendSyncScene({
            scenePath,
            lineNumber: event.position.lineNumber,
            lineCommandString: targetValue,
          });
        }
      }
      editorLineHolder.recordSceneEditingPosition(props.targetPath, event.position);
    }));
    // 由于 monaco 接收拖拽进来的文字时, 会在末尾添加 $0
    // 这里手动实现接收拖拽进来的文字, 以避开这个问题
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

  /**
   * handle monaco change
   * @param {string} value
   * @param {any} ev
   */
  const submitChange = useMemo(() => debounce((value: string, version: number) => {
    logger.debug('编辑器提交更新');
    // 这里直接使用临时储存的行数, 一般来说光标位置就在改变的行
    const lineNumber = editorLineHolder.getSceneLine(props.targetPath);
    eventBus.emit('editor:update-scene', { scene: value });
    // 按修改顺序保存，避免较早的请求后完成并覆盖较新的内容。
    saveQueue.current = saveQueue.current.then(() => api.assetsControllerEditTextFile({textFile: value, path: props.targetPath})).then((res) => {
      // 后端写入失败时仍返回成功状态码，需同时检查写入结果。
      if ((res.data as unknown) !== 'Updated.') throw new Error('Scene save failed');
      if (loadedPath.current !== props.targetPath) return;
      savedVersion.current = Math.max(savedVersion.current, version);
      if (version === editVersion.current) loadError.set(null);
      const targetValue = value.split('\n')[lineNumber - 1];
      EditorPreviewClient.sendSyncScene({
        scenePath: target?.path ?? '',
        lineNumber,
        lineCommandString: targetValue,
      });
    }).catch(() => {
      if (loadedPath.current !== props.targetPath) return;
      loadError.set(t`场景保存失败，请重试`);
    });
  }, 500), [props.targetPath, target?.path]);

  const handleChange = (value: string | undefined) => {
    if (loadedPath.current !== props.targetPath || applyingRemoteText.current || value === undefined) return;
    currentText.current = value;
    editVersion.current += 1;
    submitChange(value, editVersion.current);
  };

  useEffect(() => {
    return () => submitChange.flush();
  }, [submitChange]);

  const syncCurrentLine = useCallback(() => {
    if (loadedPath.current !== props.targetPath) return;
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

  const updateEditData = useCallback(() => {
    const path = props.targetPath;
    const model = editorRef.current?.getModel();
    // 焦点事件可能早于 Monaco 挂载，尚未保存的修改也不能被磁盘内容覆盖。
    if (!model || editVersion.current !== savedVersion.current) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const sequence = ++requestSequence.current;
    const version = editVersion.current;
    loadError.set(null);
    axios
      .get<string>(path, {
        signal: controller.signal,
        timeout: 15000,
        responseType: 'text',
        transformResponse: [(data) => data],
      })
      .then((res) => res.data)
      .then((data) => {
        if (controller.signal.aborted || sequence !== requestSequence.current || version !== editVersion.current || editorRef.current?.getModel() !== model) return;
        if (typeof data !== 'string') throw new Error('Invalid scene text response');
        // 已加载且磁盘内容未变时直接返回，保留用户的选区与滚动位置。
        if (loadedPath.current === path && model.getValue() === data) return;
        applyingRemoteText.current = true;
        try {
          if (model.getValue() !== data) {
            model.applyEdits([{ range: model.getFullModelRange(), text: data, forceMoveMarkers: true }]);
          }
        } finally {
          applyingRemoteText.current = false;
        }
        currentText.current = data;
        loadedPath.current = path;
        isEditorReady.value = true;
        eventBus.emit('editor:update-scene', { scene: data });
        const targetPosition = editorLineHolder.getScenePosition(props.targetPath);
        editorRef?.current?.setPosition(targetPosition);
        editorRef?.current?.revealPositionInCenterIfOutsideViewport(targetPosition, monaco.editor.ScrollType.Immediate);
      }).catch(() => {
        if (controller.signal.aborted || sequence !== requestSequence.current || version !== editVersion.current) return;
        loadError.set(t`场景读取失败，请检查文件是否存在后重试`);
      });
  }, [props.targetPath]);

  useEffect(() => {
    loadedPath.current = null;
    isEditorReady.value = false;
    editVersion.current = 0;
    savedVersion.current = 0;
    updateEditData();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateEditData();
      }
    };

    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      request.current?.abort();
      requestSequence.current += 1;
      loadedPath.current = null;
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateEditData]);

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
        defaultValue={currentText.current}
        options={{ readOnly: !isEditorReady.value }}
      />
      {(!isEditorReady.value || loadError.value) && <div className={styles.textEditor_status} role={loadError.value ? 'alert' : 'status'}>
        {loadError.value ?? t`正在读取场景…`}
        {loadError.value && <Button appearance="secondary" onClick={() => {
          if (editVersion.current !== savedVersion.current) {
            loadError.set(null);
            submitChange(currentText.current, editVersion.current);
          } else updateEditData();
        }}>{t`重试`}</Button>}
      </div>}
    </div>
  );
}
