import { parseScene } from "./parser";
import axios from "axios";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorPreviewClient } from "../../../utils/editorPreviewClient";
import { mergeToString, splitToArray } from "./utils/sceneTextProcessor";
import styles from "./graphicalEditor.module.scss";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { sentenceEditorConfig, sentenceEditorDefault } from "./SentenceEditor";
import { commandType, type ISentence } from "webgal-parser/src/interface/sceneInterface";
import { DeleteFive, Sort, DownOne, RightOne, Play } from "@icon-park/react";
import { AddSentenceButton, AddSentenceDialog, addSentenceType } from "./components/AddSentence";
import SentenceArgOption from "./components/SentenceArgOption";
import { editorLineHolder } from "@/runtime/WG_ORIGINE_RUNTIME";
import { eventBus } from "@/utils/eventBus";
import { createId } from "@/utils/createId";
import { t } from "@lingui/macro";
import { api } from "@/api";
import { GlobalTerrePanel } from "./components/TerrePanel";

import type { DropResult } from '@hello-pangea/dnd';

interface IGraphicalEditorProps {
  targetPath: string;
  targetName: string;
}

interface SentenceItem {
  id: string;
  content: string;
  show: boolean;
}

const inlineArgOptionCommands = new Set<commandType>([
  commandType.changeBg,
  commandType.changeFigure,
  commandType.setAnimation,
  commandType.setComplexAnimation,
  commandType.setTransform,
  commandType.setTempAnimation,
]);

export default function GraphicalEditor(props: IGraphicalEditorProps) {
  const [sentenceData, setSentenceData] = useState<SentenceItem[]>([]);
  const sentenceDataRef = useRef<SentenceItem[]>([]);
  const [addSentenceDialog, setAddSentenceDialog] = useState<{
    titleText: string;
    insertIndex: number;
  } | null>(null);

  const updateSentenceData = useCallback((newSentences: SentenceItem[]) => {
    sentenceDataRef.current = newSentences;
    setSentenceData(newSentences);
  }, []);

  const generateSentenceItem = useCallback((content: string): SentenceItem => ({
    id: createId(),
    content,
    show: true,
  }), []);

  const fetchScene = useCallback(() => {
    const processFetchedData = (data: object) => {
      const text = data.toString();
      const newContents = splitToArray(text);
      const currentSentences = sentenceDataRef.current;

      const newSentences = newContents.map((content, i) => {
        const existing = currentSentences[i];
        return existing && existing.content === content
          ? existing
          : {
            id: createId(),
            content,
            show: existing?.show ?? true
          };
      });

      updateSentenceData(newSentences);
      eventBus.emit('editor:update-scene', { scene: text });
    };

    axios.get(props.targetPath)
      .then(res => res.data)
      .then(processFetchedData);
  }, [props.targetPath, updateSentenceData]);

  useEffect(() => {
    fetchScene();
  }, [fetchScene]);

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
  }, [fetchScene]);

  const submitScene = useCallback((newSentences: SentenceItem[], index: number) => {
    const newScene = mergeToString(newSentences.map(item => item.content));
    const updateIndex = index + 1;
    editorLineHolder.recordSceneEditingLine(props.targetPath, updateIndex);

    api.assetsControllerEditTextFile({
      textFile: newScene,
      path: props.targetPath
    }).then(() => {
      const targetValue = newSentences[index]?.content ?? "";
      EditorPreviewClient.sendSyncScene({
        scenePath: props.targetPath,
        lineNumber: updateIndex,
        lineCommandString: targetValue,
      });
      eventBus.emit('editor:update-scene', { scene: newScene });
    }).catch(() => {
      fetchScene();
    });
  }, [fetchScene, props.targetPath]);

  const updateSentenceByIndex = useCallback((newContent: string, updateIndex: number) => {
    const newSentences = [...sentenceDataRef.current];
    newSentences[updateIndex] = { ...newSentences[updateIndex], content: newContent };
    updateSentenceData(newSentences);
    submitScene(newSentences, updateIndex);
  }, [submitScene, updateSentenceData]);

  // 判断是否为空 (识别含唯一空行的文件)
  function isEmpty(sentences: SentenceItem[]): boolean {
    return !sentences || (sentences.length === 1 && sentences[0].content === "");
  }

  const addOneSentence = useCallback((newContent: string, insertIndex: number) => {
    const newSentence = generateSentenceItem(newContent);
    const newSentences = [...sentenceDataRef.current];
    const shouldReplaceEmptyLine = isEmpty(newSentences);
    const targetInsertIndex = shouldReplaceEmptyLine ? 0 : insertIndex;
    const deleteCount = shouldReplaceEmptyLine ? 1 : 0;

    newSentences.splice(targetInsertIndex, deleteCount, newSentence);

    updateSentenceData(newSentences);
    submitScene(newSentences, targetInsertIndex);
  }, [generateSentenceItem, submitScene, updateSentenceData]);

  const deleteOneSentence = useCallback((index: number) => {
    const newSentences = [...sentenceDataRef.current];
    newSentences.splice(index, 1);
    updateSentenceData(newSentences);
    submitScene(newSentences, Math.min(index, newSentences.length - 1));
  }, [submitScene, updateSentenceData]);

  const changeShowSentence = useCallback((index: number) => {
    const newSentences = [...sentenceDataRef.current];
    newSentences[index] = { ...newSentences[index], show: !newSentences[index].show };
    updateSentenceData(newSentences);
  }, [updateSentenceData]);

  // 重新记录数组顺序
  const reorder = useCallback((startIndex: number, endIndex: number) => {
    const newSentences = [...sentenceDataRef.current];
    const [removed] = newSentences.splice(startIndex, 1);
    newSentences.splice(endIndex, 0, removed);
    updateSentenceData(newSentences);
    submitScene(newSentences, endIndex);
  }, [submitScene, updateSentenceData]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }
    editorLineHolder.recordSceneEditingLine(props.targetPath, result.destination.index);
    reorder(
      result.source.index,
      result.destination.index
    );
  }, [props.targetPath, reorder]);

  const syncToIndex = useCallback((index: number) => {
    const targetValue = sentenceDataRef.current[index]?.content || "";
    EditorPreviewClient.sendSyncScene({
      scenePath: props.targetPath,
      lineNumber: index + 1,
      lineCommandString: targetValue,
      force: true,
    });
    editorLineHolder.recordSceneEditingLine(props.targetPath, index + 1);
    // 传递假消息，为了在不使用此功能的时候清除拖拽框
    eventBus.emit('editor:pixi-sync-command', {
      targetPath: '',
      lineNumber: 1,
      lineContent: "",
      lineSentence: null,
    });
  }, [props.targetPath]);

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
  }, [props.targetPath]);

  const addNewSentenceAttach = useCallback((sentence: string) => {
    addOneSentence(sentence, sentenceDataRef.current.length);
  }, [addOneSentence]);

  const handleAdd = useCallback(({ sentence } : { sentence: string }) => {
    addNewSentenceAttach(sentence);
  }, [addNewSentenceAttach]);

  useEffect(() => {
    eventBus.on('editor:topbar-add-sentence', handleAdd);
    return () => {
      eventBus.off('editor:topbar-add-sentence', handleAdd);
    };
  }, [handleAdd]);

  const openAddSentenceDialog = useCallback((titleText: string, insertIndex: number) => {
    setAddSentenceDialog({ titleText, insertIndex });
  }, []);

  const handleChooseSentence = useCallback((newSentence: string) => {
    if (!addSentenceDialog) {
      return;
    }
    addOneSentence(newSentence, addSentenceDialog.insertIndex);
    setAddSentenceDialog(null);
  }, [addOneSentence, addSentenceDialog]);

  const mergedSceneText = useMemo(() => mergeToString(sentenceData.map(item => item.content)), [sentenceData]);

  const parsedScene = useMemo(
    () => mergedSceneText === "" ? { sentenceList: [] } : parseScene(mergedSceneText),
    [mergedSceneText]
  );
  const sceneLabels = useMemo(
    () => parsedScene.sentenceList
      .filter(sentence => sentence.command === commandType.label)
      .map(sentence => sentence.content.trim())
      .filter(Boolean),
    [parsedScene]
  );

  useEffect(() => {
    const handleDragUpdate = (data: any) => {
      fetchScene();
      EditorPreviewClient.sendSyncScene({
        scenePath: data.targetPath,
        lineNumber: data.lineNumber,
        lineCommandString: data.newCommand,
      });
    };
    eventBus.on('editor:drag-update-scene', handleDragUpdate);
    return () => {
      eventBus.off('editor:drag-update-scene', handleDragUpdate);
    };
  }, [fetchScene]);
  return <div className={styles.main} id="graphical-editor-main">
    <div style={{ flex: 1, padding: '14px 4px 0 4px' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            // 下面开始书写容器
            <div style={{ height: "100%" }}
              // provided.droppableProps应用的相同元素.
              {...provided.droppableProps}
              // 为了使 droppable 能够正常工作必须 绑定到最高可能的DOM节点中provided.innerRef.
              ref={provided.innerRef}
            >
              {parsedScene.sentenceList.map((sentence, i) => {
                const sentenceItem = sentenceData[i];
                if (!sentenceItem) return null;
                return <SentenceRow
                  key={sentenceItem.id}
                  sentence={sentence}
                  sentenceItem={sentenceItem}
                  index={i}
                  targetPath={props.targetPath}
                  sceneLabels={sceneLabels}
                  onAddBefore={openAddSentenceDialog}
                  onDelete={deleteOneSentence}
                  onSync={syncToIndex}
                  onToggleShow={changeShowSentence}
                  onUpdate={updateSentenceByIndex}
                />;
              })}
              {provided.placeholder}
              <div className={styles.addWrapper}>
                <AddSentenceButton
                  titleText={t`添加语句`}
                  type={addSentenceType.backward}
                  onClick={() => openAddSentenceDialog(t`添加语句`, sentenceData.length)}
                />
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
    <AddSentenceDialog
      open={!!addSentenceDialog}
      titleText={addSentenceDialog?.titleText ?? ""}
      onChoose={handleChooseSentence}
      onOpenChange={(open) => !open && setAddSentenceDialog(null)}
    />
    <StableGlobalTerrePanel />
  </div>;
}

const StableGlobalTerrePanel = memo(GlobalTerrePanel);

const SentenceRow = memo((props: {
  sentence: ISentence;
  sentenceItem: SentenceItem;
  index: number;
  targetPath: string;
  sceneLabels: string[];
  onAddBefore: (titleText: string, insertIndex: number) => void;
  onDelete: (index: number) => void;
  onSync: (index: number) => void;
  onToggleShow: (index: number) => void;
  onUpdate: (newContent: string, updateIndex: number) => void;
}) => {
  const { sentence, sentenceItem, index: i, targetPath, sceneLabels } = props;
  const index = i + 1;
  const sentenceConfig = sentenceEditorConfig.find((e) => e.type === sentence.command) ?? sentenceEditorDefault;
  const SentenceEditor = sentenceConfig.component;
  const argOption = sentenceConfig !== sentenceEditorDefault && sentence.command !== commandType.comment && <SentenceArgOption
    sentence={sentence}
    rawSentence={sentenceItem.content}
    argKey="when"
    title={t`条件执行`}
    enabledText={t`启用 when 条件`}
    disabledText={t`不使用 when 条件`}
    placeholder={t`例如：a>0 && flag==true`}
    onSubmit={(newSentence) => props.onUpdate(newSentence, i)}
    inline={inlineArgOptionCommands.has(sentence.command)}
  />;
  const inlineArgOption = inlineArgOptionCommands.has(sentence.command);

  return <Draggable key={sentenceItem.id} draggableId={sentenceItem.id} index={i}>
    {(provided) => (
      <div className={`${styles.sentenceEditorWrapper} sentence-block-${index}`}
        ref={provided.innerRef}
        {...provided.draggableProps}
      >
        <div className={styles.addForwardArea}>
          <div className={styles.addForwardAreaButtonGroup}>
            <div className={styles.addForwardAreaButton}>
              <AddSentenceButton
                titleText={t`本句前插入句子`}
                type={addSentenceType.forward}
                onClick={() => props.onAddBefore(t`本句前插入句子`, i)}
              />
            </div>
          </div>
        </div>
        <div className={styles.sentenceEditorContent}>
          <div className={styles.lineNumber}><span style={{ padding: "0 6px 0 0" }}>{index}</span>
            <Sort {...provided.dragHandleProps} style={{ padding: "5px 0 0 0" }} theme="outline" size="22"
              strokeWidth={3} />
          </div>
          <div className={styles.seArea}>
            <div className={styles.head}>
              <div className={styles.title}>
                {sentenceConfig.title()}
              </div>
              <div className={styles.optionButton}
                onClick={() => props.onToggleShow(i)}>
                {sentenceItem.show ?
                  <DownOne strokeWidth={3} theme="outline" size="18"
                    fill="#005CAF" /> :
                  <RightOne strokeWidth={3} theme="outline" size="18"
                    fill="#005CAF" />}
              </div>
              <div className={styles.optionButtonContainer}>
                <div className={styles.optionButton}
                  onClick={() => props.onDelete(i)}>
                  <DeleteFive strokeWidth={3} style={{ padding: "2px 4px 0 0" }} theme="outline" size="14"
                    fill="var(--text)" />
                  <div>
                    {t`删除本句`}
                  </div>
                </div>
                <div className={styles.optionButton}
                  onClick={() => props.onSync(i)}>
                  <Play strokeWidth={3} style={{ padding: "2px 4px 0 0" }} theme="outline" size="14"
                    fill="var(--text)" />
                  <div>
                    {t`执行到此句`}
                  </div>
                </div>
              </div>
            </div>
            {sentenceItem.show && <div className={styles.sentenceEditBody}>
              <SentenceEditor sentence={sentence} index={index} onSubmit={(newSentence) => {
                props.onUpdate(newSentence, i);
              }} targetPath={targetPath} sceneLabels={sceneLabels} extraOptions={inlineArgOption ? argOption : undefined} />
              {!inlineArgOption && argOption}
            </div>}
          </div>
        </div>
      </div>
    )}
  </Draggable>;
}, (prev, next) => (
  prev.sentence === next.sentence &&
  prev.sentenceItem === next.sentenceItem &&
  prev.index === next.index &&
  prev.targetPath === next.targetPath &&
  prev.sceneLabels === next.sceneLabels
));
