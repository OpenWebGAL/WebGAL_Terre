import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import styles from "./tagsManager.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { ITag, resetTagOrder, setCurrentTagTarget } from "../../../store/statusReducer";
import { cloneDeep } from "lodash";
import { CloseSmall, FileCodeOne } from "@icon-park/react";
import IconWrapper from "@/components/iconWrapper/IconWrapper";
import { getFileIcon } from "@/utils/getFileIcon";
import React, { useRef } from "react";

export default function TagsManager() {
  // 获取 Tags 数据
  const tags = useSelector((state: RootState) => state.status.editor.tags);
  const tagSelected = useSelector((state: RootState) => state.status.editor.selectedTagTarget);
  const dispatch = useDispatch();

  // 重新记录数组顺序
  const reorder = (list: Array<ITag>, startIndex: number, endIndex: number): Array<ITag> => {
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
      tags,
      result.source.index,
      result.destination.index
    ));
    dispatch(resetTagOrder(newList));
  }

  function selectTag(tagTarget: string) {
    dispatch(setCurrentTagTarget(tagTarget));
  }

  function closeTag(ev: MouseEvent, tagTarget: string) {
    // 先设法确定新的 target 是什么
    // 删除的是尾部，就是前一个，删除的不是尾部，就是后一个
    const targetIndex = tags.findIndex((e) => e.tagTarget === tagTarget);
    let newTarget = "";
    if (tags.length > 1) {
      // 是最后一个
      if (targetIndex === tags.length - 1) {
        newTarget = tags[tags.length - 2].tagTarget;
      } else { // 不是最后一个
        newTarget = tags[targetIndex + 1].tagTarget;
      }
    }
    const newTags = Array.from(tags);
    newTags.splice(targetIndex, 1);
    console.log(newTags);
    console.log(newTarget);
    // 关闭这个标签并设置新的激活标签
    if (tagTarget === tagSelected)
      dispatch(setCurrentTagTarget(newTarget));
    dispatch(resetTagOrder(newTags));
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
          {tags.map((item, index) => (
            <Draggable key={item.tagTarget} draggableId={item.tagTarget} index={index}>
              {(provided, snapshot) => (
                // 下面开始书写可拖拽的元素
                <div
                  onClick={() => selectTag(item.tagTarget)}
                  onMouseDown={(event:any)=>{
                    if(event.button === 1){
                      closeTag(event, item.tagTarget);
                    }
                  }}
                  className={item.tagTarget === tagSelected ? `${styles.tag} ${styles.tag_active}` : styles.tag}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <IconWrapper src={getFileIcon(item.tagTarget)} size={24} iconSize={18}/>
                  <div>
                    {item.tagName}
                  </div>
                  <div className={styles.closeIcon} onClick={(event: any) => closeTag(event, item.tagTarget)}>
                    <CloseSmall theme="outline" size="15" fill="#000" strokeWidth={3} />
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
