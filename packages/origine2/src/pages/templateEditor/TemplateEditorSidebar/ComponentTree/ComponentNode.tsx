import { IClassNode, IComponentNode } from "./ComponentTree";
import styles from './componentNode.module.scss';
import { ChevronDownFilled, ChevronDownRegular, ChevronUpFilled, ChevronUpRegular, bundleIcon } from "@fluentui/react-icons";
import { useTemplateEditorContext } from "@/store/useTemplateEditorStore";
import { ITab } from "@/types/templateEditor";
import {sendComponentPreviewMessage} from "@/pages/templateEditor/TemplateEditor";
import { Tooltip } from "@fluentui/react-components";

const ChevronDownIcon = bundleIcon(ChevronDownFilled, ChevronDownRegular);
const ChevronUpIcon = bundleIcon(ChevronUpFilled, ChevronUpRegular);

export default function ComponentNode({ componentNode }: { componentNode: IComponentNode }) {

  const tabs = useTemplateEditorContext((state) => state.tabs);
  const currentTab = useTemplateEditorContext((state) => state.currentTab);
  const expandNode = useTemplateEditorContext((state) => state.expandNode);
  const updateTabs = useTemplateEditorContext((state) => state.updateTabs);
  const updateCurrentTab = useTemplateEditorContext((state) => state.updateCurrentTab);
  const updateExpandNode = useTemplateEditorContext((state) => state.updateExpandNode);

  const getFileName = (path: string) => path.split('/').slice(-1).toString();

  const expand = expandNode.includes(getFileName(componentNode.path));

  const handleComponentNodeClick = () =>
    expand
      ? updateExpandNode(expandNode.filter(path => path !== getFileName(componentNode.path)))
      : updateExpandNode([...expandNode, getFileName(componentNode.path)]);
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
    sendComponentPreviewMessage(newTab.path, classNode.class);
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
            componentNode.nodes?.map((classNode) => {
              return (
                <Tooltip
                  key={classNode.name}
                  content={
                    <div>
                      {componentNode.path}
                      <div style={{ color: 'var(--text-weak)', fontSize: '12px', fontStyle: 'italic', }}>.{classNode.class}</div>
                    </div>
                  } 
                  relationship='label'
                  positioning='after-top'
                >
                  <div
                    className={
                      (currentTab && componentNode.path === currentTab.path && classNode.class === currentTab.class)
                        ? `${styles.classNode} ${styles.classNodeActive}`
                        : styles.classNode
                    }
                    onClick={() => handleClassNodeClick(classNode, componentNode.path)}
                  >
                    {classNode.name}
                  </div>
                </Tooltip>
              );
            }
            )
          }
        </div>
      }
    </>
  );
}
