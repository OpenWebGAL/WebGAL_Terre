import useEditorStore from '@/store/useEditorStore';
import ComponentNode from './ComponentNode';
import styles from './componentTree.module.scss';

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
  const basePath = `public/templates/${templateName}/template`;

  const componentTree: IComponentNode[] = [
    {
      name: '标题',
      path: `${basePath}/UI/Title/title.scss`,
      nodes: [
        { name: '标题', class: 'Title_main' },
        { name: '标题按钮列表', class: 'Title_buttonList' },
        { name: '标题按钮', class: 'Title_button' },
        { name: '标题按钮文字', class: 'Title_button_text' },
        { name: '标题备用背景', class: 'Title_backup_background' },
      ],
    },
    {
      name: '文本框',
      path: `${basePath}/Stage/TextBox/textbox.scss`,
      nodes: [
        { name: '文本框', class: 'TextBox_main' },
      ],
    },
  ];

  const handleClassNodeClick = (classNode: IClassNode, path?: string) => {
    console.log(`Clicked node: `, classNode, path);
  };

  return (
    <div className={styles.componentTree}>
      {componentTree.map((componentNode) =>
        <ComponentNode key={componentNode.name} componentNode={componentNode} handleClassNodeClick={handleClassNodeClick} />
      )}
    </div>
  );
}