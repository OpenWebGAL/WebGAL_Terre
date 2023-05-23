import {
  CompletionItem,
  CompletionItemKind,
  Position,
} from 'vscode-languageserver';

export function getArgsKey(
  line: string,
  allTextBefore: string,
  position: Position,
): CompletionItem[] {
  if (line.endsWith(' -') && line.startsWith('setAnimation:')) {
    return [...abbrKeys, ...keyNames, ...setAnimationKeys];
  }
  if (line.endsWith(' -') && line.startsWith('changeFigure:')) {
    return [...abbrKeys, ...keyNames, ...figureKeys];
  }
  if (line.endsWith(' -') && line.includes(':')) {
    return [...abbrKeys, ...keyNames];
  }
  return [];
}

const abbrKeys: CompletionItem[] = [
  {
    label: '-next',
    kind: CompletionItemKind.Constant,
    documentation: `连续执行本句和下一句`,
    detail: `option -next`,
    insertText: 'next',
  },
  {
    label: '-notend',
    kind: CompletionItemKind.Constant,
    documentation: `用于对话，表示该对话未结束`,
    detail: `option -notend`,
    insertText: 'notend',
  },
  {
    label: '-concat',
    kind: CompletionItemKind.Constant,
    documentation: `用于对话，将该对话与上一句连接`,
    detail: `option -concat`,
    insertText: 'concat',
  },
];

const keyNames: CompletionItem[] = [
  {
    label: '-when',
    kind: CompletionItemKind.Constant,
    documentation: `条件执行本句
changeScene:2.txt -when=a>1;a>1时跳转到场景2`,
    detail: `option -when=<condition>`,
    insertText: 'when=',
  },
];

const figureKeys: CompletionItem[] = [
  {
    label: '-left',
    kind: CompletionItemKind.Constant,
    documentation: `立绘设置在左侧`,
    detail: `option -left`,
    insertText: 'left',
  },
  {
    label: '-right',
    kind: CompletionItemKind.Constant,
    documentation: `立绘设置在右侧`,
    detail: `option -right`,
    insertText: 'right',
  },
  {
    label: '-id',
    kind: CompletionItemKind.Constant,
    documentation: `设置立绘 ID`,
    detail: `option -id=<figureId>`,
    insertText: 'id=',
  },
];

const setAnimationKeys: CompletionItem[] = [
  {
    label: '-target',
    kind: CompletionItemKind.Constant,
    documentation: `设置动画目标 ID`,
    detail: `option -target=<targetId>`,
    insertText: 'target=',
  },
];
