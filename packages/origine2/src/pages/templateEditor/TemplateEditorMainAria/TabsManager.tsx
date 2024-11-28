import React, { useRef } from 'react';
import styles from './tabsManager.module.scss';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { CloseSmall } from '@icon-park/react';
import { getFileIcon } from '@/utils/getFileIcon';
import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';
import { ITab } from '@/types/templateEditor';
import { cloneDeep } from 'lodash';
import IconWrapper from '@/components/iconWrapper/IconWrapper';
import {tabsSyncAction} from "@/pages/templateEditor/TemplateEditor";

export default function TabsManager() {

  const tabs = useTemplateEditorContext((state) => state.tabs);
  const currentTab = useTemplateEditorContext((state) => state.currentTab);
  const updateTabs = useTemplateEditorContext((state) => state.updateTabs);
  const updateCurrentTab = useTemplateEditorContext((state) => state.updateCurrentTab);

  // 重新记录数组顺序
  const reorder = (list: Array<ITab>, startIndex: number, endIndex: number): Array<ITab> => {
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
    updateTabs(newList);
  }

  function selectTab(tab: ITab) {
    tabsSyncAction(tab.path, tab.name);
    updateCurrentTab(tab);
  }

  function closeTab(ev: MouseEvent, tabTarget: ITab) {
    // 先设法确定新的 target 是什么
    // 删除的是尾部，就是前一个，删除的不是尾部，就是后一个
    const targetIndex = tabs.findIndex((e) => e.path === tabTarget.path && e.class === tabTarget.class);
    let newTarget;
    if (tabs.length > 1) {
      // 是最后一个
      if (targetIndex === tabs.length - 1) {
        newTarget = tabs[tabs.length - 2];
      } else { // 不是最后一个
        newTarget = tabs[targetIndex + 1];
      }
    }
    const newTabs = Array.from(tabs);
    newTabs.splice(targetIndex, 1);
    console.log(newTabs);
    console.log(newTarget);
    // 关闭这个标签并设置新的激活标签
    if (tabTarget.path === currentTab?.path && tabTarget.class === currentTab?.class)
      updateCurrentTab(newTarget as ITab);
    updateTabs(newTabs);
    ev.stopPropagation();
  }

  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    const deltaY = event.deltaY;
    console.log(`滚动距离：${deltaY}px`);
    const element = document.getElementById('tabs-container');
    if (element) {
      const x = element.scrollLeft;
      const toX = x + deltaY;
      element.scrollTo(toX, 0);
    }
  };

  return (
    <>
      {
        (tabs.length > 0) &&
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided, snapshot) => (
              // 下面开始书写容器
              <div className={styles.tabsContainer}
                id="tabs-container"
                onWheel={handleScroll}
                // provided.droppableProps应用的相同元素.
                {...provided.droppableProps}
                // 为了使 droppable 能够正常工作必须 绑定到最高可能的DOM节点中provided.innerRef.
                ref={provided.innerRef}
              >
                {tabs.map((item, index) => (
                  <Draggable key={`${item.path}${item.class}`} draggableId={`${item.path}${item.class}`} index={index}>
                    {(provided, snapshot) => (
                      // 下面开始书写可拖拽的元素
                      <div
                        onClick={() => selectTab(item)}
                        onMouseDown={(event: any) => {
                          if (event.button === 1) {
                            closeTab(event, item);
                          }
                        }}
                        className={
                          item.path === currentTab?.path && item.class === currentTab.class
                            ? `${styles.tab} ${styles.tab_active}`
                            : styles.tab
                        }
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <IconWrapper src={getFileIcon(item.path)} size={24} iconSize={18} />
                        <div>
                          {item.name}
                        </div>
                        <div className={styles.closeIcon} onClick={(event: any) => closeTab(event, item)}>
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
        </DragDropContext>
      }
    </>
  );
}
