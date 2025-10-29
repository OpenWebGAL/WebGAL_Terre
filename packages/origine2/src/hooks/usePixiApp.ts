import { Container, Graphics } from 'pixi.js';
import { useEffect, useRef } from "react";
import { Application } from "pixi.js";
import { eventBus } from '@/utils/eventBus';
import { api } from '@/api';
import axios from 'axios';

const previewWindow = {
  width: 2560,
  height: 1440,
};

// 用于保存当前图形容器的ref
let currentFrame: Container | null = null;
// 用于保存 PIXI App 实例
let appInstance: Application | null = null;
// 用于保存原始指令
let originalCommand: string = '';
// 用于保存当前编辑的上下文
let commandContext: { targetPath: string, lineNumber: number } | null = null;
// 拖拽框的大小（直径）
const dragBoxSize = 100;


export function usePixiApp(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    let app: Application | null = null;
    (async () => {
      if (canvasRef.current) {
        app = new Application();
        await app.init({
          backgroundAlpha: 0,
          canvas: canvasRef.current,
          resizeTo: canvasRef.current.parentElement || window,
        });
        appInstance = app; // 用 appInstance 保存实例
      }
    })();

    // 下面是响应器
    const handleSyncCommand = (params: any) => {
      if (!params?.lineContent?.includes('changeFigure') || !appInstance) return;
      removeCurrentFrame(appInstance);
      originalCommand = params?.lineContent || ''; // 保存原始指令
      commandContext = {
        targetPath: params?.targetPath, // 完整路径,用于文件读写
        lineNumber: params?.lineNumber
      };
      const { direction, transformObj } = parseFigureCommand(originalCommand);
      const mergedTransform = getFigureTransform(direction, transformObj, previewWindow);
      currentFrame = createFigureContainer(appInstance, mergedTransform);
    };
    eventBus.on('pixi-sync-command', handleSyncCommand);

    return () => {
      app?.destroy(true, { children: true });
      // appRef.current = null;
      appInstance = null; // 清理实例
      eventBus.off('pixi-sync-command', handleSyncCommand);
    };
  }, [canvasRef]);

  return appInstance;
}

// 删除当前图形容器
function removeCurrentFrame(app: Application) {
  if (currentFrame && app && app.stage) {
    app.stage.removeChild(currentFrame);
    currentFrame.destroy({ children: true });
    currentFrame = null;
  }
}

/**
 * 计算最终的图形变换参数（相对画布的比例和变换信息）
 * @param direction - 方向（'left' | 'center' | 'right'），决定横向位置
 * @param transformObj - 解析自命令的 transform 对象，可能包含 position/rotation/scale
 * @param previewWindow - 预览窗口的基准宽高（用于将 position.y 换算为比例）
 * @returns { percentX, percentY, rotation, scale }
 *   percentX/percentY：相对画布的比例（0~1），最终像素 = 比例 × app.screen.width/height
 *   rotation：弧度（radian），0为不旋转
 *   scale：缩放倍数对象，1为原始大小
 */
function getFigureTransform(direction: 'left' | 'center' | 'right', transformObj: any, previewWindow: { width: number, height: number }) {
  // 横向百分比
  const directionMap = {
    left: 0.15,
    center: 0.5,
    right: 0.85
  };
  let percentX = directionMap[direction] ?? 0.45;
  // 纵向百分比，默认居中
  let percentY = 0.5;
  let rotation = 0;
  let scale = { x: 1, y: 1 };
  // 如果 transformObj 里有 position/rotation/scale
  if (transformObj.position && typeof transformObj.position.x === 'number') {
    percentX += transformObj.position.x / previewWindow.width;
  }
  if (transformObj.position && typeof transformObj.position.y === 'number') {
    percentY += transformObj.position.y / previewWindow.height;
  }
  if (typeof transformObj.rotation === 'number') {
    rotation = transformObj.rotation;
  }
  if (transformObj.scale && typeof transformObj.scale.x === 'number' && typeof transformObj.scale.y === 'number') {
    scale = { x: transformObj.scale.x, y: transformObj.scale.y };
  }
  return { percentX, percentY, rotation, scale };
}

/**
 * @param app Pixi Application 实例
 * @param transformObj { percentX, percentY, rotation, scale }
 * @returns PIXI.Container
 * 创建图形容器并添加到舞台
 */
function createFigureContainer(app: Application, transformObj: { percentX: number, percentY: number, rotation: number, scale: { x: number, y: number } }) {
  const x = app.screen.width * transformObj.percentX;
  const y = app.screen.height * transformObj.percentY;
  const container = new Container();
  container.x = x;
  container.y = y;
  container.rotation = transformObj.rotation;
  container.scale.set(transformObj.scale.x, transformObj.scale.y);

  const circle = createZoomListener(dragBoxSize);
  container.addChild(circle);
  const square = createMoveListener(dragBoxSize);
  container.addChild(square);
  const rotateHandle = createRotateListener(dragBoxSize);
  container.addChild(rotateHandle);
  app.stage.addChild(container);
  return container;
}

// 创建位置更改器需要的矩形，还有监听器
function handlePointerUp(type: 'zoom' | 'move' | 'rotate', obj: any) {
  obj[`is${type}`] = false;
  if (commandContext && appInstance) {
    const newCommand = containerToCommandString();
    syncCommandToFile(newCommand);
  } else {
    console.log('no commandContext, skip sync');
  }
}

function createMoveListener(size = 100, color = 0xff9900, alpha = 0.5, strokeColor = 0x000000, strokeWidth = 2) {
  const square = new Graphics();
  square
    .rect(-size / 2, -size / 2, size, size)
    .fill({ color, alpha })
    .stroke({ width: strokeWidth, color: strokeColor });

  square.scale.set(0.8);
  square.eventMode = 'static'; // 启用事件模式（Pixi v7+ 必须）
  square.cursor = 'pointer';   // 鼠标悬停时显示手型（可选）
  (square as any).ismove = false; // 自定义属性，表示是否正在移动
  square.on('pointerdown', (event) => {
    (square as any).ismove = true;
  });
  square.on('pointermove', (event) => {
    if ((square as any).ismove && square.parent) {
      // event.global contains the pointer's position in canvas coordinates
      const newPosition = event.global;
      square.parent.x = newPosition.x;
      square.parent.y = newPosition.y;
    }
  });
  square.on('pointerup', () => handlePointerUp('move', square));
  square.on('pointerupoutside', () => handlePointerUp('move', square));
  return square;
}

function createZoomListener(size = 100, color = 0x0099ff, alpha = 0.5, strokeColor = 0x000000, strokeWidth = 2) {
  const circle = new Graphics()
    .circle(0, 0, 60) // 半径 60 的圆
    .stroke({ width: 4, color: 0x66ccff }) // 4px 蓝色描边
    .fill({ color: 0x000000, alpha: 0 }); // 透明填充
  circle.scale.set(1.2);
  circle.eventMode = 'static'; // 启用事件模式（Pixi v7+ 必须）
  circle.cursor = 'pointer';   // 鼠标悬停时显示手型（可选）
  (circle as any).iszoom = false; // 自定义属性，表示是否正在缩放
  circle.on('pointerdown', (event) => {
    (circle as any).iszoom = true;
  });
  circle.on('pointermove', (event) => {
    if ((circle as any).iszoom && circle.parent) {
      // event.global contains the pointer's position in canvas coordinates
      const newPosition = event.global;
      const dx = newPosition.x - circle.parent.x;
      const dy = newPosition.y - circle.parent.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const newScale = distance / (size / 2);
      circle.parent.scale.set(newScale);
    }
  });
  circle.on('pointerup', () => handlePointerUp('zoom', circle));
  circle.on('pointerupoutside', () => handlePointerUp('zoom', circle));
  return circle;
}

function createRotateListener(size = 100) {
  const circle = new Graphics()
    .circle(0, 0, size / 4) // 半径 size/2 的圆
    .stroke({ width: 4, color: 0xffcc00 }) // 4px 黄色描边
    .fill({ color: 0x000000, alpha: 0 });
  circle.x = size * 1.2;
  circle.eventMode = 'static'; // 启用事件模式（Pixi v7+ 必须）
  circle.cursor = 'pointer';   // 鼠标悬停时显示手型（可选）
  (circle as any).isrotate = false; // 自定义属性，表示是否正在旋转
  circle.on('pointerdown', (event) => {
    (circle as any).isrotate = true;
  });
  circle.on('pointermove', (event) => {
    if ((circle as any).isrotate && circle.parent) {
      const newPosition = event.global;
      const dx = newPosition.x - circle.parent.x;
      const dy = newPosition.y - circle.parent.y;
      const angle = Math.atan2(dy, dx);
      circle.parent.rotation = angle;
    }
  });
  circle.on('pointerup', () => handlePointerUp('rotate', circle));
  circle.on('pointerupoutside', () => handlePointerUp('rotate', circle));
  return circle;
}

// 解析字符串的函数
function parseFigureCommand(line: string) {
  let direction: 'right' | 'left' | 'center' = 'center';
  if (/-right(\s|$)/.test(line)) direction = 'right';
  else if (/-left(\s|$)/.test(line)) direction = 'left';
  let transformObj = undefined;
  // 更健壮地提取 -transform= 后的 JSON
  const transformIndex = line.indexOf('-transform=');
  if (transformIndex !== -1) {
    // 从 -transform= 后面开始找第一个 {，再找匹配的 }
    const jsonStart = line.indexOf('{', transformIndex);
    if (jsonStart !== -1) {
      let braceCount = 0;
      let jsonEnd = -1;
      for (let i = jsonStart; i < line.length; i++) {
        if (line[i] === '{') braceCount++;
        if (line[i] === '}') braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
      if (jsonEnd !== -1) {
        const jsonStr = line.slice(jsonStart, jsonEnd + 1);
        try {
          transformObj = JSON.parse(jsonStr);
        } catch (e) {
          transformObj = undefined;
        }
      }
    }
  }
  return { direction, transformObj };
}

// 将当前容器状态转换为 transform 命令字符串
function containerToCommandString() {
  if (!currentFrame || !appInstance || !originalCommand) {
    return originalCommand || ''; // 如果缺少必要信息，则返回原样
  }

  // 1. 从原始指令中解析出基础方向
  const { direction } = parseFigureCommand(originalCommand);

  // 2. 计算出方向对应的基础X轴百分比
  const directionMap = {
    left: 0.15,
    center: 0.5,
    right: 0.85
  };
  const basePercentX = directionMap[direction] ?? 0.5;
  const basePercentY = 0.5; // Y轴基准点总是中心

  // 3. 获取当前容器在画布上的实际百分比位置
  const currentPercentX = currentFrame.x / appInstance.screen.width;
  const currentPercentY = currentFrame.y / appInstance.screen.height;

  // 4. 构建 transform 对象，只包含非默认值以保持简洁
  const transformObj: any = {};

  const positionX = Math.round((currentPercentX - basePercentX) * previewWindow.width);
  const positionY = Math.round((currentPercentY - basePercentY) * previewWindow.height);
  if (positionX !== 0 || positionY !== 0) {
    transformObj.position = { x: positionX, y: positionY };
  }

  const rotation = currentFrame.rotation;
  if (rotation !== 0) {
    // 保持弧度制
    transformObj.rotation = rotation;
  }

  const scaleX = currentFrame.scale.x;
  const scaleY = currentFrame.scale.y;
  if (scaleX !== 1 || scaleY !== 1) {
    transformObj.scale = { x: scaleX, y: scaleY };
  }

  // 1. 先用更健壮的正则去掉原始命令中的 -transform={...}（无论有无）
  const commandWithoutTransform = originalCommand.replace(/\s*-transform=\{.*\}/, '').replace(/[\s\r\n;\}]+$/, '');

  // 2. 检查 transformObj 是否有内容（只要有属性就添加）
  if (Object.keys(transformObj).length === 0) {
    return commandWithoutTransform;
  }

  // 3. 生成 transform 字符串并追加
  const transformString = `-transform=${JSON.stringify(transformObj)}`;
  return `${commandWithoutTransform} ${transformString}`;
}

// 将新的命令同步到文件
async function syncCommandToFile(newCommand: string) {
  if (!commandContext) {
    console.warn('No command context available for sync');
    return;
  }

  try {
    // 1. 读取文件内容 - 使用 targetPath (完整路径)
    const response = await axios.get(commandContext.targetPath);
    const fileContent = response.data.toString();
    const lines = fileContent.split('\n');

    // 2. 替换指定行 (lineNumber 是从 1 开始的,所以需要 -1)
    const lineIndex = commandContext.lineNumber - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      lines[lineIndex] = newCommand;
      const newFileContent = lines.join('\n');

      // 3. 保存文件 - 使用 targetPath (完整路径) 传给后端 API
      await api.assetsControllerEditTextFile({
        path: commandContext.targetPath,  // ✅ 使用完整路径
        textFile: newFileContent
      });

      // 通知其他组件文件已更新
      eventBus.emit('drag-update-scene');

      console.log('Command synced successfully:', newCommand);
    } else {
      console.error('Line number out of range:', commandContext.lineNumber, 'Total lines:', lines.length);
    }
  } catch (error) {
    console.error('Failed to sync command to file:', error);
  }
}
