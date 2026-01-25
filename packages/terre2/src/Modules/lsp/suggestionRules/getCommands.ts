import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { markdown } from '../completion/commandArgs';

export function getCommands(): CompletionItem[] {
  return commandSuggestions;
}

function makeInsertText(text: string) {
  return `${text}:`;
}

const commandSuggestions: CompletionItem[] = [
  {
    kind: CompletionItemKind.Function,
    label: 'say',
    insertText: makeInsertText('say'),
    detail: `角色对话/旁白`,
    documentation: markdown(
      `\`\`\`
say:你好，世界！ -speaker=WebGAL;
say:这是一句旁白 -clear;
say:<text>;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'changeBg',
    insertText: makeInsertText('changeBg'),
    detail: `更新背景图片`,
    documentation: markdown(
      `\`\`\`
changeBg:testBG03.jpg -next;
changeBg:<fileName> [-next];
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'changeFigure',
    insertText: makeInsertText('changeFigure'),
    detail: `更新立绘`,
    documentation: markdown(
      `\`\`\`
changeFigure:testFigure03.png -left -next;
changeFigure:<fileName> [-left] [-right] [id=figureId] [-next];
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'bgm',
    insertText: makeInsertText('bgm'),
    detail: `背景音乐（BGM）`,
    documentation: markdown(
      `\`\`\`
bgm:夏影.mp3;
bgm:<fileName>;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'playVideo',
    insertText: makeInsertText('playVideo'),
    detail: `播放视频`,
    documentation: markdown(
      `\`\`\`
playVideo:OP.mp4;
playVideo:<fileName>;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'pixiPerform',
    insertText: makeInsertText('pixiPerform'),
    detail: `应用 Pixi 特效`,
    documentation: markdown(
      `注意：特效作用后，如果没有初始化，特效会一直运行。
\`\`\`
pixiPerform:<performName>;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'pixiInit',
    insertText: 'pixiInit;',
    detail: `初始化 Pixi 特效`,
    documentation: markdown(
      `1.如果你要使用特效，那么你必须先运行这个命令来初始化 Pixi。
2.如果你想要消除已经作用的效果，你可以使用这个语法来清空效果。
\`\`\`
pixiInit;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'intro',
    insertText: makeInsertText('intro'),
    detail: `黑屏独白`,
    documentation: markdown(
      `在许多游戏中，会以黑屏显示一些文字，用来引入主题或表现人物的心理活动。你可以使用 intro 命令来演出独白。
独白的分拆以分隔符(|)来分割，也就是说，每一个 | 代表一个换行。
\`\`\`
intro:回忆不需要适合的剧本，|反正一说出口，|都成了戏言。;
intro:<text> [|<text of line 2>] ...;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'miniAvatar',
    insertText: makeInsertText('miniAvatar'),
    detail: `放置小头像`,
    documentation: markdown(
      `很多游戏可以在文本框的左下角放置小头像，以下是在本引擎中使用的语法
\`\`\`
miniAvatar:minipic_test.png;显示
miniAvatar:none;关闭
miniAvatar:<fileName>;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'changeScene',
    insertText: makeInsertText('changeScene'),
    detail: `场景跳转`,
    documentation: markdown(
      `你可以将你的剧本拆分成多个 txt 文档，并使用一个简单的语句来切换当前运行的剧本。
\`\`\`
changeScene:Chapter-2.txt;
changeScene:<newSceneFileName>;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'choose',
    insertText: 'choose: | ;',
    detail: `分支选择`,
    documentation: markdown(
      `如果你的剧本存在分支选项，你希望通过选择不同的选项进入不同的章节，请使用以下语句。
其中，|是分隔符。
\`\`\`
choose:叫住她:Chapter-2.txt|回家:Chapter-3.txt;
choose:<chooseText:newSceneName> [|<chooseText:newSceneName>] ...;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'end',
    insertText: 'end;',
    detail: `结束游戏并返回到标题`,
    documentation: markdown(
      `结束游戏并返回到标题
\`\`\`
end;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'setComplexAnimation',
    insertText: makeInsertText('setComplexAnimation'),
    detail: `设置复杂动画`,
    documentation: markdown(
      `为已有的立绘或背景设置复杂动画效果
\`\`\`
setComplexAnimation:universalSoftIn -target=fig-center;
setComplexAnimation:<animationName> -target=<targetId>;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'label',
    insertText: makeInsertText('label'),
    detail: `设置标签`,
    documentation: markdown(
      `设置标签后，配合 \`jumpLabel\` 或 \`choose\` 可实现语句跳转
\`\`\`
......
jumpLabel:label_1; // 跳转到 label_1
......
......
label:label_1; // 创建名为 label_1 的 label
......
......
choose:分支 1:part_1|分支 2:part_2;
label:part_1; // 创建名为 part_1 的 label
......
......
label:part_2; // 创建名为 part_2 的 label
......
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'jumpLabel',
    insertText: makeInsertText('jumpLabel'),
    detail: `设置标签`,
    documentation: markdown(
      `设置标签后，配合 \`jumpLabel\` 或 \`choose\` 可实现语句跳转
\`\`\`
......
jumpLabel:label_1; // 跳转到 label_1
......
......
label:label_1; // 创建名为 label_1 的 label
......
......
choose:分支 1:part_1|分支 2:part_2;
label:part_1; // 创建名为 part_1 的 label
......
......
label:part_2; // 创建名为 part_2 的 label
......
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'setVar',
    insertText: makeInsertText('setVar'),
    detail: `设置变量`,
    documentation: markdown(
      `\`\`\`
setVar:a=1;可以设置数字
setVar:a=true;可以设置布尔值
setVar:a=人物名称;可以设置字符串
setVar:<expression>;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'callScene',
    insertText: makeInsertText('callScene'),
    detail: `场景调用`,
    documentation: markdown(
      `如果你需要在执行完调用的场景后回到先前的场景（即父场景），你可以使用 callScene 来调用场景
\`\`\`
callScene:Chapter-2.txt;
callScene:<newSceneFileName>;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'showVars',
    insertText: makeInsertText('showVars'),
    detail: `显示当前变量`,
    documentation: markdown(
      `调试时使用，显示当前所有变量及其数值
\`\`\`
showVars;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'unlockCg',
    insertText: makeInsertText('unlockCg'),
    detail: `解锁 CG 鉴赏`,
    documentation: markdown(
      `\`\`\`
unlockCg:xgmain.jpeg -name=星光咖啡馆与死神之蝶 -series=1;
unlockCg:<fileName> -name=cgName -series=serisId;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'unlockBgm',
    insertText: makeInsertText('unlockBgm'),
    detail: `解锁 BGM 鉴赏`,
    documentation: markdown(
      `\`\`\`
unlockBgm:s_Title.mp3 -name=Smiling-Swinging!!;
unlockBgm:<fileName> -name=bgmName;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'filmMode',
    insertText: makeInsertText('filmMode'),
    detail: `电影模式`,
    documentation: markdown(
      `使用 \`filmMode:enable;\` 来开启电影模式。
使用 \`filmMode:none;\` 来关闭电影模式。`,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'setTextbox',
    insertText: makeInsertText('setTextbox'),
    detail: `设置文本框开启/关闭`,
    documentation: markdown(
      `\`\`\`
setTextbox:hide;关闭文本框
setTextbox:on;开启文本框，可以是除 hide 以外的任意值。
setTextbox:[hide] [others];
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'setAnimation',
    insertText: makeInsertText('setAnimation'),
    detail: `设置动画`,
    documentation: markdown(
      `\`\`\`
setAnimation:enter-from-bottom -target=fig-center -next;为中间立绘设置一个从下方进入的动画，并转到下一句。
setAnimation:<animationName> -target=targetId;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'playEffect',
    insertText: makeInsertText('playEffect'),
    detail: `效果音`,
    documentation: markdown(
      `\`\`\`
playEffect:xxx.mp3;
playEffect:<fileName>;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'setTempAnimation',
    insertText: makeInsertText('setTempAnimation'),
    detail: `设置多段动画`,
    documentation: markdown(
      `为已有的立绘或背景设置多段动画
\`\`\`
setTempAnimation:[{"duration":0},{"brightness":2,"contrast":0,"duration":200,"ease":"circIn"},{"brightness":1,"contrast":1,"duration":200},{"brightness":2,"contrast":0,"duration":200,"ease":"circIn"},{"brightness":1,"contrast":1,"duration":2500}] -target=fig-center;;
setTempAnimation: -target=<targetId>r;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'setTransform',
    insertText: makeInsertText('setTransform'),
    detail: `设置变换效果`,
    documentation: markdown(
      `为已有的立绘或背景设置变换效果
\`\`\`
setTransform: -target=fig-center -duration=500;
setTransform: -target=<targetId> -duration=number;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'setTransition',
    insertText: makeInsertText('setTransition'),
    detail: `设置进出场效果`,
    documentation: markdown(
      `注意：只有当立绘或背景被设置后，你才能为其设置进出场效果。
设置进出场效果的代码写在立绘或背景的设置代码后。
并且，设置进出场效果的语句必须紧随设置立绘或背景的语句连续执行，否则无法被正确应用。
\`\`\`
setTransition: -target=fig-center -enter=enter-from-bottom -exit=exit;
setTransition: -target=targetId -enter=animationName -exit=animationName;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'getUserInput',
    insertText: makeInsertText('getUserInput'),
    detail: `获取用户输入`,
    documentation: markdown(
      `\`\`\`
getUserInput:name -title=如何称呼你 -buttonText=确认; 将用户输入写入 name 变量中
getUserInput:<varName> -title=titleText -buttonText=buttonText;
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'applyStyle',
    insertText: makeInsertText('applyStyle'),
    detail: `更换 UI 样式`,
    documentation: markdown(
      `\`\`\`
applyStyle:TextBox_ShowName_Background->TextBox_ShowName_Background_Red;
applyStyle:<origStyleName>-><newStyleName>(,<origStyleName2>-><newStyleName2>,...);
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'wait',
    insertText: makeInsertText('wait'),
    detail: `等待一段时间`,
    documentation: markdown(
      `等待一段时间，单位为毫秒
\`\`\`
wait: 5000; 等待5秒钟
\`\`\``,
    ),
  },
  {
    kind: CompletionItemKind.Function,
    label: 'callSteam',
    insertText: makeInsertText('callSteam'),
    detail: `调用 Steam`,
    documentation: markdown(
      `调用 Steam
\`\`\`
callSteam: -achievementId=ACH_WIN_ONE_GAME;
callSteam: -achievementId=achievementId;
\`\`\``,
    ),
  }
];
