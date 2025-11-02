import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { commandType, markdown } from '../completion/commandArgs';

export function getArgsKey(
  line: string,
  command: commandType,
): CompletionItem[] {
  switch (command) {
    case commandType.say: {
      return [
        whenKey,
        notendKey,
        concatKey,
        fontSizeKey,
        idFigureKey,
        figureIdKey,
        speakerKey,
        vocalKey,
        clearKey,
        leftSayKey,
        rightSayKey,
        centerSayKey,
      ];
    }
    case commandType.changeBg: {
      return [
        whenKey,
        nextKey,
        continueKey,
        durationKey,
        transformKey,
        unlocknameKey,
        seriesKey,
        enterAnimationKey,
        exitAnimationKey,
        easeKey,
      ];
    }
    case commandType.changeFigure: {
      return [
        whenKey,
        nextKey,
        continueKey,
        durationKey,
        idFigureKey,
        leftKey,
        rightKey,
        transformKey,
        zIndexKey,
        motionKey,
        expressionKey,
        boundsKey,
        animationFlagKey,
        eyesOpenKey,
        eyesCloseKey,
        mouthOpenKey,
        mouthHalfOpenKey,
        mouthCloseKey,
        enterAnimationKey,
        exitAnimationKey,
        easeKey,
        blinkKey,
        focusKey,
      ];
    }
    case commandType.bgm: {
      return [whenKey, volumeKey, enterBgmKey, unlocknameKey, seriesKey];
    }
    case commandType.video: {
      return [whenKey, skipOffKey];
    }
    case commandType.pixi: {
      return [whenKey];
    }
    case commandType.pixiInit: {
      return [whenKey];
    }
    case commandType.intro: {
      return [
        whenKey,
        backgroundColorKey,
        backgroundImageKey,
        fontColorKey,
        fontSizeKey,
        animationKey,
        delayTimeKey,
        holdKey,
        userForwardKey,
      ];
    }
    case commandType.miniAvatar: {
      return [whenKey];
    }
    case commandType.changeScene: {
      return [whenKey];
    }
    case commandType.choose: {
      return [whenKey];
    }
    case commandType.end: {
      return [whenKey];
    }
    case commandType.setComplexAnimation: {
      return [whenKey, nextKey, continueKey, targetKey, durationKey];
    }
    case commandType.label: {
      return [whenKey];
    }
    case commandType.jumpLabel: {
      return [whenKey];
    }
    case commandType.setVar: {
      return [whenKey, globalKey];
    }
    case commandType.callScene: {
      return [whenKey];
    }
    case commandType.showVars: {
      return [whenKey];
    }
    case commandType.unlockCg: {
      return [whenKey, nameKey, seriesKey];
    }
    case commandType.unlockBgm: {
      return [whenKey, nameKey, seriesKey];
    }
    case commandType.filmMode: {
      return [whenKey];
    }
    case commandType.setTextbox: {
      return [whenKey];
    }
    case commandType.setAnimation: {
      return [whenKey, nextKey, continueKey, targetKey, writeDefaultKey, keepKey];
    }
    case commandType.playEffect: {
      return [whenKey, volumeKey, idSoundKey];
    }
    case commandType.setTempAnimation: {
      return [whenKey, nextKey, continueKey, targetKey, writeDefaultKey, keepKey];
    }
    case commandType.setTransform: {
      return [
        whenKey,
        nextKey,
        continueKey,
        targetKey,
        easeKey,
        writeDefaultKey,
        keepKey,
        durationKey,
      ];
    }
    case commandType.setTransition: {
      return [whenKey, targetKey, enterAnimationKey, exitAnimationKey];
    }
    case commandType.getUserInput: {
      return [whenKey, titleKey, buttonTextKey, defaultValueKey];
    }
    case commandType.applyStyle: {
      return [whenKey];
    }
    case commandType.wait: {
      return [whenKey];
    }
    default: {
      return [whenKey, nextKey, continueKey];
    }
  }
}

const whenKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'when',
  insertText: 'when=',
  detail: '条件执行',
  documentation: markdown(`
在语句后加上 \`-when=(condition)\` 参数，可以根据条件判断当前语句是否要执行。

例如：

\`\`\`
setVar:a=1;
; // 当 a 大于 1 时跳转到场景 1
changeScene:1.txt -when=a>1;
; // 只有 a 为 1 时才跳转，注意相等运算符是 ==
changeScene:2.txt -when=a==1;
; // 如果 a 小于 1，那么上面的语句不执行，自然就执行这一句了
changeScene:3.txt;

\`\`\`

> \`=\` 是赋值符号，不可用于条件判断，\`==\`是相等运算符。


任何语句都可以加上 \`-when\` 参数来控制是否执行。通过组合 \`-when\` 参数和 \`jumpLabel\` \`callScene\` \`changeScene\`，你可以实现带条件判断的流程控制。
  `),
};

const nextKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'next',
  insertText: 'next',
  detail: '连续执行',
  documentation: markdown(`
你可以在任意语句后加上参数 \`-next\`，这样做可以在执行完本条语句后立刻跳转到下一条语句。这对需要在同一时间内执行多步操作非常有用。

示例：

\`\`\`
changeBg:testBG03.jpg -next; // 会立刻执行下一条语句
\`\`\`
  `),
};

const continueKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'continue',
  insertText: 'continue',
  detail: '继续执行',
  documentation: markdown(`
在某些情况下，你可能希望在执行完当前语句后继续执行下一条语句。这时可以使用 \`-continue\` 参数。
此参数即使在用户未开启自动播放的情况下也会生效。

示例：

\`\`\`
changeBg:testBG03.jpg -continue; // 会在当前语句执行完后继续执行下一条语句
\`\`\`
  `),
};

const durationKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'duration',
  insertText: 'duration=',
  detail: '持续时间',
  documentation: markdown(`
这个时间片的持续时间，单位为毫秒(ms)
  `),
};

const figureIdKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'figureId',
  insertText: 'figureId=',
  detail: '指定立绘ID',
  documentation: markdown(`
为对话指定立绘ID，可同步该立绘的唇形
  `),
};

const fontSizeKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'fontSize',
  insertText: 'fontSize=',
  detail: '字体大小',
  documentation: markdown(`
调整字体大小
  `),
};

const notendKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'notend',
  insertText: 'notend',
  detail: '文字展示完执行下一句',
  documentation: markdown(`
有时候，可能你希望在某一句对话执行到某个阶段时加入演出效果，比如切换表情等。
这时候，你可以使用 \`-notend\` \`-concat\` 参数来实现在对话中插入任意语句。

\`-concat\` 代表本句对话连接在上一句对话之后

\`-notend\` 代表本句对话没有结束，在后面可能连接演出或对话。

示例如下：这是一个在对话进行中切换立绘的演示。

\`\`\`
WebGAL:测试语句插演出！马上切换立绘...... -notend;
changeFigure:k1.png -next;
切换立绘！马上切换表情...... -notend -concat;
changeFigure:k2.png -next;
切换表情！ -concat;
\`\`\`

你也可以只使用 \`-concat\` 参数，将下一句连接在上一句对话之后，因为 \`-notend\` 参数会在对话渐显完成后转到下一句。

\`\`\`
这是第一句......;
用户点击鼠标后才会转到第二句 -concat;
\`\`\`
  `),
};

const concatKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'concat',
  insertText: 'concat',
  detail: '将该对话与上一句连接',
  documentation: markdown(`
有时候，可能你希望在某一句对话执行到某个阶段时加入演出效果，比如切换表情等。
这时候，你可以使用 \`-notend\` \`-concat\` 参数来实现在对话中插入任意语句。

\`-concat\` 代表本句对话连接在上一句对话之后

\`-notend\` 代表本句对话没有结束，在后面可能连接演出或对话。

示例如下：这是一个在对话进行中切换立绘的演示。

\`\`\`
WebGAL:测试语句插演出！马上切换立绘...... -notend;
changeFigure:k1.png -next;
切换立绘！马上切换表情...... -notend -concat;
changeFigure:k2.png -next;
切换表情！ -concat;
\`\`\`

你也可以只使用 \`-concat\` 参数，将下一句连接在上一句对话之后，因为 \`-notend\` 参数会在对话渐显完成后转到下一句。

\`\`\`
这是第一句......;
用户点击鼠标后才会转到第二句 -concat;
\`\`\`
  `),
};

const leftSayKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'left',
  insertText: 'left',
  detail: '对话属于左侧立绘',
  documentation: markdown(`
指定该对话所属的立绘为左侧立绘

\`\`\`
WebGAL:这是左侧立绘的对话 -left;
\`\`\`
  `),
};

const rightSayKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'right',
  insertText: 'right',
  detail: '对话属于右侧立绘',
  documentation: markdown(`
指定该对话所属的立绘为右侧立绘

\`\`\`
WebGAL:这是右侧立绘的对话 -right;
\`\`\`
  `),
};

const centerSayKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'center',
  insertText: 'center',
  detail: '对话属于中间立绘',
  documentation: markdown(`
指定该对话所属的立绘为中间立绘

\`\`\`
WebGAL:这是中间立绘的对话 -center;
\`\`\`
  `),
};

const leftKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'left',
  insertText: 'left',
  detail: '将立绘置于左侧',
  documentation: markdown(`
现在，你可以在页面的三个不同位置放置不同的立绘，只需要在放置立绘的语句处加上你要放置的位置就可以了，示例如下：

\`\`\`
changeFigure:testFigure03.png -left;
changeFigure:testFigure04.png;
changeFigure:testFigure03.png -right;
\`\`\`

以上三行分别对应着左、中、右三个不同的位置。三个不同位置的立绘是相互独立的，所以如果你需要清除立绘，必须分别独立清除：

\`\`\`
changeFigure:none -left;
changeFigure:none;
changeFigure:none -right;
\`\`\`
  `),
};

const rightKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'right',
  insertText: 'right',
  detail: '将立绘置于右侧',
  documentation: markdown(`
现在，你可以在页面的三个不同位置放置不同的立绘，只需要在放置立绘的语句处加上你要放置的位置就可以了，示例如下：

\`\`\`
changeFigure:testFigure03.png -left;
changeFigure:testFigure04.png;
changeFigure:testFigure03.png -right;
\`\`\`

以上三行分别对应着左、中、右三个不同的位置。三个不同位置的立绘是相互独立的，所以如果你需要清除立绘，必须分别独立清除：

\`\`\`
changeFigure:none -left;
changeFigure:none;
changeFigure:none -right;
\`\`\`
  `),
};

const idFigureKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'id',
  insertText: 'id=',
  detail: '设置id',
  documentation: markdown(`
如果你想要更精确地控制立绘，或使用超过 3 个立绘，可以为立绘指定 \`id\` 和初始位置：

\`\`\`
; // 一个初始位置在右侧的自由立绘
changeFigure:testFigure03.png -left -id=test1;
; // 通过 id 关闭立绘
changeFigure:none -id=test1;
\`\`\`

> 如果你要重设某个带ID立绘的位置，请先关闭再重新打开。
  `),
};

const idSoundKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'id',
  insertText: 'id=',
  detail: '设置id',
  documentation: markdown(`
为效果音赋予一个 \`id\` 将会自动启用效果音循环，后续使用相同的 \`id\` 来停止。

\`\`\`
playEffect:xxx.mp3 -id=xxx;
playEffect:none -id=xxx; // 停止这个循环的效果音
\`\`\`
  `),
};

const transformKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'transform',
  insertText: 'transform=',
  detail: '设置变换效果',
  documentation: markdown(`
有关效果的字段说明，请参考 [动画](https://docs.openwebgal.com/webgal-script/animation.html)

你可以在设置立绘或背景的时候就为立绘设置一些变换和滤镜效果，以下是一个示例：

\`\`\`
changeFigure:stand.png -transform={"alpha":1,"position":{"x":0,"y":500},"scale":{"x":1,"y":1},"rotation":0,"blur":0,"brightness":1,"contrast":1,"saturation":1,"gamma":1,"colorRed":255,"colorGreen":255,"colorBlue":255,"oldFilm":0,"dotFilm":0,"reflectionFilm":0,"glitchFilm":0,"rgbFilm":0,"godrayFilm":0} -next;
\`\`\`
  `),
};

const zIndexKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'zIndex',
  insertText: 'zIndex=',
  detail: '图层排序',
  documentation: markdown(`
图层排序索引值，值越大越靠上，值相同时晚加入的靠上

\`\`\`
changeFigure:xxx.png -id=xxx -zIndex=0;
changeFigure:yyy.png -id=yyy -zIndex=1;
\`\`\`
  `),
};

const animationFlagKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'animationFlag',
  insertText: 'animationFlag=',
  detail: '唇形同步与眨眼',
  documentation: markdown(`
当 \`animationFlag\` 设置为 \`on\` 时，可为图片立绘开启唇形同步与眨眼
本质上是多个静态图片切换

\`\`\`
changeFigure:char.png -animationFlag=on -eyesOpen=char_eyes_open.png -eyesClose=char_eyes_close.png -mouthOpen=mouth.png -mouthHalfOpen=char_mouth_half_open.png -mouthClose=char_mouth_close.png; 
\`\`\`
  `),
};

const eyesOpenKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'eyesOpen',
  insertText: 'eyesOpen=',
  detail: '眼睛睁开的图片立绘',
  documentation: markdown(`
当 \`animationFlag\` 设置为 \`on\` 时，可为图片立绘开启唇形同步与眨眼
本质上是多个静态图片切换

\`\`\`
changeFigure:char.png -animationFlag=on -eyesOpen=char_eyes_open.png -eyesClose=char_eyes_close.png -mouthOpen=mouth.png -mouthHalfOpen=char_mouth_half_open.png -mouthClose=char_mouth_close.png; 
\`\`\`
  `),
};

const eyesCloseKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'eyesClose',
  insertText: 'eyesClose=',
  detail: '眼睛闭上的图片立绘',
  documentation: markdown(`
当 \`animationFlag\` 设置为 \`on\` 时，可为图片立绘开启唇形同步与眨眼
本质上是多个静态图片切换

\`\`\`
changeFigure:char.png -animationFlag=on -eyesOpen=char_eyes_open.png -eyesClose=char_eyes_close.png -mouthOpen=mouth.png -mouthHalfOpen=char_mouth_half_open.png -mouthClose=char_mouth_close.png; 
\`\`\`
  `),
};

const mouthOpenKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'mouthOpen',
  insertText: 'mouthOpen=',
  detail: '嘴巴张开的图片立绘',
  documentation: markdown(`
当 \`animationFlag\` 设置为 \`on\` 时，可为图片立绘开启唇形同步与眨眼
本质上是多个静态图片切换

\`\`\`
changeFigure:char.png -animationFlag=on -eyesOpen=char_eyes_open.png -eyesClose=char_eyes_close.png -mouthOpen=mouth.png -mouthHalfOpen=char_mouth_half_open.png -mouthClose=char_mouth_close.png; 
\`\`\`
  `),
};

const mouthHalfOpenKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'mouthHalfOpen',
  insertText: 'mouthHalfOpen=',
  detail: '嘴巴半张开的图片立绘',
  documentation: markdown(`
当 \`animationFlag\` 设置为 \`on\` 时，可为图片立绘开启唇形同步与眨眼
本质上是多个静态图片切换

\`\`\`
changeFigure:char.png -animationFlag=on -eyesOpen=char_eyes_open.png -eyesClose=char_eyes_close.png -mouthOpen=mouth.png -mouthHalfOpen=char_mouth_half_open.png -mouthClose=char_mouth_close.png; 
\`\`\`
  `),
};

const mouthCloseKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'mouthClose',
  insertText: 'mouthClose=',
  detail: '嘴巴闭上的图片立绘',
  documentation: markdown(`
当 \`animationFlag\` 设置为 \`on\` 时，可为图片立绘开启唇形同步与眨眼
本质上是多个静态图片切换

\`\`\`
changeFigure:char.png -animationFlag=on -eyesOpen=char_eyes_open.png -eyesClose=char_eyes_close.png -mouthOpen=mouth.png -mouthHalfOpen=char_mouth_half_open.png -mouthClose=char_mouth_close.png; 
\`\`\`
  `),
};

const motionKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'motion',
  insertText: 'motion=',
  detail: 'live2D的动作',
  documentation: markdown(`
你可以使用 \`-motion=motionName\` 或 \`-expression=expressionName\` 参数来切换表情，如：

\`\`\`
changeFigure:xxx.json -motion=angry -expression=angry01;
\`\`\`
  `),
};

const expressionKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'expression',
  insertText: 'expression=',
  detail: 'live2D的表情',
  documentation: markdown(`
你可以使用 \`-motion=motionName\` 或 \`-expression=expressionName\` 参数来切换表情，如：

\`\`\`
changeFigure:xxx.json -motion=angry -expression=angry01;
\`\`\`
  `),
};

const boundsKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'bounds',
  insertText: 'bounds=',
  detail: 'live2D的边界',
  documentation: markdown(`
当live2D默认显示范围不足时，调整此参数以拓展边界

\`\`\`
changeFigure:xxx.json -bounds=0,50,0,50;
\`\`\`
  `),
};

const blinkKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'blink',
  insertText: 'blink=',
  detail: 'Live2D 立绘眨眼',
  documentation: markdown(`
设置 Live2D 立绘眨眼的参数, 参数有
- blinkInterval: 眨眼间隔时间, 单位毫秒, 默认24小时
- blinkIntervalRandom: 眨眼间隔时间随机范围, 单位毫秒, 默认1000
- closingDuration: 眨眼闭合时间, 单位毫秒, 默认100
- closedDuration: 眨眼闭合保持时间, 单位毫秒, 默认50
- openingDuration: 眨眼睁开时间, 单位毫秒, 默认150

\`\`\`
changeFigure:xxx.json -blink={"blinkInterval":5000,"blinkIntervalRandom":2000,"closingDuration":100,"closedDuration":50,"openingDuration":150};
\`\`\`
  `),
};

const focusKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'focus',
  insertText: 'focus=',
  detail: 'Live2D 立绘注视',
  documentation: markdown(`
设置 Live2D 立绘的注视方向, 参数有
- x: 注视点 X 坐标, 范围 -1.0 ~ 1.0, 默认 0.0
- y: 注视点 Y 坐标, 范围 -1.0 ~ 1.0, 默认 0.0
- instant: 是否立即生效, 布尔值, 默认 false

\`\`\`
changeFigure:xxx.json -focus={"x":0.5,"y":0.0,"instant":false};
\`\`\`
  `),
};

const unlocknameKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'unlockname',
  insertText: 'unlockname=',
  detail: '解锁名称',
  documentation: markdown(`
CG或音乐解锁进鉴赏模式的命名
  `),
};

const seriesKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'series',
  insertText: 'series=',
  detail: '鉴赏系列名称',
  documentation: markdown(`
CG或音乐解锁进鉴赏模式后应当放在哪个系列
  `),
};

const targetKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'target',
  insertText: 'target=',
  detail: '指定目标',
  documentation: markdown(`
将动画或效果应用于指定目标
  `),
};

const easeKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'ease',
  insertText: 'ease=',
  detail: '缓动类型',
  documentation: markdown(`
为动画设置缓动类型
可用的缓动类型有
- linear
- anticipate
- easeIn
- easeOut
- easeInOut (默认值)
- circIn
- circOut
- circInOut
- backIn
- backOut
- backInOut
- bounceIn
- bounceOut
- bounceInOut
  `),
};

const writeDefaultKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'writeDefault',
  insertText: 'writeDefault',
  detail: '补充默认值',
  documentation: markdown(`
若变换与效果中有未填写的属性时, 补充默认值, 否则继承现有的值
  `),
};

const keepKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'keep',
  insertText: 'keep',
  detail: '跨语句动画',
  documentation: markdown(`
开启后, 动画可以跨对话播放, 直至被下一个同目标的
\`setTransform\` \`setAnimation\` \`setTempAnimation\` 打断
  `),
};

const globalKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'global',
  insertText: 'global',
  detail: '全局变量',
  documentation: markdown(`
WebGAL 的普通变量是跟随存档的，也就是说，任何变量只存在于当前的游戏场景中，只有存档才能将其保存下来，读档将其恢复。

为了解决可能存在的作者希望设置多周目的问题，提供长效（全局）变量，一旦设置，则在整个游戏中生效，除非用户清除全部数据。

加上 \`-global\` 参数可以设置长效（全局）变量

\`\`\`ws
setVar:a=1 -global;
\`\`\`

这样就设置了一个不随存档读取而改变的变量。

使用例：

\`\`\`ws
jumpLabel:turn-2 -when=a>0;
setVar:a=1 -global;
一周目;
changeScene:一周目剧情.txt;
label:turn-2;
二周目;
changeScene:二周目剧情.txt;
\`\`\`
  `),
};

const nameKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'name',
  insertText: 'name=',
  detail: '名称',
  documentation: markdown(`
指定名称
  `),
};

const backgroundColorKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'backgroundColor',
  insertText: 'backgroundColor=',
  detail: '背景颜色',
  documentation: markdown(`
指定背景颜色
  `),
};

const backgroundImageKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'backgroundImage',
  insertText: 'backgroundImage=',
  detail: '背景图片',
  documentation: markdown(`
指定背景图片
  `),
};

const fontColorKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'fontColor',
  insertText: 'fontColor=',
  detail: '字体颜色',
  documentation: markdown(`
指定字体颜色
  `),
};

const animationKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'animation',
  insertText: 'animation=',
  detail: '动画',
  documentation: markdown(`
指定动画
  `),
};

const holdKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'hold',
  insertText: 'hold',
  detail: '文字显示完不自动播放',
  documentation: markdown(`
在手动播放模式下，文字显示完不自动播放下一句
> 注：此参数对自动播放模式无效
  `),
};

const userForwardKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'userForward',
  insertText: 'userForward',
  detail: '手动播放一行一行文字',
  documentation: markdown(`
手动播放一行一行文字
  `),
};

const delayTimeKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'delayTime',
  insertText: 'delayTime=',
  detail: '延迟时长',
  documentation: markdown(`
延迟时长
  `),
};

const volumeKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'volume',
  insertText: 'volume=',
  detail: '音量大小',
  documentation: markdown(`
设置音量大小
  `),
};

const enterBgmKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'enter',
  insertText: 'enter=',
  detail: '音量淡入时长',
  documentation: markdown(`
音量淡入时间
  `),
};

const enterAnimationKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'enter',
  insertText: 'enter=',
  detail: '入场动画',
  documentation: markdown(`
设置入场动画
  `),
};

const exitAnimationKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'exit',
  insertText: 'exit=',
  detail: '退场动画',
  documentation: markdown(`
设置退场动画
  `),
};

const skipOffKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'skipOff',
  insertText: 'skipOff',
  detail: '禁止跳过',
  documentation: markdown(`
禁止跳过
  `),
};

const titleKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'title',
  insertText: 'title=',
  detail: '对话框标题',
  documentation: markdown(`
对话框标题
  `),
};

const buttonTextKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'buttonText',
  insertText: 'buttonText=',
  detail: '确认按钮文本',
  documentation: markdown(`
确认按钮文本
  `),
};

const defaultValueKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'defaultValue',
  insertText: 'defaultValue',
  detail: '默认值',
  documentation: markdown(`
默认值
  `),
};

const vocalKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'vocal',
  insertText: 'vocal=',
  detail: '播放语音文件',
  documentation: markdown(`
播放语言文件
  `),
};

const speakerKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'speaker',
  insertText: 'speaker=',
  detail: '说话者',
  documentation: markdown(`
说话者
  `),
};

const clearKey: CompletionItem = {
  kind: CompletionItemKind.Constant,
  label: 'clear',
  insertText: 'clear',
  detail: '清除说话者',
  documentation: markdown(`
清除说话者
  `),
};
