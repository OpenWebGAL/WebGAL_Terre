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
      { name: t`文本元素（开始）`, class: 'TextBox_textElement_start' },
      { name: t`外层文本`, class: 'outer' },
      { name: t`内层文本`, class: 'inner' },
      { name: t`文本占位`, class: 'zhanwei' },
      { name: t`文本元素（完成）`, class: 'TextBox_textElement_Settled' },
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

export const useComponentTreeBacklog = () => {
  return {
    name: t`回想`,
    path: `UI/Backlog/backlog.scss`,
    nodes: [
      { name: t`回想主界面`, class: 'Backlog_main' },
      { name: t`回想主界面（退出）`, class: 'Backlog_main_out' },
      { name: t`回想主界面（隐藏层级）`, class: 'Backlog_main_out_IndexHide' },
      { name: t`回想主界面（禁用滚动）`, class: 'Backlog_main_DisableScroll' },
      { name: t`回想顶部区域`, class: 'backlog_top' },
      { name: t`回想顶部图标`, class: 'backlog_top_icon' },
      { name: t`回想标题`, class: 'backlog_title' },
      { name: t`回想内容区`, class: 'backlog_content' },
      { name: t`回想条目`, class: 'backlog_item' },
      { name: t`回想条目（退出）`, class: 'backlog_item_out' },
      { name: t`回想条目功能区`, class: 'backlog_func_area' },
      { name: t`回想条目角色名`, class: 'backlog_item_content_name' },
      { name: t`回想条目内容容器`, class: 'backlog_item_content' },
      { name: t`回想条目按钮列表`, class: 'backlog_item_button_list' },
      { name: t`回想条目按钮`, class: 'backlog_item_button_element' },
      { name: t`回想条目文本`, class: 'backlog_item_content_text' },
    ],
  };
};

export const useComponentTreeBottomControlPanel = () => {
  return {
    name: t`底部控制栏`,
    path: `UI/BottomControlPanel/bottomControlPanel.scss`,
    nodes: [
      { name: t`控制栏主体`, class: 'main' },
      { name: t`控制栏按钮`, class: 'button' },
      { name: t`按钮文字`, class: 'button_text' },
      { name: t`按钮（开启）`, class: 'button_on' },
      { name: t`单个按钮`, class: 'singleButton' },
      { name: t`单个按钮（激活）`, class: 'singleButton_active' },
      { name: t`快存读预览`, class: 'fastSlPreview' },
      { name: t`预览主体`, class: 'slPreviewMain' },
      { name: t`预览图片容器`, class: 'imgContainer' },
      { name: t`预览文本容器`, class: 'textContainer' },
    ],
  };
};

export const useComponentTreeBottomControlPanelFilm = () => {
  return {
    name: t`底部控制栏（电影模式）`,
    path: `UI/BottomControlPanel/bottomControlPanelFilm.scss`,
    nodes: [
      { name: t`标签`, class: 'tag' },
      { name: t`面板容器`, class: 'container' },
      { name: t`面板单个按钮`, class: 'singleButton' },
      { name: t`面板按钮文字`, class: 'button_text' },
    ],
  };
};

export const useComponentTreeDevPanel = () => {
  return {
    name: t`开发者面板`,
    path: `UI/DevPanel/devPanel.scss`,
    nodes: [
      { name: t`面板主体`, class: 'devPanelMain' },
      { name: t`面板开关`, class: 'devPanelOpener' },
    ],
  };
};

export const useComponentTreeExtra = () => {
  return {
    name: t`Extra`,
    path: `UI/Extra/extra.scss`,
    nodes: [
      { name: t`Extra 主界面`, class: 'extra' },
      { name: t`Extra 顶部区域`, class: 'extra_top' },
      { name: t`Extra 顶部图标`, class: 'extra_top_icon' },
      { name: t`Extra 标题`, class: 'extra_title' },
      { name: t`Extra 主容器`, class: 'mainContainer' },
      { name: t`BGM 容器`, class: 'bgmContainer' },
      { name: t`BGM 列表容器`, class: 'bgmListContainer' },
      { name: t`BGM 播放器`, class: 'bgmPlayerMain' },
      { name: t`BGM 控制按钮`, class: 'bgmControlButton' },
      { name: t`BGM 名称`, class: 'bgmName' },
      { name: t`BGM 条目`, class: 'bgmElement' },
      { name: t`BGM 条目（激活）`, class: 'bgmElement_active' },
      { name: t`CG 主区`, class: 'cgMain' },
      { name: t`CG 容器`, class: 'cgContainer' },
      { name: t`CG 条目`, class: 'cgElement' },
      { name: t`CG 展示区`, class: 'cgShowDiv' },
      { name: t`CG 展示区外层`, class: 'cgShowDivWarpper' },
      { name: t`CG 导航`, class: 'cgNav' },
      { name: t`CG 导航（激活）`, class: 'cgNav_active' },
      { name: t`全屏展示容器`, class: 'showFullContainer' },
      { name: t`全屏 CG 主体`, class: 'showFullCgMain' },
    ],
  };
};

export const useComponentTreeGlobalDialog = () => {
  return {
    name: t`全局对话框`,
    path: `UI/GlobalDialog/globalDialog.scss`,
    nodes: [
      { name: t`对话框主体`, class: 'GlobalDialog_main' },
      { name: t`对话框内层容器`, class: 'glabalDialog_container_inner' },
      { name: t`对话框容器`, class: 'glabalDialog_container' },
      { name: t`对话框标题`, class: 'title' },
      { name: t`对话框按钮列表`, class: 'button_list' },
      { name: t`对话框按钮`, class: 'button' },
    ],
  };
};

export const useComponentTreeLogo = () => {
  return {
    name: t`Logo`,
    path: `UI/Logo/logo.scss`,
    nodes: [
      { name: t`Logo 主体`, class: 'Logo_main' },
      { name: t`Logo 背景`, class: 'Logo_Back' },
      { name: t`Logo 动画激活`, class: 'animationActive' },
    ],
  };
};

export const useComponentTreeMenu = () => {
  return {
    name: t`菜单`,
    path: `UI/Menu/menu.scss`,
    nodes: [
      { name: t`菜单主界面`, class: 'Menu_main' },
      { name: t`菜单标签内容`, class: 'Menu_TagContent' },
    ],
  };
};

export const useComponentTreeMenuPanel = () => {
  return {
    name: t`菜单面板`,
    path: `UI/Menu/menuPanel.scss`,
    nodes: [
      { name: t`菜单面板主体`, class: 'MenuPanel_main' },
      { name: t`菜单面板按钮`, class: 'MenuPanel_button' },
      { name: t`菜单面板按钮图标`, class: 'MenuPanel_button_icon' },
      { name: t`菜单面板按钮高亮`, class: 'MenuPanel_button_hl' },
    ],
  };
};

export const useComponentTreeNormalButton = () => {
  return {
    name: t`普通按钮`,
    path: `UI/Menu/normalButton.scss`,
    nodes: [
      { name: t`普通按钮`, class: 'NormalButton' },
      { name: t`普通按钮（选中）`, class: 'NormalButtonChecked' },
    ],
  };
};

export const useComponentTreeNormalOption = () => {
  return {
    name: t`普通选项`,
    path: `UI/Menu/normalOption.scss`,
    nodes: [
      { name: t`普通选项容器`, class: 'NormalOption' },
      { name: t`普通选项标题`, class: 'NormalOption_title' },
      { name: t`普通选项标题描边`, class: 'NormalOption_title_bef' },
      { name: t`普通选项标题阴影`, class: 'NormalOption_title_sd' },
      { name: t`普通选项按钮列表`, class: 'NormalOption_buttonList' },
    ],
  };
};

export const useComponentTreeOptions = () => {
  return {
    name: t`选项设置`,
    path: `UI/Menu/options.scss`,
    nodes: [
      { name: t`选项主界面`, class: 'Options_main' },
      { name: t`选项顶部`, class: 'Options_top' },
      { name: t`选项标题`, class: 'Options_title' },
      { name: t`选项标题文字`, class: 'Option_title_text' },
      { name: t`选项标题描边`, class: 'Option_title_text_shadow' },
      { name: t`选项标题投影`, class: 'Option_title_text_ts' },
      { name: t`选项内容区`, class: 'Options_main_content' },
      { name: t`选项内容列`, class: 'Options_main_content_half' },
      { name: t`关于入口标题`, class: 'About_title_text' },
      { name: t`关于入口文字`, class: 'About_text' },
      { name: t`选项分页容器`, class: 'Options_page_container' },
      { name: t`选项分页按钮列表`, class: 'Options_button_list' },
      { name: t`选项分页按钮`, class: 'Options_page_button' },
      { name: t`选项分页按钮（激活）`, class: 'Options_page_button_active' },
    ],
  };
};

export const useComponentTreeSaveAndLoad = () => {
  return {
    name: t`存读档`,
    path: `UI/Menu/saveAndLoad.scss`,
    nodes: [
      { name: t`存读主界面`, class: 'Save_Load_main' },
      { name: t`存读顶部`, class: 'Save_Load_top' },
      { name: t`存读标题背景`, class: 'Save_Load_title' },
      { name: t`存档标题文字`, class: 'Save_title_text' },
      { name: t`读档标题文字`, class: 'Load_title_text' },
      { name: t`存读顶部按钮列表`, class: 'Save_Load_top_buttonList' },
      { name: t`存读顶部按钮`, class: 'Save_Load_top_button' },
      { name: t`存读顶部按钮文字`, class: 'Save_Load_top_button_text' },
      { name: t`存读顶部按钮（选中）`, class: 'Save_Load_top_button_on' },
      { name: t`读档顶部按钮（选中）`, class: 'Load_top_button_on' },
      { name: t`存读内容区`, class: 'Save_Load_content' },
      { name: t`存读条目`, class: 'Save_Load_content_element' },
      { name: t`存读条目顶部`, class: 'Save_Load_content_element_top' },
      { name: t`存读条目序号`, class: 'Save_Load_content_element_top_index' },
      { name: t`读档条目序号`, class: 'Load_content_elememt_top_index' },
      { name: t`存读条目日期`, class: 'Save_Load_content_element_top_date' },
      { name: t`读档条目日期`, class: 'Load_content_element_top_date' },
      { name: t`存读条目文本`, class: 'Save_Load_content_text' },
      { name: t`存读条目文本内边距`, class: 'Save_Load_content_text_padding' },
      { name: t`存读条目角色名`, class: 'Save_Load_content_speaker' },
      { name: t`读档条目角色名`, class: 'Load_content_speaker' },
      { name: t`读档条目文本`, class: 'Load_content_text' },
      { name: t`存读小立绘`, class: 'Save_Load_content_miniRen' },
      { name: t`存读小立绘背景`, class: 'Save_Load_content_miniRen_bg' },
      { name: t`存读小立绘角色`, class: 'Save_Load_content_miniRen_figure' },
      { name: t`存读小立绘（左）`, class: 'Save_Load_content_miniRen_figLeft' },
      { name: t`存读小立绘（右）`, class: 'Save_Load_content_miniRen_figRight' },
    ],
  };
};

export const useComponentTreeSlider = () => {
  return {
    name: t`滑块`,
    path: `UI/Menu/slider.scss`,
    nodes: [
      { name: t`选项滑块`, class: 'Option_WebGAL_slider' },
      { name: t`滑块气泡`, class: 'bubble' },
    ],
  };
};

export const useComponentTreeAbout = () => {
  return {
    name: t`关于`,
    path: `UI/Menu/about.scss`,
    nodes: [
      { name: t`返回按钮`, class: 'backButton' },
      { name: t`关于内容`, class: 'about' },
      { name: t`图标`, class: 'icon' },
      { name: t`标题`, class: 'title' },
      { name: t`文本`, class: 'text' },
      { name: t`贡献者`, class: 'contributor' },
    ],
  };
};

export const useComponentTreeTextPreview = () => {
  return {
    name: t`文本预览`,
    path: `UI/Menu/textPreview.scss`,
    nodes: [
      { name: t`文本预览主体`, class: 'textPreviewMain' },
      { name: t`预览文本框`, class: 'textbox' },
    ],
  };
};

export const useComponentTreePanicOverlay = () => {
  return {
    name: t`紧急遮罩`,
    path: `UI/PanicOverlay/panicOverlay.scss`,
    nodes: [
      { name: t`紧急遮罩主体`, class: 'panic_overlay_main' },
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
    useComponentTreeLogo(),
    useComponentTreeTextbox(),
    useComponentTreeChoose(),
    useComponentTreeBacklog(),
    useComponentTreeBottomControlPanel(),
    useComponentTreeBottomControlPanelFilm(),
    useComponentTreeDevPanel(),
    useComponentTreeExtra(),
    useComponentTreeGlobalDialog(),
    useComponentTreeMenu(),
    useComponentTreeMenuPanel(),
    useComponentTreeNormalButton(),
    useComponentTreeNormalOption(),
    useComponentTreeOptions(),
    useComponentTreeSaveAndLoad(),
    useComponentTreeSlider(),
    useComponentTreeAbout(),
    useComponentTreeTextPreview(),
    useComponentTreePanicOverlay(),
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
