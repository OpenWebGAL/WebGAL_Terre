import {t} from "@lingui/macro";

export const title = {
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
