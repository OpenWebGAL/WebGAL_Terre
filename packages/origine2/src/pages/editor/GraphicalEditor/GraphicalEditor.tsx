import { useValue } from '../../../hooks/useValue';
import { parseScene } from './parser';
import axios from 'axios';
import { MouseEvent, useEffect, useMemo, useState, useRef } from 'react';
import { WsUtil } from '../../../utils/wsUtil';
import { mergeToString, splitToArray } from './utils/sceneTextProcessor';
import styles from './graphicalEditor.module.scss';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { sentenceEditorConfig, sentenceEditorDefault } from './SentenceEditor';
import { DeleteFive, Sort, DownOne, RightOne, Play, ExcludeSelection, Copy, CuttingOne, Log } from '@icon-park/react';
import AddSentence, { addSentenceType } from './components/AddSentence';
import { editorLineHolder } from '@/runtime/WG_ORIGINE_RUNTIME';
import { eventBus } from '@/utils/eventBus';
import { t } from '@lingui/macro';
import { api } from '@/api';

import type { DropResult } from 'react-beautiful-dnd';

interface EditorStateProps {
  selectRaw: null | SentenceItem;
  isCutting: boolean; // 剪切状态
  // 剪贴板栈
  // 最新加入的元素总是在第一个
  clipStack: SentenceItem[];
}

interface IGraphicalEditorProps {
  targetPath: string;
  targetName: string;
}

interface SentenceItem {
  id: string;
  content: string;
  show: boolean;
}

export default function GraphicalEditor(props: IGraphicalEditorProps) {
  const sentenceData = useValue<SentenceItem[]>([]);

  const sentenceDataRef = useRef(sentenceData);
  sentenceDataRef.current = sentenceData;

  const [EditorOpState, setEditorOpState] = useState<EditorStateProps>({
    selectRaw: null,
    isCutting: false,
    clipStack: [],
  });

  function submitScene(newSentences: SentenceItem[], index: number) {
    const newScene = mergeToString(newSentences.map((item) => item.content));
    const updateIndex = index + 1;
    editorLineHolder.recordSceneEditingLine(props.targetPath, updateIndex);

    api
      .assetsControllerEditTextFile({
        textFile: newScene,
        path: props.targetPath,
      })
      .then(() => {
        const targetValue = newSentences[index].content;
        WsUtil.sendSyncCommand(props.targetPath, updateIndex, targetValue);
        fetchScene();
      });
  }

  const generateSentenceItem = (content: string): SentenceItem => ({
    id: crypto.randomUUID(),
    content,
    show: true,
  });

  const setSelect = (index: number) => {
    const raw = sentenceData.value[index];
    setEditorOpState((v) => ({ ...v, select: index, selectRaw: raw }));
  };

  const resetSelect = (e: MouseEvent) => {
    e.stopPropagation();
    setEditorOpState((v) => ({ ...v, select: null, selectRaw: null, clipStack: [] }));
  };

  // 复制
  const copyEvent = (e: MouseEvent, index: number) => {
    const raw = sentenceDataRef.current.value[index];
    setEditorOpState((v) => ({ ...v, clipStack: [raw, ...v.clipStack] }));
  };

  // 粘贴
  const pasteEvent = (e: MouseEvent, index: number, direction: 'up' | 'down' = 'up') => {
    const raw = EditorOpState.clipStack[0];
    if (raw) {
      const newSentences = [...sentenceData.value];
      if (direction === 'up') {
        newSentences.splice(index, 0, generateSentenceItem(raw.content));
      } else if (direction === 'down') {
        newSentences.splice(index + 1, 0, generateSentenceItem(raw.content));
      }
      sentenceData.set(newSentences);
      submitScene(newSentences, direction === 'down' ? index + 1 : index);
      if (EditorOpState.isCutting) {
        setEditorOpState((v) => ({ ...v, selectRaw: null, clipStack: v.clipStack.slice(1), isCutting: false }));
      }
    }
  };

  // 剪切
  const cutEvent = (e: MouseEvent, index: number) => {
    const raw = sentenceData.value[index];
    setEditorOpState((v) => ({ ...v, clipStack: [raw, ...v.clipStack], isCutting: true }));
    const newSentences = [...sentenceData.value];
    newSentences.splice(index, 1);
    sentenceData.set(newSentences);
    submitScene(newSentences, Math.min(index, newSentences.length - 1));
  };

  const selectStateBtns = useMemo(
    () => [
      {
        name: t`取消选择`,
        icon: ExcludeSelection,
        click: (e: MouseEvent) => resetSelect(e),
      },
      {
        name: t`复制`,
        icon: Copy,
        click: copyEvent,
      },
      {
        name: t`剪切`,
        icon: CuttingOne,
        click: cutEvent,
      },
      ...(EditorOpState.clipStack.length
        ? [
          {
            name: t`向上粘贴`,
            icon: Log,
            click: (e: MouseEvent, index: number) => pasteEvent(e, index, 'up'),
          },
          {
            name: t`向下粘贴`,
            icon: Log,
            click: (e: MouseEvent, index: number) => pasteEvent(e, index, 'down'),
          },
        ]
        : []),
    ],
    [EditorOpState.clipStack],
  );

  function fetchScene() {
    const processFetchedData = (data: object) => {
      const text = data.toString();
      const newContents = splitToArray(text);
      const currentSentences = sentenceData.value;

      const newSentences = newContents.map((content, i) => {
        const existing = currentSentences[i];
        return existing && existing.content === content
          ? existing
          : {
            id: crypto.randomUUID(),
            content,
            show: existing?.show ?? true,
          };
      });

      sentenceData.set(newSentences);
      eventBus.emit('editor:update-scene', { scene: text });
    };

    axios
      .get(props.targetPath)
      .then((res) => res.data)
      .then(processFetchedData);
  }

  useEffect(() => {
    fetchScene();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchScene();
      }
    };

    window.addEventListener('focus', fetchScene);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', fetchScene);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  function updateSentenceByIndex(newContent: string, updateIndex: number) {
    const newSentences = [...sentenceData.value];
    newSentences[updateIndex] = { ...newSentences[updateIndex], content: newContent };
    sentenceData.set(newSentences);
    submitScene(newSentences, updateIndex);
  }

  function addOneSentence(newContent: string, insertIndex: number) {
    const newSentence = generateSentenceItem(newContent);
    const newSentences = [...sentenceData.value];
    newSentences.splice(insertIndex, 0, newSentence);
    sentenceData.set(newSentences);
    submitScene(newSentences, insertIndex);
  }

  function deleteOneSentence(index: number) {
    const newSentences = [...sentenceData.value];
    newSentences.splice(index, 1);
    sentenceData.set(newSentences);
    submitScene(newSentences, Math.min(index, newSentences.length - 1));
  }

  function changeShowSentence(index: number) {
    const newSentences = [...sentenceData.value];
    newSentences[index] = { ...newSentences[index], show: !newSentences[index].show };
    sentenceData.set(newSentences);
  }

  // 重新记录数组顺序
  const reorder = (startIndex: number, endIndex: number) => {
    const newSentences = [...sentenceData.value];
    const [removed] = newSentences.splice(startIndex, 1);
    newSentences.splice(endIndex, 0, removed);
    sentenceData.set(newSentences);
    submitScene(newSentences, endIndex);
  };

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    editorLineHolder.recordSceneEditingLine(props.targetPath, result.destination.index);
    reorder(result.source.index, result.destination.index);
  }

  function syncToIndex(index: number) {
    const targetValue = sentenceData.value[index]?.content || '';
    WsUtil.sendSyncCommand(props.targetPath, index + 1, targetValue, true);
    editorLineHolder.recordSceneEditingLine(props.targetPath, index + 1);
  }

  useEffect(() => {
    const targetLine = editorLineHolder.getSceneLine(props.targetPath);
    const scrollToFunc = () => {
      const targetBlock = document.querySelector(`.sentence-block-${targetLine}`);
      if (targetBlock) {
        targetBlock?.scrollIntoView?.({ behavior: 'auto' });
      } else {
        console.log('Retry scroll to in 50ms');
        setTimeout(() => scrollToFunc(), 50);
      }
    };
    if (targetLine > 3) {
      scrollToFunc();
    }
  }, []);

  function addNewSentenceAttach(sentence: string) {
    addOneSentence(sentence, sentenceData.value.length);
  }

  function handleAdd({ sentence }: { sentence: string }) {
    addNewSentenceAttach(sentence);
  }

  useEffect(() => {
    eventBus.on('editor:topbar-add-sentence', handleAdd);
    return () => {
      eventBus.off('editor:topbar-add-sentence', handleAdd);
    };
  }, [sentenceData.value]);

  const mergedSceneText = useMemo(
    () => mergeToString(sentenceData.value.map((item) => item.content)),
    [sentenceData.value],
  );

  const parsedScene = mergedSceneText === '' ? { sentenceList: [] } : parseScene(mergedSceneText);

  return (
    <div className={styles.main} id="graphical-editor-main">
      <div style={{ flex: 1, padding: '14px 4px 0 4px' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              // 下面开始书写容器
              <div
                style={{ height: '100%' }}
                // provided.droppableProps应用的相同元素.
                {...provided.droppableProps}
                // 为了使 droppable 能够正常工作必须 绑定到最高可能的DOM节点中provided.innerRef.
                ref={provided.innerRef}
              >
                {parsedScene.sentenceList.map((sentence, i) => {
                  // 实际显示的行数
                  const index = i + 1;
                  // console.log(sentence.command);
                  const sentenceConfig =
                    sentenceEditorConfig.find((e) => e.type === sentence.command) ?? sentenceEditorDefault;
                  const SentenceEditor = sentenceConfig.component;
                  const sentenceItem = sentenceData.value[i];
                  return (
                    <Draggable key={sentenceItem.id} draggableId={sentenceItem.id} index={i}>
                      {(provided) => (
                        <div
                          className={`${styles.sentenceEditorWrapper} sentence-block-${index}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div className={styles.addForwardArea}>
                            <div className={styles.addForwardAreaButtonGroup}>
                              <div className={styles.addForwardAreaButton}>
                                <AddSentence
                                  titleText={t`本句前插入句子`}
                                  type={addSentenceType.forward}
                                  onChoose={(newSentence) => addOneSentence(newSentence, i)}
                                />
                              </div>
                            </div>
                          </div>
                          <div
                            className={`${styles.sentenceEditorContent} ${
                              EditorOpState.selectRaw?.id === sentenceItem.id && styles.sentenceEditorContent__Selected
                            }`}
                            onClick={() => setSelect(i)}
                          >
                            <div className={styles.lineNumber}>
                              <span style={{ padding: '0 6px 0 0' }}>{index}</span>
                              <Sort
                                {...provided.dragHandleProps}
                                style={{ padding: '5px 0 0 0' }}
                                theme="outline"
                                size="22"
                                strokeWidth={3}
                              />
                            </div>
                            <div className={styles.seArea}>
                              <div className={styles.head}>
                                <div className={styles.title}>{sentenceConfig.title()}</div>
                                <div className={styles.optionButton} onClick={() => changeShowSentence(i)}>
                                  {sentenceItem.show ? (
                                    <DownOne strokeWidth={3} theme="outline" size="18" fill="#005CAF" />
                                  ) : (
                                    <RightOne strokeWidth={3} theme="outline" size="18" fill="#005CAF" />
                                  )}
                                </div>
                                <div className={styles.optionButtonContainer}>
                                  <div className={styles.optionButton} onClick={() => deleteOneSentence(i)}>
                                    <DeleteFive
                                      strokeWidth={3}
                                      style={{ padding: '2px 4px 0 0' }}
                                      theme="outline"
                                      size="14"
                                      fill="var(--text)"
                                    />
                                    <div>{t`删除本句`}</div>
                                  </div>
                                  <div className={styles.optionButton} onClick={() => syncToIndex(i)}>
                                    <Play
                                      strokeWidth={3}
                                      style={{ padding: '2px 4px 0 0' }}
                                      theme="outline"
                                      size="14"
                                      fill="var(--text)"
                                    />
                                    <div>{t`执行到此句`}</div>
                                  </div>
                                  {EditorOpState.selectRaw?.id === sentenceItem.id &&
                                    selectStateBtns.map((v, btnInd) => (
                                      <div
                                        key={btnInd + i + v.name}
                                        className={styles.optionButton}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          v.click(e, i);
                                        }}
                                      >
                                        <v.icon
                                          strokeWidth={3}
                                          style={{ padding: '2px 4px 0 0' }}
                                          theme="outline"
                                          size="14"
                                          fill="var(--text)"
                                        />
                                        <div>{v.name}</div>
                                      </div>
                                    ))}
                                  {EditorOpState.selectRaw?.id !== sentenceItem.id &&
                                    !!EditorOpState.clipStack.length && (
                                    <>
                                      <div
                                        className={styles.optionButton}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          pasteEvent(e, i, 'up');
                                        }}
                                      >
                                        <Log
                                          strokeWidth={3}
                                          style={{ padding: '2px 4px 0 0' }}
                                          theme="outline"
                                          size="14"
                                          fill="var(--text)"
                                        />
                                        <div>{t`向上粘贴`}</div>
                                      </div>
                                      <div
                                        className={styles.optionButton}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          pasteEvent(e, i, 'down');
                                        }}
                                      >
                                        <Log
                                          strokeWidth={3}
                                          style={{ padding: '2px 4px 0 0' }}
                                          theme="outline"
                                          size="14"
                                          fill="var(--text)"
                                        />
                                        <div>{t`向下粘贴`}</div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              {sentenceItem.show && (
                                <SentenceEditor
                                  sentence={sentence}
                                  index={index}
                                  onSubmit={(newSentence) => {
                                    updateSentenceByIndex(newSentence, i);
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                <div className={styles.addWrapper}>
                  <AddSentence
                    titleText={t`添加语句`}
                    type={addSentenceType.backward}
                    onChoose={(newSentence) => addOneSentence(newSentence, sentenceData.value.length)}
                  />
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
