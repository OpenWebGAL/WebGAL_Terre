import { useState } from "react";
import { IClassNode, IComponentNode } from "./ComponentTree";
import styles from './componentNode.module.scss';
import { ChevronDownFilled, ChevronDownRegular, ChevronUpFilled, ChevronUpRegular, bundleIcon } from "@fluentui/react-icons";
import { useTemplateEditorContext } from "@/store/useTemplateEditorStore";
import { ITab } from "@/types/templateEditor";

const ChevronDownIcon = bundleIcon(ChevronDownFilled, ChevronDownRegular);
const ChevronUpIcon = bundleIcon(ChevronUpFilled, ChevronUpRegular);

export default function ComponentNode({ componentNode }: { componentNode: IComponentNode }) {

  const tabs = useTemplateEditorContext((state) => state.tabs);
  const updateTabs = useTemplateEditorContext((state) => state.updateTabs);
  const updateCurrentTab = useTemplateEditorContext((state) => state.updateCurrentTab);

  const [expand, setExpand] = useState(false);

  const handleComponentNodeClick = () => setExpand(!expand);
  const handleClassNodeClick = (classNode: IClassNode, path: string) => {
    const newTab: ITab = {
      name: classNode.name,
      path: path,
      class: classNode.class,
    };
    if (!tabs.some(tab => tab.path === newTab.path && tab.class === newTab.class)) {
      updateTabs([...tabs, newTab]);
    }
    updateCurrentTab(newTab);
  };

  return (
    <>
      <div onClick={handleComponentNodeClick} className={styles.componentNode}>
        <span>{componentNode.name}</span>
        {expand ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </div>
      {
        expand &&
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {
            componentNode.nodes?.map((classNode) =>
              <div
                key={classNode.name}
                className={styles.classNode}
                onClick={() => handleClassNodeClick(classNode, componentNode.path)}
              >
                {classNode.name}
              </div>
            )
          }
        </div>
      }
    </>
  );
}