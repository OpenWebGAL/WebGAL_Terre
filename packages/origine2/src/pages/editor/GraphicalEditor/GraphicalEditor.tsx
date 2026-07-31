import { parseScene } from "./parser";
import axios from "axios";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { EditorPreviewClient } from "../../../utils/editorPreviewClient";
import { mergeToString, replaceLineRange, splitToArray } from "./utils/sceneTextProcessor";
import { sceneTextPreProcess } from "webgal-parser";
import styles from "./graphicalEditor.module.scss";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { sentenceEditorConfig, sentenceEditorDefault } from "./SentenceEditor";
import { commandType, type ISentence } from "webgal-parser/src/interface/sceneInterface";
import { DeleteFive, Sort, DownOne, RightOne, Play, LinkOne } from "@icon-park/react";
import { AddSentenceButton, AddSentenceDialog, addSentenceType } from "./components/AddSentence";
import SentenceArgOption from "./components/SentenceArgOption";
import { editorLineHolder } from "@/runtime/WG_ORIGINE_RUNTIME";
import { eventBus } from "@/utils/eventBus";
import { createId } from "@/utils/createId";
import { t } from "@lingui/macro";
import { api } from "@/api";
import { GlobalTerrePanel } from "./components/TerrePanel";
import { getArgByKey } from "./utils/getArgByKey";

import type { DragStart, DraggableProvided, DropResult } from '@hello-pangea/dnd';

interface IGraphicalEditorProps {
  targetPath: string;
  targetName: string;
}

/** 脚本文件的一行 */
interface SentenceItem {
  id: string;
  content: string;
  show: boolean;
}

interface SentenceRowProps {
  sentence: ISentence;
  sentenceItem: SentenceItem;
  /** 语句在图形编辑器中的序号；一条多行语句只占一行，因此它不等于文件行号 */
  index: number;
  /** 语句首行在文件中的行号（0-based），用于显示与定位 */
  startLine: number;
  /** 折叠后的单行语句文本，供按文本改写参数的编辑器使用 */
  foldedSentence: string;
  linkedWithPrevious: boolean;
  targetPath: string;
  sceneLabels: string[];
  onAddBefore: (titleText: string, insertLine: number) => void;
  onDelete: (index: number) => void;
  onSync: (index: number) => void;
  onToggleShow: (index: number) => void;
  onUpdate: (newContent: string, updateIndex: number) => void;
}

/** 找到覆盖指定文件行（0-based）的语句 */
const findSentenceByLine = (sentences: ISentence[], line: number) =>
  sentences.find(sentence => line >= sentence.startLine && line <= sentence.endLine);

interface SentenceRowContentProps extends SentenceRowProps {
  provided: DraggableProvided;
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
  const scrollElementRef = useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [addSentenceDialog, setAddSentenceDialog] = useState<{
    titleText: string;
    insertLine: number;
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

  const mergedSceneText = useMemo(() => mergeToString(sentenceData.map(item => item.content)), [sentenceData]);

  const parsedScene = useMemo(
    () => mergedSceneText === "" ? { sentenceList: [] } : parseScene(mergedSceneText),
    [mergedSceneText]
  );

  /**
   * 图形编辑器展示的语句列表。多行语句的续行在解析结果里只是补齐行数的占位，
   * 不单独成行；它们所占的行由所属语句的 startLine / endLine 描述。
   */
  const sentences = useMemo(
    () => parsedScene.sentenceList.filter(sentence => !sentence.isLineBreakHolder),
    [parsedScene]
  );

  /**
   * 预处理后的行：多行语句的内容全部折叠到它的首行。
   * 按文本改写参数的编辑器（如 SentenceArgOption）拿到的是这份折叠后的单行。
   */
  const foldedLines = useMemo(() => splitToArray(sceneTextPreProcess(mergedSceneText)), [mergedSceneText]);

  /**
   * 写回场景，并让预览执行到刚编辑的语句。
   *
   * lineNumber 的语义是「执行完目标语句后的停止指针」，所以取语句末行 + 1，
   * 这样多行语句的续行占位也会被一并跨过。
   */
  const submitScene = useCallback((newSentences: SentenceItem[], startLine: number, endLine: number) => {
    const newScene = mergeToString(newSentences.map(item => item.content));
    const lineNumber = endLine + 1;
    editorLineHolder.recordSceneEditingLine(props.targetPath, lineNumber);

    api.assetsControllerEditTextFile({
      textFile: newScene,
      path: props.targetPath
    }).then(() => {
      EditorPreviewClient.sendSyncScene({
        scenePath: props.targetPath,
        lineNumber,
        lineCommandString: mergeToString(newSentences.slice(startLine, endLine + 1).map(item => item.content)),
      });
      eventBus.emit('editor:update-scene', { scene: newScene });
    }).catch(() => {
      fetchScene();
    });
  }, [fetchScene, props.targetPath]);

  const updateSentenceByIndex = useCallback((newContent: string, updateIndex: number) => {
    const target = sentences[updateIndex];
    if (!target) return;
    const newLines = splitToArray(newContent).map(generateSentenceItem);
    const newSentences = replaceLineRange(sentenceDataRef.current, target, newLines);
    updateSentenceData(newSentences);
    submitScene(newSentences, target.startLine, target.startLine + newLines.length - 1);
  }, [generateSentenceItem, sentences, submitScene, updateSentenceData]);

  // 判断是否为空 (识别含唯一空行的文件)
  function isEmpty(lines: SentenceItem[]): boolean {
    return !lines || (lines.length === 1 && lines[0].content === "");
  }

  /** insertLine 是插入位置的文件行号（0-based） */
  const addOneSentence = useCallback((newContent: string, insertLine: number) => {
    const newLines = splitToArray(newContent).map(generateSentenceItem);
    const lines = sentenceDataRef.current;
    // 整个文件只有一个空行时，新语句直接顶替这一行，而不是插在它前面
    const shouldReplaceEmptyLine = isEmpty(lines);
    const startLine = shouldReplaceEmptyLine ? 0 : insertLine;
    const endLine = shouldReplaceEmptyLine ? 0 : insertLine - 1; // 纯插入不覆盖任何已有行

    const newSentences = replaceLineRange(lines, { startLine, endLine }, newLines);
    updateSentenceData(newSentences);
    submitScene(newSentences, startLine, startLine + newLines.length - 1);
  }, [generateSentenceItem, submitScene, updateSentenceData]);

  const deleteOneSentence = useCallback((index: number) => {
    const target = sentences[index];
    if (!target) return;
    const newSentences = replaceLineRange(sentenceDataRef.current, target, []);
    updateSentenceData(newSentences);
    // 删除后原位置落到了下一条语句，同步到那里即可
    const focusLine = Math.min(target.startLine, newSentences.length - 1);
    submitScene(newSentences, focusLine, focusLine);
  }, [sentences, submitScene, updateSentenceData]);

  const changeShowSentence = useCallback((index: number) => {
    const target = sentences[index];
    const newSentences = [...sentenceDataRef.current];
    // 折叠状态记在语句的首行上
    const head = target && newSentences[target.startLine];
    if (!target || !head) return;
    newSentences[target.startLine] = { ...head, show: !head.show };
    updateSentenceData(newSentences);
  }, [sentences, updateSentenceData]);

  // 重新记录数组顺序。拖拽以语句为单位，多行语句要整块搬走。
  const reorder = useCallback((sourceIndex: number, destinationIndex: number) => {
    const source = sentences[sourceIndex];
    const destination = sentences[destinationIndex];
    if (!source || !destination) return;

    const movedLines = sentenceDataRef.current.slice(source.startLine, source.endLine + 1);
    const restLines = replaceLineRange(sentenceDataRef.current, source, []);
    // 往后拖时，目标位置的行号要减去已被移走的行数
    const insertLine = destination.startLine > source.startLine
      ? destination.endLine + 1 - movedLines.length
      : destination.startLine;

    const newSentences = replaceLineRange(restLines, { startLine: insertLine, endLine: insertLine - 1 }, movedLines);
    updateSentenceData(newSentences);
    submitScene(newSentences, insertLine, insertLine + movedLines.length - 1);
  }, [sentences, submitScene, updateSentenceData]);

  const onDragStart = useCallback((start: DragStart) => {
    setDraggingId(start.draggableId);
  }, []);

  const onDragEnd = useCallback((result: DropResult) => {
    setDraggingId(null);
    if (!result.destination) {
      return;
    }
    reorder(
      result.source.index,
      result.destination.index
    );
  }, [reorder]);

  /** 让预览执行到某条语句。行范围是文件行号（0-based，含首尾） */
  const syncToLineRange = useCallback((startLine: number, endLine: number) => {
    EditorPreviewClient.sendSyncScene({
      scenePath: props.targetPath,
      lineNumber: endLine + 1,
      lineCommandString: mergeToString(
        sentenceDataRef.current.slice(startLine, endLine + 1).map(item => item.content)
      ),
      force: true,
    });
    editorLineHolder.recordSceneEditingLine(props.targetPath, endLine + 1);
  }, [props.targetPath]);

  const syncToIndex = useCallback((index: number) => {
    const target = sentences[index];
    if (!target) return;
    syncToLineRange(target.startLine, target.endLine);
    // 传递假消息，为了在不使用此功能的时候清除拖拽框
    eventBus.emit('editor:pixi-sync-command', {
      targetPath: '',
      lineNumber: 1,
      lineContent: "",
      lineSentence: null,
    });
  }, [sentences, syncToLineRange]);

  const syncCurrentLine = useCallback(() => {
    // 记录的是「停止指针」，它指向的语句在上一行
    const recordedLine = (editorLineHolder.getSceneLine(props.targetPath) || 1) - 1;
    const target = findSentenceByLine(sentences, recordedLine);
    syncToLineRange(target?.startLine ?? recordedLine, target?.endLine ?? recordedLine);
  }, [props.targetPath, sentences, syncToLineRange]);

  useEffect(() => {
    eventBus.on('editor:sync-current-line', syncCurrentLine);
    return () => {
      eventBus.off('editor:sync-current-line', syncCurrentLine);
    };
  }, [syncCurrentLine]);

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

  const openAddSentenceDialog = useCallback((titleText: string, insertLine: number) => {
    setAddSentenceDialog({ titleText, insertLine });
  }, []);

  const handleChooseSentence = useCallback((newSentence: string) => {
    if (!addSentenceDialog) {
      return;
    }
    addOneSentence(newSentence, addSentenceDialog.insertLine);
    setAddSentenceDialog(null);
  }, [addOneSentence, addSentenceDialog]);

  const sceneLabels = useMemo(
    () => sentences
      .filter(sentence => sentence.command === commandType.label)
      .map(sentence => sentence.content.trim())
      .filter(Boolean),
    [sentences]
  );
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: sentences.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) => sentenceData[sentences[index]?.startLine]?.show ? 120 : 48,
    getItemKey: (index) => sentenceData[sentences[index]?.startLine]?.id ?? index,
    overscan: 8,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  // 语句条数变化（打开场景、增删语句）后，把上次编辑的位置滚回视野
  useEffect(() => {
    const targetLine = editorLineHolder.getSceneLine(props.targetPath);
    const rowIndex = sentences.findIndex(sentence => targetLine - 1 <= sentence.endLine);
    if (targetLine > 3 && rowIndex >= 0) {
      rowVirtualizer.scrollToIndex(rowIndex, { align: 'start' });
    }
    // sentences 每次解析都是新数组，这里只依赖条数，避免编辑时反复滚动
  }, [sentences.length, props.targetPath, rowVirtualizer]);

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

  const getSentenceRowProps = (i: number): SentenceRowProps | null => {
    const sentence = sentences[i];
    // 语句的 id 与折叠状态都记在它的首行上
    const sentenceItem = sentence && sentenceData[sentence.startLine];
    if (!sentence || !sentenceItem) return null;
    return {
      sentence,
      sentenceItem,
      index: i,
      startLine: sentence.startLine,
      foldedSentence: foldedLines[sentence.startLine] ?? sentenceItem.content,
      linkedWithPrevious: i > 0 && getArgByKey(sentences[i - 1], "next") === true,
      targetPath: props.targetPath,
      sceneLabels,
      onAddBefore: openAddSentenceDialog,
      onDelete: deleteOneSentence,
      onSync: syncToIndex,
      onToggleShow: changeShowSentence,
      onUpdate: updateSentenceByIndex,
    };
  };

  const renderSentenceRow = (provided: DraggableProvided, i: number) => {
    const rowProps = getSentenceRowProps(i);
    return rowProps && <SentenceRowContent provided={provided} {...rowProps} />;
  };

  return <div className={styles.main} id="graphical-editor-main">
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Droppable
        droppableId="droppable"
        mode="virtual"
        renderClone={(provided, _, rubric) => renderSentenceRow(provided, rubric.source.index)}
      >
        {(provided) => (
          <div
            className={styles.virtualScroller}
            {...provided.droppableProps}
            ref={(element) => {
              scrollElementRef.current = element;
              provided.innerRef(element);
            }}
          >
            <div className={styles.virtualCanvas} style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
              {virtualRows.map((virtualRow) => {
                const rowProps = getSentenceRowProps(virtualRow.index);
                if (!rowProps) return null;
                return <div
                  key={rowProps.sentenceItem.id}
                  className={styles.virtualItem}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                    height: rowProps.sentenceItem.id === draggingId ? `${virtualRow.size}px` : undefined,
                  }}
                >
                  <SentenceRow {...rowProps} />
                </div>;
              })}
            </div>
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

const SentenceRowContent = (props: SentenceRowContentProps) => {
  const { provided, sentence, sentenceItem, index: i, startLine, linkedWithPrevious, targetPath, sceneLabels } = props;
  // index 只作为面板展开状态的标识，展示给用户的是语句首行在文件中的行号
  const index = i + 1;
  const lineNumber = startLine + 1;
  const sentenceConfig = sentenceEditorConfig.find((e) => e.type === sentence.command) ?? sentenceEditorDefault;
  const SentenceEditor = sentenceConfig.component;
  const argOption = sentenceConfig !== sentenceEditorDefault && sentence.command !== commandType.comment && <SentenceArgOption
    sentence={sentence}
    rawSentence={props.foldedSentence}
    argKey="when"
    title={t`条件执行`}
    enabledText={t`启用 when 条件`}
    disabledText={t`不使用 when 条件`}
    placeholder={t`例如：a>0 && flag==true`}
    onSubmit={(newSentence) => props.onUpdate(newSentence, i)}
    inline={inlineArgOptionCommands.has(sentence.command)}
  />;
  const inlineArgOption = inlineArgOptionCommands.has(sentence.command);

  return <div className={`${styles.sentenceEditorWrapper} sentence-block-${lineNumber}`}
    ref={provided.innerRef}
    {...provided.draggableProps}
  >
    <div className={styles.addForwardArea}>
      {linkedWithPrevious && <div className={styles.nextChain} title={t`由上一句的 next 连续执行`}><LinkOne theme="outline" size="20" strokeWidth={3} /></div>}
      <div className={styles.addForwardAreaButtonGroup}>
        <div className={styles.addForwardAreaButton}>
          <AddSentenceButton
            titleText={t`本句前插入句子`}
            type={addSentenceType.forward}
            onClick={() => props.onAddBefore(t`本句前插入句子`, startLine)}
          />
        </div>
      </div>
    </div>
    <div className={styles.sentenceEditorContent}>
      <div className={styles.lineNumber}><span style={{ padding: "0 6px 0 0" }}>{lineNumber}</span>
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
  </div>;
};

const SentenceRow = memo((props: SentenceRowProps) => {
  return <Draggable key={props.sentenceItem.id} draggableId={props.sentenceItem.id} index={props.index}>
    {(provided) => <SentenceRowContent provided={provided} {...props} />}
  </Draggable>;
}, (prev, next) => (
  prev.sentence === next.sentence &&
  prev.sentenceItem === next.sentenceItem &&
  prev.index === next.index &&
  prev.startLine === next.startLine &&
  prev.foldedSentence === next.foldedSentence &&
  prev.linkedWithPrevious === next.linkedWithPrevious &&
  prev.targetPath === next.targetPath &&
  prev.sceneLabels === next.sceneLabels
));
