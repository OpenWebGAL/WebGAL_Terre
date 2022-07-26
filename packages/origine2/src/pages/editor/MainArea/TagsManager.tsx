import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import styles from "./tagsManager.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import { ITag, resetTagOrder, setCurrentTagTarget } from "../../../store/statusReducer";
import { cloneDeep } from "lodash";

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

  return <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId="droppable" direction="horizontal">
      {(provided, snapshot) => (
        // 下面开始书写容器
        <div style={{ display: "flex" }}
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
                  onClick={()=>selectTag(item.tagTarget)}
                  className={item.tagTarget === tagSelected ? `${styles.tag} ${styles.tag_active}` : styles.tag}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  {item.tagName}
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
