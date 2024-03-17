import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import styles from "./tagsManager.module.scss";
import { cloneDeep } from "lodash";
import { CloseSmall, FileCodeOne } from "@icon-park/react";
import IconWrapper from "@/components/iconWrapper/IconWrapper";
import { getFileIcon } from "@/utils/getFileIcon";
import React, { useRef } from "react";
import { useGameEditorContext } from "@/store/useGameEditorStore";
import { IFileTab } from "@/types/gameEditor";

export default function TagsManager() {
  // 获取 Tags 数据
  const tabs = useGameEditorContext((state) => state.fileTabs);
  const currentFileTab = useGameEditorContext((state) => state.currentFileTab);
  const updateFileTabs = useGameEditorContext((state) => state.updateFileTabs);
  const updateCurrentFileTab= useGameEditorContext((state) => state.updateCurrentFileTab);

  // 重新记录数组顺序
  const reorder = (list: Array<IFileTab>, startIndex: number, endIndex: number): Array<IFileTab> => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }
    const newList = cloneDeep(reorder(
      tabs,
      result.source.index,
      result.destination.index
    ));
    updateFileTabs(newList);
  }

  function selectTag(fileTab: IFileTab) {
    updateCurrentFileTab(fileTab);
  }

  function closeTag(ev: MouseEvent, tabTarget: IFileTab) {
    // 先设法确定新的 target 是什么
    // 删除的是尾部，就是前一个，删除的不是尾部，就是后一个
    const targetIndex = tabs.findIndex((e) => e.path === tabTarget.path);
    let newTarget;
    if (tabs.length > 1) {
      // 是最后一个
      if (targetIndex === tabs.length - 1) {
        newTarget = tabs[tabs.length - 2];
      } else { // 不是最后一个
        newTarget = tabs[targetIndex + 1];
      }
    }
    const newTags = Array.from(tabs);
    newTags.splice(targetIndex, 1);
    console.log(newTags);
    console.log(newTarget);
    // 关闭这个标签并设置新的激活标签
    if (tabTarget.path === currentFileTab?.path)
      updateCurrentFileTab(newTarget as IFileTab);
    updateFileTabs(newTags);
    ev.stopPropagation();
  }

  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    const deltaY = event.deltaY;
    console.log(`滚动距离：${deltaY}px`);
    const element = document.getElementById('tags-container');
    if(element){
      const x = element.scrollLeft;
      const toX = x + deltaY;
      element.scrollTo(toX,0);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);

  return <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId="droppable" direction="horizontal">
      {(provided, snapshot) => (
        // 下面开始书写容器
        <div className={styles.tagsContainer}
          id="tags-container"
          onWheel={handleScroll}
          // provided.droppableProps应用的相同元素.
          {...provided.droppableProps}
          // 为了使 droppable 能够正常工作必须 绑定到最高可能的DOM节点中provided.innerRef.
          ref={provided.innerRef}
        >
          {tabs.map((item, index) => (
            <Draggable key={item.path} draggableId={item.path} index={index}>
              {(provided, snapshot) => (
                // 下面开始书写可拖拽的元素
                <div
                  onClick={() => selectTag(item)}
                  onMouseDown={(event:any)=>{
                    if(event.button === 1){
                      closeTag(event, item);
                    }
                  }}
                  className={item.path === currentFileTab?.path ? `${styles.tag} ${styles.tag_active}` : styles.tag}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <IconWrapper src={getFileIcon(item.path)} size={24} iconSize={18}/>
                  <div>
                    {item.name}
                  </div>
                  <div className={styles.closeIcon} onClick={(event: any) => closeTag(event, item)}>
                    <CloseSmall theme="outline" size="15" strokeWidth={3} />
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>;
}
