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

export const useComponentTreeTitle = () => {
  return {
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
};

export const useComponentTreeTextbox = () => {
  return {
    name: t`文本框`,
    path: `Stage/TextBox/textbox.scss`,
    nodes: [
      { name: t`文本框`, class: 'TextBox_main' },
      // string 'miniavatarOff' is used by tabsSyncAction function in TemplateEditor.tsx
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
};

export const useTemplateTempScene = () => {
  return {
    textbox: `WebGal:${t`对话框文字`} -fontSize=default;`,
    choose: `choose:${t`可选项`}:|[false]->${t`不可选项`}:;`
  };
};

export const useComponentTreeChoose = () => {
  return {
    name: t`选项`,
    path: `Stage/Choose/choose.scss`,
    nodes: [
      {name: t`选项列表`, class: 'Choose_Main'},
      {name: t`选项按钮`, class: 'Choose_item'},
      {name: t`选项按钮（禁用）`, class: 'Choose_item_disabled'},
      {name: t`选项按钮外层`, class: 'Choose_item_outer'},
    ],
  };
};

export default function ComponentTree() {

  useLingui();

  /**
   * Component Tree
   * 通过函数形式延迟加载字符，以便适应useLingui();
   */

  const componentTree: IComponentNode[] = [
    useComponentTreeTitle(),
    useComponentTreeTextbox(),
    useComponentTreeChoose(),
  ];

  const templateDir = useEditorStore.use.subPage();

  return (
    <div className={styles.componentTree}>
      {componentTree.map((componentNode) =>
        <ComponentNode key={componentNode.name} componentNode={componentNode}/>
      )}
    </div>
  );
}
