import useEditorStore from '@/store/useEditorStore';
import ComponentNode from './ComponentNode';
import styles from './componentTree.module.scss';
import {t} from "@lingui/macro";
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
  /**
   * Component Tree
   * 不知道为啥，不写到这打包会有问题
   */
  const textbox = {
    name: t`文本框`,
    path: `Stage/TextBox/textbox.scss`,
    nodes: [
      { name: t`文本框`, class: 'TextBox_main' },
      { name: t`文本框（小头像关闭时）`, class: 'TextBox_main_miniavatarOff' },
      { name: t`文本框背景`, class: 'TextBox_Background' },
      { name: t`外层文本`, class: 'outer' },
      { name: t`内层文本`, class: 'inner' },
      { name: t`角色名文本框`, class: 'TextBox_showName' },
      { name: t`角色名文本框背景`, class: 'TextBox_ShowName_Background' },
      { name: t`小头像容器`, class: 'miniAvatarContainer' },
      { name: t`小头像图像`, class: 'miniAvatarImg' },
      { name: t`角色名容器`, class: 'nameContainer' },
      { name: t`角色名外层文本`, class: 'outerName' },
      { name: t`角色名内层文本`, class: 'innerName' },
      { name: t`文本框文本`, class: 'text' },
    ],
  };

  const choose = {
    name: t`选项`,
    path: `Stage/Choose/choose.scss`,
    nodes: [
      {name: t`选项列表`, class: 'Choose_Main'},
      {name: t`选项按钮`, class: 'Choose_item'},
      {name: t`选项按钮（禁用）`, class: 'Choose_item_disabled'},
      {name: t`选项按钮外层`, class: 'Choose_item_outer'},
    ],
  };

  const title = {
    name: t`标题`,
    path: `UI/Title/title.scss`,
    nodes: [
      { name: t`标题`, class: 'Title_main' },
      { name: t`标题按钮列表`, class: 'Title_buttonList' },
      { name: t`标题按钮`, class: 'Title_button' },
      { name: t`标题按钮文字`, class: 'Title_button_text' },
      { name: t`标题备用背景`, class: 'Title_backup_background' },
    ],
  };

  const componentTree: IComponentNode[] = [
    title,
    textbox,
    choose
  ];

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
