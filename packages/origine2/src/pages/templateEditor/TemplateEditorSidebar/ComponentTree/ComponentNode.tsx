import { useState } from "react";
import { IClassNode, IComponentNode } from "./ComponentTree";
import styles from './componentNode.module.scss';
import { ChevronDownFilled, ChevronDownRegular, ChevronUpFilled, ChevronUpRegular, bundleIcon } from "@fluentui/react-icons";
import { useTemplateEditorContext } from "@/store/useTemplateEditorStore";

const ChevronDownIcon = bundleIcon(ChevronDownFilled, ChevronDownRegular);
const ChevronUpIcon = bundleIcon(ChevronUpFilled, ChevronUpRegular);

export default function ComponentNode({ componentNode }: { componentNode: IComponentNode }) {

  const [expand, setExpand] = useState(false);

  const currentClassNode = useTemplateEditorContext((state) => state.currentClassNode);
  const updateCurrentClassNode = useTemplateEditorContext((state) => state.updateCurrentClassNode);

  const handleComponentNodeClick = () => setExpand(!expand);
  const handleClassNodeClick = (classNode: IClassNode, path: string) => updateCurrentClassNode({ ...classNode, path });

  return (
    <>
      <div onClick={handleComponentNodeClick} className={styles.componentNode}>
        <span>{componentNode.name}</span>
        {expand ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </div>
      {
        expand &&
        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
          {
            componentNode.nodes?.map((classNode) =>
              <div
                key={classNode.name}
                className={`${styles.classNode} ${currentClassNode?.class === classNode.class
                  && currentClassNode.path === componentNode.path ? styles.classNodeActive : ''}`}
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