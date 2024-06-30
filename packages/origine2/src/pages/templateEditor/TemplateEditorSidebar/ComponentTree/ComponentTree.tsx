import useEditorStore from '@/store/useEditorStore';
import ComponentNode from './ComponentNode';
import styles from './componentTree.module.scss';
import {t} from "@lingui/macro";
import {componentTree} from "@/pages/templateEditor/TemplateEditorSidebar/ComponentTree/componentNodes";
import {useLingui} from "@lingui/react";

export interface IComponentNode {
  name: string,
  path: string,
  nodes: IClassNode[],
}

export interface IClassNode {
  name: string,
  class: string,
}

export default function ComponentTree() {
  const templateName = useEditorStore.use.subPage();
  const basePath = `templates/${templateName}`;
  const tree = componentTree.map(e => ({...e, path: `${basePath}/${e.path}`}));
  useLingui();

  return (
    <div className={styles.componentTree}>
      {tree.map((componentNode) =>
        <ComponentNode key={componentNode.name} componentNode={componentNode}/>
      )}
    </div>
  );
}
