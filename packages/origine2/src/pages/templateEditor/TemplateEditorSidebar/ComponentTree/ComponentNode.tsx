import { useState } from "react";
import { IClassNode, IComponentNode } from "./ComponentTree";
import styles from './componentNode.module.scss';
import { ChevronDownFilled, ChevronDownRegular, ChevronUpFilled, ChevronUpRegular, bundleIcon } from "@fluentui/react-icons";

const ChevronDownIcon = bundleIcon(ChevronDownFilled, ChevronDownRegular);
const ChevronUpIcon = bundleIcon(ChevronUpFilled, ChevronUpRegular);

export default function ComponentNode({ componentNode, handleClassNodeClick }:
  { componentNode: IComponentNode, handleClassNodeClick: (classNode: IClassNode, path?: string) => void }) {

  const [expand, setExpand] = useState(false);

  const handleComponentNodeClick = () => setExpand(!expand);

  return (
    <>
      <div onClick={handleComponentNodeClick} className={styles.componentNode}>
        <span>{componentNode.name}</span>
        {expand ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </div>
      {
        expand &&
        <div>
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