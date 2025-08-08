/* eslint-disable max-params */
import { api } from '@/api';
import { Button, Card, Carousel, CarouselCard, CarouselSlider, CarouselViewport, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Dropdown, Option, Spinner } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import styles from './iconCreator.module.scss';
import axios from 'axios';
import { ColorPickerPopup } from '../ColorPickerPopup/ColorPickerPopup';
import img2ico from 'img2ico';
import Transformer from '../Transformer/Transformer';

type IIconShape = 'circle' | 'square' | 'rounded-rectangle';
type IBackgroundStyle = 'color' | 'image';
interface Icon {
  name: string;
  src: string;
}
interface IIcons {
  ico: Icon,
  web: Icon,
  webMaskable: Icon,
  desktop: Icon,
  androidForeground: Icon,
  androidBackground: Icon,
  androidFullBleed: Icon,
  androidLegacy: Icon,
  androidRound: Icon,
}

const IconCreator = ({ gameDir, triggerButton }: { gameDir: string, triggerButton: ReactElement }) => {

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);

  const [foregroundImage, setForegroundImage] = useState<HTMLImageElement | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  const [foregroundOffset, setForegroundOffset] = useState({ x: 0, y: 0 });
  const [backgroundOffset, setBackgroundOffset] = useState({ x: 0, y: 0 });

  const [foregroundScale, setForegroundScale] = useState(1);
  const [backgroundScale, setBackgroundScale] = useState(1);

  const [iconShape, setIconShape] = useState<IIconShape>('square');
  const [backgroundStyle, setBackgroundStyle] = useState<IBackgroundStyle>('color');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF00');
  const [gridLineColor, setGridLineColor] = useState<'#FFFFFFAA' | '#000000AA'>('#000000AA');
  const [icons, setIcons] = useState<IIcons | null>(null);

  const [generatedFiles, setGeneratedFiles] = useState<Record<string, { blob: Blob, name: string }> | null>(null);

  const canvasSize = 1536;

  /**
 * 定义各级图标在裁剪时，单边裁切的内边距（inset）百分比。
 *
 * ### 裁剪步骤
 *
 * 1.  **定义核心安全区域 (Safe Zone)**
 * 首先，从 1536px 的原始画布的每一边裁掉由 `main` 属性定义的百分比（例如 1/6）。
 * 这会形成一个中心的安全区域，其宽度为原始画布的 2/3。所有重要的、必须可见的
 * 图标内容都应完全放置在这个安全区域内。
 *
 * 2.  **从安全区域到最终图标**
 * 接着，在第一步产生的安全区域的基础上，为不同平台（Web, Electron, Android）
 * 生成最终图标时，再从每一边额外裁掉相应属性（如 `web`, `electron`, `android.legacy`）
 * 定义的距离百分比。这确保了图标在不同平台的特定形状遮罩下依然有最佳的视觉表现。
 *
 * @property {number} main - **第一步裁剪**: 定义核心安全区域的内边距百分比。
 * @property {number} web - **第二步裁剪**: 为生成 Web 图标，在安全区域基础上额外裁切的内边距。
 * @property {number} electron - **第二步裁剪**: 为生成 Electron 桌面应用图标，在安全区域基础上额外裁切的内边距。
 * @property {object} android - **第二步裁剪**: 针对 Android 不同图标类型的额外裁切配置。
 * @property {number} android.legacy - 用于生成旧版 Android (API < 26) 传统图标的额外内边距。
 * @property {number} android.round - 用于生成圆形 Android 图标（例如在 Pixel 设备上）的额外内边距。
 */
  const clipInset = {
    main: 1 / 6,
    web: 0.0636,
    electron: 0.0636,
    android: {
      legacy: 0.1042,
      round: 0.0365,
    }
  };

  const getRoundedRectangleRadius = () => gridCanvasRef.current !== null 
    ? 34 * (canvasSize * (1 - clipInset.main * 2) / gridCanvasRef.current.clientWidth)
    : null;

  const drawGrid = useCallback(async () => {
    if (gridCanvasRef.current) {
      const ctx = gridCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.shadowColor = gridLineColor === '#000000AA' ? '#FFFFFF' : '#000000';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        let clippedSize = canvasSize * (1 - clipInset.main * 2) * (1 - clipInset.web * 2);
        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;

        ctx.strokeStyle = gridLineColor;
        ctx.lineWidth = 8;

        const radius = getRoundedRectangleRadius();
        if (radius === null) {
          console.error("无法获取圆角大小！");
          return;
        }

        // web and electron 图标网格
        ctx.beginPath();
        if (iconShape === 'square') {
          ctx.rect(centerX - clippedSize / 2, centerY - clippedSize / 2, clippedSize, clippedSize);
        } else if (iconShape === 'circle') {
          ctx.arc(centerX, centerY, clippedSize / 2, 0, Math.PI * 2);
        } else if (iconShape === 'rounded-rectangle') {
          
          const startX = (canvasSize - clippedSize) / 2;
          const startY = (canvasSize - clippedSize) / 2;
          ctx.moveTo(startX + radius, startY);
          ctx.lineTo(startX + clippedSize - radius, startY);
          ctx.arcTo(startX + clippedSize, startY, startX + clippedSize, startY + radius, radius);
          ctx.lineTo(startX + clippedSize, startY + clippedSize - radius);
          ctx.arcTo(startX + clippedSize, startY + clippedSize, startX + clippedSize - radius, startY + clippedSize, radius);
          ctx.lineTo(startX + radius, startY + clippedSize);
          ctx.arcTo(startX, startY + clippedSize, startX, startY + clippedSize - radius, radius);
          ctx.lineTo(startX, startY + radius);
          ctx.arcTo(startX, startY, startX + radius, startY, radius);
        }
        ctx.closePath();
        ctx.stroke();

        // web maskable 图标网格
        clippedSize = canvasSize * (1 - clipInset.main * 2);
        ctx.beginPath();
        ctx.rect(centerX - clippedSize / 2, centerY - clippedSize / 2, clippedSize, clippedSize);
        ctx.closePath();
        ctx.stroke();

        // android legacy 图标网格
        clippedSize = canvasSize * (1 - clipInset.main * 2) * (1 - clipInset.android.legacy * 2);
        const startX = (canvasSize - clippedSize) / 2;
        const startY = (canvasSize - clippedSize) / 2;
        ctx.beginPath();
        ctx.moveTo(startX + radius, startY);
        ctx.lineTo(startX + clippedSize - radius, startY);
        ctx.arcTo(startX + clippedSize, startY, startX + clippedSize, startY + radius, radius);
        ctx.lineTo(startX + clippedSize, startY + clippedSize - radius);
        ctx.arcTo(startX + clippedSize, startY + clippedSize, startX + clippedSize - radius, startY + clippedSize, radius);
        ctx.lineTo(startX + radius, startY + clippedSize);
        ctx.arcTo(startX, startY + clippedSize, startX, startY + clippedSize - radius, radius);
        ctx.lineTo(startX, startY + radius);
        ctx.arcTo(startX, startY, startX + radius, startY, radius);
        ctx.closePath();
        ctx.stroke();

        // android round 图标网格
        clippedSize = canvasSize * (1 - clipInset.main * 2) * (1 - clipInset.android.round * 2);
        ctx.beginPath();
        ctx.arc(centerX, centerY, clippedSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }, [iconShape, gridLineColor]);

  const drawForeground = useCallback(async () => {
    if (foregroundImage && foregroundCanvasRef.current) {
      const ctx = foregroundCanvasRef.current.getContext('2d');
      if (ctx) {
        const imageAspectRatio = foregroundImage.width / foregroundImage.height;
        const drawWidth = (imageAspectRatio > 1 ? canvasSize : canvasSize * imageAspectRatio) * foregroundScale;
        const drawHeight = (imageAspectRatio > 1 ? canvasSize / imageAspectRatio : canvasSize) * foregroundScale;
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          foregroundImage,
          (canvasSize - drawWidth) / 2 + foregroundOffset.x * foregroundScale,
          (canvasSize - drawHeight) / 2 + foregroundOffset.y * foregroundScale,
          drawWidth,
          drawHeight,
        );
      }
    }
  }, [foregroundImage, foregroundOffset, foregroundScale, iconShape]);

  const drawBackground = useCallback(async () => {
    if (backgroundCanvasRef.current) {
      const ctx = backgroundCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        if (backgroundStyle === 'color') {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvasSize, canvasSize);
        } else if (backgroundStyle === 'image') {
          // ctx.fillStyle = '#FFFFFF';
          // ctx.fillRect(0, 0, canvasSize, canvasSize);
          if (backgroundImage) {
            const imageAspectRatio = backgroundImage.width / backgroundImage.height;
            const drawWidth = (imageAspectRatio > 1 ? canvasSize : canvasSize * imageAspectRatio) * backgroundScale;
            const drawHeight = (imageAspectRatio > 1 ? canvasSize / imageAspectRatio : canvasSize) * backgroundScale;
            ctx.drawImage(
              backgroundImage,
              (canvasSize - drawWidth) / 2 + backgroundOffset.x * backgroundScale,
              (canvasSize - drawHeight) / 2 + backgroundOffset.y * backgroundScale,
              drawWidth,
              drawHeight,
            );
          }
        }
      }
    }
  }, [backgroundStyle, backgroundColor, backgroundImage, backgroundOffset, backgroundScale]);

  const getCombinedBrightness = async (canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement) => {
    const width = Math.max(canvas1.width, canvas2.width);
    const height = Math.max(canvas1.height, canvas2.height);

    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = width;
    combinedCanvas.height = height;
    const ctx = combinedCanvas.getContext('2d');

    if (!ctx) {
      return 255;
    }

    ctx.drawImage(canvas1, 0, 0);
    ctx.drawImage(canvas2, 0, 0);

    const imageData = ctx.getImageData(0, 0, combinedCanvas.width, combinedCanvas.height);
    const data = imageData.data;

    let totalBrightness = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) {
        totalBrightness += 0.299 * 255 + 0.587 * 255 + 0.114 * 255;
      } else {
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        totalBrightness += brightness;
      }
    }

    const averageBrightness = totalBrightness / pixelCount;
    return averageBrightness;
  };

  const updateGridLineColor = async () => {
    if (!backgroundCanvasRef.current || !foregroundCanvasRef.current) return;
    const brightness = await getCombinedBrightness(backgroundCanvasRef.current, foregroundCanvasRef.current);
    if (brightness > 128) {
      setGridLineColor('#000000AA');
    } else {
      setGridLineColor('#FFFFFFAA');
    }
  };

  useEffect(() => {
    if (isOpen) {
      drawBackground();
      drawGrid();
    }
  }, [isOpen]);

  useEffect(() => {
    drawGrid();
  }, [iconShape, gridLineColor]);

  useEffect(() => {
    const timeoutId = setTimeout(updateGridLineColor, 1000);
    drawForeground();
    return () => clearTimeout(timeoutId);
  }, [foregroundImage, foregroundOffset, foregroundScale]);

  useEffect(() => {
    const timeoutId = setTimeout(updateGridLineColor, 1000);
    drawBackground();
    return () => clearTimeout(timeoutId);
  }, [backgroundStyle, backgroundColor, backgroundImage, backgroundOffset, backgroundScale]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (activeIndex === 1) {
      const ANIMATION_DURATION = 750; 

      timeoutId = setTimeout(() => {
        generateAllIcons().then(() => {
          if (!isMounted) {
            setIcons(null);
            setGeneratedFiles(null);
          }
        });
      }, ANIMATION_DURATION);
    }

    return () => {
      isMounted = false; 

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setIcons(null);
      setGeneratedFiles(null);
    };
  }, [activeIndex]);

  const selectImage = (file: File, layer: 'foreground' | 'background') => {
    if (layer === 'foreground') {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setForegroundImage(img);
        setForegroundScale(1);
        setForegroundOffset({ x: 0, y: 0 });
      };
    } else if (layer === 'background') {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setBackgroundImage(img);
        setBackgroundScale(1);
        setBackgroundOffset({ x: 0, y: 0 });
      };
    }
  };

  /**
 * 将源 Canvas 的一部分裁剪到一个新的 Canvas 中。
 *
 * @param sourceCanvas 要从中裁剪的源 Canvas。
 * @param inset 裁剪内边距百分比 (0-1)。
 * @param shape 期望的输出形状。
 * @param radius - (可选) 如果形状是圆角矩形，需要提供计算好的圆角半径。
 * @param preservePadding - (可选) 如果为 true，则返回的画布尺寸与 sourceCanvas 相同，
 * 并将裁剪后的内容居中放置，从而保留周围的空白边距。
 * 默认为 false，返回紧凑的、无边距的画布。
 * @returns 一个包含平滑裁剪后图像的新 HTMLCanvasElement。
 */
  const clipToCanvas = (
    sourceCanvas: HTMLCanvasElement,
    inset: number,
    shape: IIconShape,
    radius?: number,
    preservePadding = false,
  ): HTMLCanvasElement => {

    const insetWidth = sourceCanvas.width * inset;
    const insetHeight = sourceCanvas.height * inset;
    const clippedWidth = sourceCanvas.width - insetWidth * 2;
    const clippedHeight = sourceCanvas.height - insetHeight * 2;

    const croppedIconCanvas = document.createElement('canvas');
    croppedIconCanvas.width = clippedWidth;
    croppedIconCanvas.height = clippedHeight;
    const ctx = croppedIconCanvas.getContext('2d')!;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#000';
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(clippedWidth / 2, clippedHeight / 2, Math.min(clippedWidth, clippedHeight) / 2, 0, Math.PI * 2);
    } else if (shape === 'rounded-rectangle' && radius) {
      ctx.moveTo(radius, 0);
      ctx.lineTo(clippedWidth - radius, 0);
      ctx.arcTo(clippedWidth, 0, clippedWidth, radius, radius);
      ctx.lineTo(clippedWidth, clippedHeight - radius);
      ctx.arcTo(clippedWidth, clippedHeight, clippedWidth - radius, clippedHeight, radius);
      ctx.lineTo(radius, clippedHeight);
      ctx.arcTo(0, clippedHeight, 0, clippedHeight - radius, radius);
      ctx.lineTo(0, radius);
      ctx.arcTo(0, 0, radius, 0, radius);
      ctx.closePath();
    } else {
      ctx.rect(0, 0, clippedWidth, clippedHeight);
    }
    ctx.fill();

    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(sourceCanvas, -insetWidth, -insetHeight, sourceCanvas.width, sourceCanvas.height);
    ctx.globalCompositeOperation = 'source-over';

    if (!preservePadding) {
      return croppedIconCanvas;
    } else {
      const paddedCanvas = document.createElement('canvas');
      paddedCanvas.width = sourceCanvas.width;
      paddedCanvas.height = sourceCanvas.height;
      const paddedCtx = paddedCanvas.getContext('2d')!;
      paddedCtx.imageSmoothingEnabled = true;
      paddedCtx.imageSmoothingQuality = 'high';

      paddedCtx.drawImage(croppedIconCanvas, insetWidth, insetHeight);

      return paddedCanvas;
    }
  };

  /**
 * 将源 Canvas 调整为指定尺寸和格式的新图像。
 * @returns 一个 Promise，它解析为调整大小后图像的 Blob 对象。
 */
  const resizeCanvasToBlob = (
    sourceCanvas: HTMLCanvasElement,
    size: number,
    format: 'png' | 'webp' = 'png',
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(sourceCanvas, 0, 0, size, size);

      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('从 Canvas 创建 Blob 失败。'));
        }
      }, `image/${format}`);
    });
  };

  const generateAllIcons = async () => {
    if (!foregroundCanvasRef.current || !backgroundCanvasRef.current) return;

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = canvasSize;
    compositeCanvas.height = canvasSize;
    const ctx = compositeCanvas.getContext('2d')!;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(backgroundCanvasRef.current, 0, 0);
    ctx.drawImage(foregroundCanvasRef.current, 0, 0);

    const maskableCanvas = clipToCanvas(compositeCanvas, clipInset.main, 'square');

    const radius = getRoundedRectangleRadius();
    if (radius === null) {
      console.error("无法获取圆角大小！");
      return;
    }

    const webIconCanvas = clipToCanvas(maskableCanvas, clipInset.web, iconShape, radius);
    const androidLegacyCanvas = clipToCanvas(maskableCanvas, clipInset.android.legacy, 'rounded-rectangle', radius, true);
    const androidRoundCanvas = clipToCanvas(maskableCanvas, clipInset.android.round, 'circle', radius, true);

    const androidForegroundCanvas = foregroundCanvasRef.current;
    const androidBackgroundCanvas = backgroundCanvasRef.current;

    const webIconBlob = await resizeCanvasToBlob(webIconCanvas, 256);
    const webIconArrayBuffer = await webIconBlob.arrayBuffer();
    const icoResult = await img2ico(webIconArrayBuffer);
    const icoDataUrl = icoResult.toDataUrl();
    const icoBlob = icoResult.toBlob();

    const previewIcons: IIcons = {
      ico: { name: 'Ico', src: icoDataUrl },
      web: { name: 'Web', src: webIconCanvas.toDataURL() },
      webMaskable: { name: 'Web Maskable', src: maskableCanvas.toDataURL() },
      desktop: { name: 'Desktop', src: icoDataUrl },
      androidForeground: { name: 'Android Foreground', src: androidForegroundCanvas.toDataURL() },
      androidBackground: { name: 'Android Background', src: androidBackgroundCanvas.toDataURL() },
      androidFullBleed: { name: 'Android Full Bleed', src: compositeCanvas.toDataURL() },
      androidLegacy: { name: 'Android Legacy', src: androidLegacyCanvas.toDataURL() },
      androidRound: { name: 'Android Round', src: androidRoundCanvas.toDataURL() },
    };
    setIcons(previewIcons);

    const fileCreationPromises = {
      // Web
      'web/favicon.ico': Promise.resolve(icoBlob),
      'web/apple-touch-icon.png': resizeCanvasToBlob(webIconCanvas, 180),
      'web/icon-192.png': resizeCanvasToBlob(webIconCanvas, 192),
      'web/icon-192-maskable.png': resizeCanvasToBlob(maskableCanvas, 192),
      'web/icon-512.png': resizeCanvasToBlob(webIconCanvas, 512),
      'web/icon-512-maskable.png': resizeCanvasToBlob(maskableCanvas, 512),
      // Electron
      'electron/icon.ico': Promise.resolve(icoBlob),
      // Android
      'android/ic_launcher-playstore.png': resizeCanvasToBlob(compositeCanvas, 512),
      'android/mipmap-xxxhdpi/ic_launcher.webp': resizeCanvasToBlob(androidLegacyCanvas, 192, 'webp'),
      'android/mipmap-xxxhdpi/ic_launcher_round.webp': resizeCanvasToBlob(androidRoundCanvas, 192, 'webp'),
      'android/mipmap-xxxhdpi/ic_launcher_foreground.webp': resizeCanvasToBlob(androidForegroundCanvas, 432, 'webp'),
      'android/mipmap-xxxhdpi/ic_launcher_background.webp': resizeCanvasToBlob(androidBackgroundCanvas, 432, 'webp'),
      'android/mipmap-xxhdpi/ic_launcher.webp': resizeCanvasToBlob(androidLegacyCanvas, 144, 'webp'),
      'android/mipmap-xxhdpi/ic_launcher_round.webp': resizeCanvasToBlob(androidRoundCanvas, 144, 'webp'),
      'android/mipmap-xxhdpi/ic_launcher_foreground.webp': resizeCanvasToBlob(androidForegroundCanvas, 324, 'webp'),
      'android/mipmap-xxhdpi/ic_launcher_background.webp': resizeCanvasToBlob(androidBackgroundCanvas, 324, 'webp'),
      'android/mipmap-xhdpi/ic_launcher.webp': resizeCanvasToBlob(androidLegacyCanvas, 96, 'webp'),
      'android/mipmap-xhdpi/ic_launcher_round.webp': resizeCanvasToBlob(androidRoundCanvas, 96, 'webp'),
      'android/mipmap-xhdpi/ic_launcher_foreground.webp': resizeCanvasToBlob(androidForegroundCanvas, 216, 'webp'),
      'android/mipmap-xhdpi/ic_launcher_background.webp': resizeCanvasToBlob(androidBackgroundCanvas, 216, 'webp'),
      'android/mipmap-hdpi/ic_launcher.webp': resizeCanvasToBlob(androidLegacyCanvas, 72, 'webp'),
      'android/mipmap-hdpi/ic_launcher_round.webp': resizeCanvasToBlob(androidRoundCanvas, 72, 'webp'),
      'android/mipmap-hdpi/ic_launcher_foreground.webp': resizeCanvasToBlob(androidForegroundCanvas, 162, 'webp'),
      'android/mipmap-hdpi/ic_launcher_background.webp': resizeCanvasToBlob(androidBackgroundCanvas, 162, 'webp'),
      'android/mipmap-mdpi/ic_launcher.webp': resizeCanvasToBlob(androidLegacyCanvas, 48, 'webp'),
      'android/mipmap-mdpi/ic_launcher_round.webp': resizeCanvasToBlob(androidRoundCanvas, 48, 'webp'),
      'android/mipmap-mdpi/ic_launcher_foreground.webp': resizeCanvasToBlob(androidForegroundCanvas, 108, 'webp'),
      'android/mipmap-mdpi/ic_launcher_background.webp': resizeCanvasToBlob(androidBackgroundCanvas, 108, 'webp'),
    };

    const fileEntries = await Promise.all(Object.entries(fileCreationPromises).map(async ([path, promise]) => {
      const blob = await promise;
      const name = path.substring(path.lastIndexOf('/') + 1);
      return [path, { blob, name }];
    }));

    setGeneratedFiles(Object.fromEntries(fileEntries));
  };

  const handleSave = async (): Promise<boolean> => {
    if (!generatedFiles) return false;

    // 按目标目录对文件进行分组
    const initialUploadsByDirectory: Record<string, { blob: Blob, name: string }[]> = {};
    const uploadsByDirectory = Object.entries(generatedFiles).reduce((acc, [path, fileData]) => {
      const directory = `games/${gameDir}/icons/${path.substring(0, path.lastIndexOf('/'))}`;
      if (!acc[directory]) {
        acc[directory] = [];
      }
      acc[directory].push(fileData);
      return acc;
    }, initialUploadsByDirectory);

    try {
      // 删除旧目录
      await Promise.all([
        api.assetsControllerDeleteFileOrDir({ source: `games/${gameDir}/icons/web` }),
        api.assetsControllerDeleteFileOrDir({ source: `games/${gameDir}/icons/electron` }),
        api.assetsControllerDeleteFileOrDir({ source: `games/${gameDir}/icons/android` }),
      ]).catch(err => console.warn("删除失败 (目录可能不存在), 继续上传。", err));

      // 创建 Android XML 文件
      const icLauncherXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
      const icLauncherXmlBlob = new Blob([icLauncherXmlContent], { type: 'text/xml' });
      uploadsByDirectory[`games/${gameDir}/icons/android/mipmap-anydpi-v26`] = [
        { blob: icLauncherXmlBlob, name: 'ic_launcher.xml'},
        { blob: icLauncherXmlBlob, name: 'ic_launcher_round.xml'}
      ];

      // 并行上传所有文件
      const uploadPromises = Object.entries(uploadsByDirectory).map(([directory, files]) => {
        const formData = new FormData();
        formData.append('targetDirectory', directory);
        files.forEach(file => {
          formData.append('files', file.blob, file.name);
        });
        return axios.post('/api/assets/upload', formData);
      });

      await Promise.all(uploadPromises);
      console.log('所有图标已成功上传。');
      return true;

    } catch (error) {
      console.error('图标上传过程中发生错误:', error);
      return false;
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setForegroundImage(null);
    setBackgroundImage(null);
    setBackgroundColor('#FFFFFF00');
    setForegroundOffset({ x: 0, y: 0 });
    setBackgroundOffset({ x: 0, y: 0 });
    setForegroundScale(1);
    setBackgroundScale(1);
    setGridLineColor('#000000AA');
    setActiveIndex(0);
    setIcons(null);
  };

  const iconShapeMap = new Map<IIconShape, string>([
    ['square', t`方形`],
    ['circle', t`圆形`],
    ['rounded-rectangle', t`圆角矩形`],
  ]);

  return (
    <>
      <div onClick={() => setIsOpen(!isOpen)}>
        {triggerButton ?? <Button>{t`修改游戏图标`}</Button>}
      </div>
      <Dialog
        open={isOpen}
        onOpenChange={() => isOpen ? handleClose() : setIsOpen(!isOpen)}
      >
        <DialogSurface onWheel={(event) => event.stopPropagation()}>
          <DialogBody>
            <DialogTitle>{activeIndex === 0 ? t`编辑图标` : t`预览图标`}</DialogTitle>
            <DialogContent>
              <Carousel
                groupSize={1}
                activeIndex={activeIndex}
                motion='fade'
              >
                <CarouselViewport draggable={false}>
                  <CarouselSlider>
                    <CarouselCard>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', }}>
                        <div className={styles.mosaicBg} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }} >
                          <Card appearance='filled-alternative' className={styles.canvasContainer}>
                            <canvas ref={backgroundCanvasRef} width={canvasSize} height={canvasSize} className={styles.canvas} />
                            <canvas ref={foregroundCanvasRef} width={canvasSize} height={canvasSize} className={styles.canvas} />
                            <canvas ref={gridCanvasRef} width={canvasSize} height={canvasSize} className={styles.canvas} />
                          </Card>
                        </div>
                        <div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'start',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                          }}>
                            <span className={styles.title}>{t`前景`}</span>
                            <input
                              type="file"
                              accept="image/*"
                              id="foreground-file-input"
                              style={{ display: 'none' }}
                              onChange={(event) => {
                                if (!event.target.files) return;
                                const file = event.target.files[0];
                                selectImage(file, 'foreground');
                              }}
                            />
                            <Button className={styles.fileInputButton}>
                              <label htmlFor="foreground-file-input">
                                {t`选择图片`}
                              </label>
                            </Button>

                            {foregroundImage &&
                              <Transformer
                                title={t`调整前景图片`}
                                offset={foregroundOffset}
                                onOffsetChange={setForegroundOffset}
                                scale={{ x: foregroundScale, y: foregroundScale }}
                                scaleLinked
                                onScaleChange={(scale) => setForegroundScale(scale.x)}
                              />
                            }
                            <span className={styles.title}>{t`背景`}</span>
                            <Dropdown
                              value={backgroundStyle === 'color' ? t`颜色` : t`图片`}
                              style={{ minWidth: 0 }}
                              selectedOptions={[backgroundStyle]}
                              onOptionSelect={(event, data) => setBackgroundStyle(data.optionValue as IBackgroundStyle)}
                            >
                              <Option value="color" >{t`颜色`}</Option>
                              <Option value="image">{t`图片`}</Option>
                            </Dropdown>
                            {backgroundStyle === 'color' &&
                              <ColorPickerPopup
                                color={backgroundColor}
                                onChange={(color) => setBackgroundColor(color)}
                              />
                            }
                            {backgroundStyle === 'image' &&
                              <>
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="background-file-input"
                                  style={{ display: 'none' }}
                                  onChange={(event) => {
                                    if (!event.target.files) return;
                                    const file = event.target.files[0];
                                    selectImage(file, 'background');
                                  }}
                                />
                                <Button className={styles.fileInputButton}>
                                  <label htmlFor="background-file-input">
                                    {t`选择图片`}
                                  </label>
                                </Button>
                                {backgroundImage &&
                                  <Transformer
                                    title={t`调整背景图片`}
                                    offset={backgroundOffset}
                                    onOffsetChange={setBackgroundOffset}
                                    scale={{ x: backgroundScale, y: backgroundScale }}
                                    scaleLinked
                                    onScaleChange={(scale) => setBackgroundScale(scale.x)}
                                  />
                                }
                              </>
                            }
                            <span className={styles.title}>{t`裁剪形状`}</span>
                            <Dropdown
                              value={iconShapeMap.get(iconShape)}
                              style={{ minWidth: 0 }}
                              selectedOptions={[iconShape]}
                              onOptionSelect={(_event, data) => setIconShape(data.optionValue as IIconShape)}
                            >
                              {Array.from(iconShapeMap).map(([key, value]) => (
                                <Option key={key} value={key}>{value}</Option>
                              ))}
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                    </CarouselCard>
                    <CarouselCard>
                      {
                        !icons
                          ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Spinner />
                          </div>
                          : <div className={[styles.mosaicBg, styles.previewContainer].join(' ')}>
                            {
                              Object
                                .entries(icons)
                                .filter(([key]) => !['ico', 'androidBackground', 'androidForeground'].includes(key))
                                .map(([key, icon]) => (
                                  <div key={key} className={styles.preview}>
                                    <div className={styles.previewIcon}>
                                      <img title={icon.name} src={icon.src} />
                                    </div>
                                    <span>{icon.name}</span>
                                  </div>
                                ))
                            }
                          </div>
                      }
                    </CarouselCard>
                  </CarouselSlider>
                </CarouselViewport>
              </Carousel>
            </DialogContent>
            <DialogActions>
              {
                activeIndex === 0 ?
                  <>
                    <Button appearance='secondary' onClick={handleClose}>{t`取消`}</Button>
                    <Button appearance='primary' onClick={() => setActiveIndex(1)}>{t`下一步`}</Button>
                  </>
                  : <>
                    <Button appearance='secondary' onClick={() => setActiveIndex(0)}>{t`上一步`}</Button>
                    <Button
                      appearance='primary'
                      disabled={isSaving || !generatedFiles}
                      onClick={async () => {
                        setIsSaving(true);
                        const result = await handleSave();
                        setIsSaving(false);
                        result && handleClose();
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: isSaving || !icons ? 'wait' : 'pointer',
                      }}
                    >
                      {isSaving && <Spinner size='extra-tiny' />}
                      {!isSaving && <span>{t`保存`}</span>}
                    </Button>
                  </>
              }
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog >
    </>
  );
};

export default IconCreator;