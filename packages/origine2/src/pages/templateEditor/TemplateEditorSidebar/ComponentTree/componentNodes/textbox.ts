import {t} from "@lingui/macro";

export const textbox = {
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
