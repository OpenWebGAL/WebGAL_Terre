import {t} from "@lingui/macro";

export const choose = {
  name: t`选项`,
  path: `Stage/Choose/choose.scss`,
  nodes: [
    {name: t`选项列表`, class: 'Choose_Main'},
    {name: t`选项按钮`, class: 'Choose_item'},
    {name: t`选项按钮（禁用）`, class: 'Choose_item_disabled'},
    {name: t`选项按钮外层`, class: 'Choose_item_outer'},
  ],
};
