import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
  CompletionTriggerKind,
} from 'vscode-languageserver';
// FIXME: Error: Cannot find module 'webgal-parser/src/interface/sceneInterface'
// import { commandType } from 'webgal-parser/src/interface/sceneInterface';

/**
 * 语句类型
 */
export enum commandType {
  say = 0,
  changeBg = 1,
  changeFigure = 2,
  bgm = 3,
  video = 4,
  pixi = 5,
  pixiInit = 6,
  intro = 7,
  miniAvatar = 8,
  changeScene = 9,
  choose = 10,
  end = 11,
  setComplexAnimation = 12,
  setFilter = 13,
  label = 14,
  jumpLabel = 15,
  chooseLabel = 16,
  setVar = 17,
  if = 18,
  callScene = 19,
  showVars = 20,
  unlockCg = 21,
  unlockBgm = 22,
  filmMode = 23,
  setTextbox = 24,
  setAnimation = 25,
  playEffect = 26,
  setTempAnimation = 27,
  comment = 28,
  setTransform = 29,
  setTransition = 30,
  getUserInput = 31,
  applyStyle = 32,
}

type ICommandArgs = {
  mandatory?: (CompletionItem & { hasValue?: boolean })[];
  optional?: (CompletionItem & { hasValue?: boolean })[];
};

type ICommandArgsMap = {
  [ct in commandType]: ICommandArgs;
};

function makeDocString(descrption: string, example: string) {
  let result = '';
  if (descrption !== '') {
    result += `${descrption}\n`;
  }
  if (example !== '') {
    result += `示例：\n  \`\`\`\n  ${example}\n  \`\`\``;
  }
  return result;
}

export const commandArgs: ICommandArgsMap = {
  [commandType.say]: {
    mandatory: [],
    optional: [
      {
        label: 'concat',
        labelDetails: {
          description: '连接对话至上一句对话之后',
        },
        documentation: makeDocString(
          `有时候，可能你希望在某一句对话执行到某个阶段时加入演出效果，比如切换表情等。
这时候，你可以使用 -notend -concat 参数来实现在对话中插入任意语句。
  -concat 代表本句对话连接在上一句对话之后
  -notend 代表本句对话没有结束，在后面可能连接演出或对话。`,
          `切换立绘！马上切换表情...... -notend -concat;
  changeFigure:k2.png -next;
  切换表情！ -concat;`,
        ),
      },
      {
        label: 'notend',
        labelDetails: {
          description: '在对话后连接演出或对话',
        },
        documentation: makeDocString(
          `有时候，可能你希望在某一句对话执行到某个阶段时加入演出效果，比如切换表情等。
这时候，你可以使用 -notend -concat 参数来实现在对话中插入任意语句。
  -concat 代表本句对话连接在上一句对话之后
  -notend 代表本句对话没有结束，在后面可能连接演出或对话。`,
          `WebGAL:测试语句插演出！马上切换立绘...... -notend;
  changeFigure:k1.png -next;
  切换立绘！马上切换表情...... -notend -concat;
          `,
        ),
      },
      {
        label: 'fontsize',
        labelDetails: {
          description: '文字大小',
        },
        hasValue: true,
      },
    ],
  },
  [commandType.changeBg]: {
    mandatory: [
      {
        label: 'unlockname',
        labelDetails: { description: '解锁CG名称' },
        hasValue: true,
      },
    ],
    optional: [],
  },
  [commandType.changeFigure]: {
    mandatory: [],
    optional: [
      {
        label: 'left',
        labelDetails: {
          description: '放置到左侧',
        },
        documentation: makeDocString(
          '现在，你可以在页面的三个不同位置放置不同的立绘，只需要在放置立绘的语句处加上你要放置的位置就可以了',
          `changeFigure:testFigure03.png -left;
  changeFigure:testFigure04.png;
  changeFigure:testFigure03.png -right;`,
        ),
      },
      {
        label: 'right',
        labelDetails: {
          description: '放置到右侧',
        },
        documentation: makeDocString(
          '现在，你可以在页面的三个不同位置放置不同的立绘，只需要在放置立绘的语句处加上你要放置的位置就可以了',
          `changeFigure:testFigure03.png -left;
  changeFigure:testFigure04.png;
  changeFigure:testFigure03.png -right;`,
        ),
      },
      {
        label: 'id',
        labelDetails: {
          description: '为立绘指定ID',
        },
        documentation: makeDocString(
          '如果你想要更精确地控制立绘，可以为立绘指定 id 和初始位置',
          `; // 一个初始位置在右侧的自由立绘
  changeFigure:testFigure03.png -left -id=test1;
  ; // 通过 id 关闭立绘
  changeFigure:none -id=test1;`,
        ),
        hasValue: true,
      },
    ],
  },
  [commandType.bgm]: {
    mandatory: [],
    optional: [
      {
        label: 'volume',
        labelDetails: {
          description: '调整音量',
        },
        documentation: makeDocString('', 'bgm:夏影.mp3 -volume=30;'),
        hasValue: true,
      },
      {
        label: 'enter',
        labelDetails: {
          description: '进行淡入/淡出播放',
        },
        documentation: makeDocString(
          '',
          ';淡入:\n  bgm:夏影.mp3 -enter=3000;\n  ;淡出:bgm:none -enter=3000;',
        ),
        hasValue: true,
      },
    ],
  },
  [commandType.video]: {
    mandatory: [],
    optional: [
      { label: 'skipOff', labelDetails: { description: '阻止用户跳过视频' } },
    ],
  },
  [commandType.pixi]: {
    mandatory: [],
    optional: [],
  },
  /**
   * NO_ARGS
   */
  [commandType.pixiInit]: {
    mandatory: [],
    optional: [],
  },
  [commandType.intro]: {
    mandatory: [],
    optional: [
      {
        label: 'hold',
        labelDetails: { description: '结束后保持独白界面' },
        documentation: makeDocString(
          '',
          'intro:回忆不需要适合的剧本，|反正一说出口，|都成了戏言。 -hold;',
        ),
      },
    ],
  },
  /**
   * NO_ARGS
   */
  [commandType.miniAvatar]: {
    mandatory: [],
    optional: [],
  },
  /**
   * NO_ARGS
   */
  [commandType.changeScene]: {
    mandatory: [],
    optional: [],
  },
  /**
   * NO_ARGS
   */
  [commandType.choose]: {
    mandatory: [],
    optional: [],
  },
  /**
   * NO_ARGS
   */
  [commandType.end]: {
    mandatory: [],
    optional: [],
  },
  /**
   * ???
   */
  [commandType.setComplexAnimation]: {
    mandatory: [],
    optional: [],
  },
  /**
   * ???
   */
  [commandType.setFilter]: {
    mandatory: [],
    optional: [],
  },
  /**
   * NO_ARGS
   */
  [commandType.label]: {
    mandatory: [],
    optional: [],
  },
  /**
   * NO_ARGS
   */
  [commandType.jumpLabel]: {
    mandatory: [],
    optional: [],
  },
  /**
   * ???
   */
  [commandType.chooseLabel]: {
    mandatory: [],
    optional: [],
  },
  [commandType.setVar]: {
    mandatory: [],
    optional: [
      {
        label: 'global',
        labelDetails: { description: '长效变量（全局变量）' },
        documentation: makeDocString(
          `WebGAL 的普通变量是跟随存档的，也就是说，任何变量只存在于当前的游戏场景中，只有存档才能将其保存下来，读档将其恢复。
为了解决可能存在的作者希望设置多周目的问题，提供长效（全局）变量，一旦设置，则在整个游戏中生效，除非用户清除全部数据。`,
          `jumpLabel:turn-2 -when=a>0;
  setVar:a=1 -global;
  一周目;
  changeScene:一周目剧情.txt;
  label:turn-2;
  二周目;
  changeScene:二周目剧情.txt;`,
        ),
      },
    ],
  },
  /**
   * ???
   */
  [commandType.if]: {
    mandatory: [],
    optional: [],
  },
  /**
   * NO_ARGS
   */
  [commandType.callScene]: {
    mandatory: [],
    optional: [],
  },
  /**
   * ???
   */
  [commandType.showVars]: {
    mandatory: [],
    optional: [],
  },
  [commandType.unlockCg]: {
    mandatory: [
      {
        label: 'name',
        labelDetails: {
          description: '指定CG名称',
        },
        documentation: makeDocString(
          '',
          'unlockCg:xgmain.jpeg -name=星光咖啡馆与死神之蝶',
        ),
      },
    ],
    optional: [
      {
        label: 'series',
        labelDetails: {
          description: '指定CG系列',
        },
        documentation: makeDocString(
          '同系列的立绘以后会合并展示（即展示成可以切换的同系列CG）',
          'unlockCg:xgmain.jpeg -name=星光咖啡馆与死神之蝶 -series=1;',
        ),
      },
    ],
  },
  [commandType.unlockBgm]: {
    mandatory: [
      {
        label: 'name',
        labelDetails: {
          description: '指定BGM名称',
        },
        documentation: makeDocString(
          '',
          'unlockBgm:s_Title.mp3 -name=Smiling-Swinging!!!;',
        ),
      },
    ],
    optional: [],
  },
  /**
   * ???
   */
  [commandType.filmMode]: {
    mandatory: [],
    optional: [],
  },
  /**
   * ???
   */
  [commandType.setTextbox]: {
    mandatory: [],
    optional: [],
  },
  [commandType.setAnimation]: {
    mandatory: [
      {
        label: 'target',
        labelDetails: { description: '作用目标' },
        documentation: makeDocString(
          '',
          `; // 为中间立绘设置一个从下方进入的动画，并转到下一句
  setAnimation:enter-from-bottom -target=fig-center -next;`,
        ),
      },
    ],
    optional: [],
  },
  [commandType.playEffect]: {
    mandatory: [],
    optional: [
      {
        label: 'volume',
        labelDetails: {
          description: '调整音量',
        },
        documentation: makeDocString(
          '可以为效果音设置一个 -volume 参数，来调整它的音量。',
          'playEffect:xxx.mp3 -volume=30;',
        ),
        hasValue: true,
      },
      {
        label: 'id',
        labelDetails: {
          description: '设置ID',
        },
        documentation: makeDocString(
          '为效果音赋予一个 id 将会自动启用效果音循环，后续使用相同的 id 来停止。',
          `playEffect:xxx.mp3 -id=xxx;
  playEffect:none -id=xxx; // 停止这个循环的效果音`,
        ),
        hasValue: true,
      },
    ],
  },
  /**
   * ???
   */
  [commandType.setTempAnimation]: {
    mandatory: [],
    optional: [],
  },
  /**
   * ???
   */
  [commandType.comment]: {
    mandatory: [],
    optional: [],
  },
  [commandType.setTransform]: {
    mandatory: [
      {
        label: 'target',
        labelDetails: { description: '作用目标' },
      },
    ],
    optional: [],
  },
  [commandType.setTransition]: {
    mandatory: [
      {
        label: 'target',
        labelDetails: { description: '作用目标' },
      },
      {
        label: 'enter',
        labelDetails: { description: '进场效果' },
      },
      {
        label: 'exit',
        labelDetails: { description: '出场效果' },
      },
    ],
    optional: [],
  },
  [commandType.getUserInput]: {
    mandatory: [
      {
        label: 'title',
        labelDetails: {
          description: '提示文本',
        },
        documentation: makeDocString(
          '',
          'getUserInput:name -title=如何称呼你 -buttonText=确认; 将用户输入写入 name 变量中',
        ),
      },
      {
        label: 'buttonText',
        labelDetails: {
          description: '确认按钮文本',
        },
        documentation: makeDocString(
          '',
          'getUserInput:name -title=如何称呼你 -buttonText=确认; 将用户输入写入 name 变量中',
        ),
      },
    ],
    optional: [],
  },
  /**
   * ???
   */
  [commandType.applyStyle]: {
    mandatory: [],
    optional: [],
  },
};

function makeInsertText(label: string, insertDash: boolean, hasValue: boolean) {
  let result = '';
  if (insertDash) {
    result += '-';
  }
  result += label;
  if (hasValue) {
    result += '=';
  }
  return result;
}

function setKind(item: CompletionItem) {
  return { ...item, kind: CompletionItemKind.Field };
}

export function makeCompletion(
  args: ICommandArgs,
  insertDash: boolean,
): CompletionItem[] {
  let result: CompletionItem[] = [];

  result = result.concat(
    args.mandatory.map((arg) => setKind({ ...arg })),
    args.optional.map((arg) =>
      setKind({
        ...arg,
        label: `${arg.label}?`,
        insertText: makeInsertText(arg.label, insertDash, arg.hasValue),
      }),
    ),
  );

  result.push(
    setKind({
      label: 'next?',
      insertText: makeInsertText('next', insertDash, false) + ';',
      labelDetails: {
        description: '在执行完本条语句后立刻跳转到下一条语句',
      },
      documentation: makeDocString(
        '你可以在任意语句后加上参数 -next，这样做可以在执行完本条语句后立刻跳转到下一条语句。这对需要在同一时间内执行多步操作非常有用。',
        'changeBg:testBG03.jpg -next; // 会立刻执行下一条语句',
      ),
    }),
  );
  result.push(
    setKind({
      label: 'when?',
      insertText: makeInsertText('when', insertDash, true),
      labelDetails: {
        description: '根据条件判断当前语句是否要执行',
      },
      documentation: makeDocString(
        `在语句后加上 -when=(condition) 参数，可以根据条件判断当前语句是否要执行。
任何语句都可以加上 -when 参数来控制是否执行。通过组合 -when 参数和 jumpLabel callScene changeScene，你可以实现带条件判断的流程控制。`,
        `setVar:a=1;
  ; // 当 a 大于 1 时跳转到场景 1
  changeScene:1.txt -when=a>1;
  ; // 只有 a 为 1 时才跳转，注意相等运算符是 ==
  changeScene:2.txt -when=a==1;
  ; // 如果 a 小于 1，那么上面的语句不执行，自然就执行这一句了
  changeScene:3.txt;`,
      ),
    }),
  );

  return result;
}

function isTriggeringByDash(params: CompletionParams) {
  return (
    params.context.triggerKind === CompletionTriggerKind.TriggerCharacter &&
    params.context.triggerCharacter === '-'
  );
}

function containsDash(lineBefore: string) {
  const asciiRemoved = lineBefore.replace(/[A-Za-z]/g, '');
  console.debug(`asciiRemoved: ${asciiRemoved}`);
  return asciiRemoved.lastIndexOf('-') === asciiRemoved.length - 1;
}

export function shouldInsertDash(line: string, params: CompletionParams) {
  return (
    !isTriggeringByDash(params) &&
    !containsDash(line.substring(0, params.position.character))
  );
}
