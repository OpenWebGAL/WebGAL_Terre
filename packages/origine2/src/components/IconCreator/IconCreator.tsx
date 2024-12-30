import { api } from '@/api';
import { IconsDto } from '@/api/Api';
import { Button, Card, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Dropdown, Link, Option, Slider, Spinner, Toast, ToastBody, Toaster, ToastFooter, ToastTitle, ToastTrigger, useId, useToastController } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import styles from './iconCreator.module.scss';
import axios from 'axios';
import { ColorPickerPopup } from '../ColorPickerPopup/ColorPickerPopup';
import { tinycolor } from '@ctrl/tinycolor';
import { ArrowMoveFilled, ArrowMoveRegular, bundleIcon } from '@fluentui/react-icons';
import { PngIcoConverter } from "@/utils/png2icojs";

type IIconShape = 'circle' | 'square' | 'rounded-rectangle';
type IBackgroundStyle = 'color' | 'image';

const ArrowMoveIcon = bundleIcon(ArrowMoveFilled, ArrowMoveRegular);

const IconCreator = ({ gameDir, triggerButton }: { gameDir: string, triggerButton: ReactElement }) => {

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [platforms, setPlatforms] = useState<IconsDto['platforms']>([]);

  useEffect(() => {
    const getIcons = async () => {
      const iconsData = (await api.manageGameControllerGetIcons(gameDir)).data;
      setPlatforms(iconsData['platforms']);
    };
    getIcons();
  }, []);

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
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [gridLineColor, setGridLineColor] = useState<'#FFFFFF' | '#000000'>('#000000');

  const canvasSize = 1536;

  // 图标的裁剪方式为先从画布上裁剪正方形，然后再从正方形上裁剪出图标
  const clipInset = {
    main: 1 / 6,
    web: 0.0636,
    electron: 0.0636,
    android: {
      playStore: 1 / 12,
      roundedRectangle: 0.1042,
      circle: 0.0365,
    }
  };

  const drawGrid = useCallback(async () => {
    if (gridCanvasRef.current) {
      const ctx = gridCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.imageSmoothingEnabled = true;

        ctx.shadowColor = gridLineColor === '#000000' ? '#FFFFFF' : '#000000';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        let clippedSize = canvasSize * (1 - clipInset.main * 2) * (1 - clipInset.web * 2);
        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;

        ctx.strokeStyle = gridLineColor;
        ctx.lineWidth = 8;

        // web and electron 图标网格
        ctx.beginPath();
        if (iconShape === 'square') {
          ctx.rect(centerX - clippedSize / 2, centerY - clippedSize / 2, clippedSize, clippedSize);
        } else if (iconShape === 'circle') {
          ctx.arc(centerX, centerY, clippedSize / 2, 0, Math.PI * 2);
        } else if (iconShape === 'rounded-rectangle') {
          const radius = 34 * (canvasSize * (1 - clipInset.main * 2) / gridCanvasRef.current.clientWidth);
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

        // maskable 图标网格
        clippedSize = canvasSize * (1 - clipInset.main * 2);
        ctx.beginPath();
        ctx.rect(centerX - clippedSize / 2, centerY - clippedSize / 2, clippedSize, clippedSize);
        ctx.closePath();
        ctx.stroke();

        // android rounded rectangle 图标网格
        clippedSize = canvasSize * (1 - clipInset.main * 2) * (1 - clipInset.android.roundedRectangle * 2);
        const radius = 34 * (canvasSize * (1 - clipInset.main * 2) / gridCanvasRef.current.clientWidth);
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

        // android circle 图标网格
        clippedSize = canvasSize * (1 - clipInset.main * 2) * (1 - clipInset.android.circle * 2);
        ctx.beginPath();
        ctx.arc(centerX, centerY, clippedSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();

        // android play store 图标网格
        clippedSize = canvasSize * (1 - clipInset.android.playStore * 2);
        ctx.beginPath();
        ctx.rect(centerX - clippedSize / 2, centerY - clippedSize / 2, clippedSize, clippedSize);
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
        ctx.drawImage(
          foregroundImage,
          (canvasSize - drawWidth) / 2 + foregroundOffset.x,
          (canvasSize - drawHeight) / 2 + foregroundOffset.y,
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
        if (backgroundStyle === 'color') {
          ctx.fillStyle = tinycolor(backgroundColor).toHex8String();
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
              (canvasSize - drawWidth) / 2 + backgroundOffset.x,
              (canvasSize - drawHeight) / 2 + backgroundOffset.y,
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
    const brightness = await getCombinedBrightness(backgroundCanvasRef.current!, foregroundCanvasRef.current!);
    if (brightness > 128) {
      setGridLineColor('#000000');
    } else {
      setGridLineColor('#FFFFFF');
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
    (async () => {
      await drawForeground();
      await updateGridLineColor();
    })();
  }, [foregroundImage, foregroundOffset, foregroundScale]);

  useEffect(() => {
    (async () => {
      await drawBackground();
      await updateGridLineColor();
    })();
  }, [backgroundStyle, backgroundColor, backgroundImage, backgroundOffset, backgroundScale]);

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

  const getCompositedImage = async (images: Blob[], size: number) => {
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = size;
    compositeCanvas.height = size;
    const compositeContext = compositeCanvas.getContext('2d');

    for (const blob of images) {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      await new Promise((resolve) => {
        img.onload = () => {
          compositeContext?.drawImage(img, 0, 0);
          resolve(null);
        };
      });
    }

    const compositeBlob = await new Promise<Blob | null>((resolve) => {
      compositeCanvas.toBlob(resolve, 'image/png');
    });

    return compositeBlob;
  };

  /**
 * 裁剪图像。
 * 
 * @param {Blob} image 要裁剪的图像。
 * @param {number} inset 0-1 之间的值，表示裁剪区域的内边距百分比。
 * @param {IIconShape} shape 裁剪的形状。
 * @returns {Promise<Blob | null>} 裁剪后的图像。
 */
  const clipImage = async (image: Blob, inset: number, shape: IIconShape) => {
    const img = new Image();
    const imageUrl = URL.createObjectURL(image);
    img.src = imageUrl;

    await new Promise((resolve) => {
      img.onload = () => {
        resolve(null);
      };
    });

    const insetWidth = img.width * inset;
    const insetHeight = img.height * inset;
    const clippedWidth = img.width - insetWidth * 2;
    const clippedHeight = img.height - insetHeight * 2;

    const canvas = document.createElement('canvas');
    canvas.width = clippedWidth;
    canvas.height = clippedHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(clippedWidth / 2, clippedHeight / 2, Math.min(clippedWidth, clippedHeight) / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    } else if (shape === 'rounded-rectangle') {
      const radius = 34 * (img.width / foregroundCanvasRef?.current!.clientWidth);
      ctx.beginPath();
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
      ctx.clip();
    }

    const drawX = -insetWidth;
    const drawY = -insetHeight;

    ctx.drawImage(img, drawX, drawY, img.width, img.height);

    const clippedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    return clippedBlob;
  };

  /**
   * 调整图像大小。
   *
   * @param imageBlob 要调整的图像。
   * @param size 新图像的尺寸。
   * @param padding 0-1 之间的值，表示边距占图像大小的比例。
   * @returns 调整后的图像。
   */
  const resizeImage = async (
    image: Blob,
    size: number,
    padding = 0,
  ) => {
    const img = new Image();

    const loadImage = () => {
      return new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (error) => reject(error);
        img.src = URL.createObjectURL(image);
      });
    };

    await loadImage();

    const canvasSize = size;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2d context');
    }

    const drawX = padding * size;
    const drawY = padding * size;
    const drawWidth = size * (1 - padding * 2);
    const drawHeight = size * (1 - padding * 2);

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    const resizedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!resizedBlob) {
      throw new Error('Failed to resize image');
    }

    return resizedBlob;
  };

  const handleSave = async (): Promise<boolean> => {
    const foregroundImage = await new Promise<Blob | null>((resolve) => {
      foregroundCanvasRef?.current?.toBlob(resolve, 'image/png');
    });
    const backgroundImage = await new Promise<Blob | null>((resolve) => {
      backgroundCanvasRef?.current?.toBlob(resolve, 'image/png');
    });
    if (!foregroundImage || !backgroundImage) return false;
    const compositedImage = await getCompositedImage([backgroundImage, foregroundImage], canvasSize);
    if (!compositedImage) return false;

    // 上传 Web 图标
    try {
      const maskableIcon = await clipImage(compositedImage, clipInset.main, 'square');
      if (!maskableIcon) return false;
      const icon = await clipImage(maskableIcon, clipInset.web, iconShape);
      if (!icon) return false;

      const pngIcoConverter = new PngIcoConverter();
      const ico = await pngIcoConverter.convertToBlobAsync([{ png: await resizeImage(icon, 256) }]);

      const formData = new FormData();

      formData.append('targetDirectory', `games/${gameDir}/icons/web`);
      formData.append('files', ico, 'favicon.ico');
      formData.append('files', await resizeImage(icon, 180), 'apple-touch-icon.png');
      formData.append('files', await resizeImage(icon, 192), 'icon-192.png');
      formData.append('files', await resizeImage(maskableIcon, 192), 'icon-192-maskable.png');
      formData.append('files', await resizeImage(icon, 512), 'icon-512.png');
      formData.append('files', await resizeImage(maskableIcon, 512), 'icon-512-maskable.png');

      await api.assetsControllerDeleteFileOrDir({ source: `games/${gameDir}/icons/web` });
      await axios.post('/api/assets/upload', formData);

      console.log('上传 web 图标成功');
    } catch (error) {
      console.error('上传 web 图标失败:', error);
      return false;
    }

    // 上传 Electron 图标
    try {
      const maskableIcon = await clipImage(compositedImage, clipInset.main, 'square');
      if (!maskableIcon) return false;
      const icon = await clipImage(maskableIcon, clipInset.electron, iconShape);
      if (!icon) return false;

      const pngIcoConverter = new PngIcoConverter();
      const ico = await pngIcoConverter.convertToBlobAsync([{ png: await resizeImage(icon, 256) }]);

      const formData = new FormData();

      formData.append('targetDirectory', `games/${gameDir}/icons/electron`);
      formData.append('files', ico, 'icon.ico');

      await api.assetsControllerDeleteFileOrDir({ source: `games/${gameDir}/icons/electron` });
      await axios.post('/api/assets/upload', formData);

      console.log('上传 Electron 图标成功');
    } catch (error) {
      console.error('上传 Electron 图标失败:', error);
      return false;
    }

    // 上传 Android 图标
    try {
      await api.assetsControllerDeleteFileOrDir({ source: `games/${gameDir}/icons/android` });

      const icon = await clipImage(compositedImage, clipInset.main, 'square');
      if (!icon) return false;

      const roundedRectangleIcon = await clipImage(icon, clipInset.android.roundedRectangle, 'rounded-rectangle');
      const circleIcon = await clipImage(icon, clipInset.android.circle, 'circle');

      if (!roundedRectangleIcon || !circleIcon) return false;

      // play store 图标
      const playStoreIcon = await clipImage(compositedImage, clipInset.android.playStore, 'square');
      if (!playStoreIcon) return false;
      const icLauncherPlayStoreFormData = new FormData();

      icLauncherPlayStoreFormData.append('targetDirectory', `games/${gameDir}/icons/android`);
      icLauncherPlayStoreFormData.append('files', await resizeImage(playStoreIcon, 512, 0), 'ic_launcher-playstore.png');

      await axios.post('/api/assets/upload', icLauncherPlayStoreFormData);

      // values 文件夹
      if (backgroundStyle === 'color') {
        const icLauncherBackgroundXmlContent = `<?xml version="1.0" encoding="utf-8"?>
  <resources>
  <color name="ic_launcher_background">${tinycolor(backgroundColor).toHexString()}</color>
</resources>`;
        const icLauncherBackgroundXmlBlob = new Blob([icLauncherBackgroundXmlContent], { type: 'text/xml' });

        const valuesFormData = new FormData();

        valuesFormData.append('targetDirectory', `games/${gameDir}/icons/android/values`);
        valuesFormData.append('files', icLauncherBackgroundXmlBlob, 'ic_launcher_background.xml');

        await axios.post('/api/assets/upload', valuesFormData);
      }

      // mipmap-anydpi-v26 文件夹
      const icLauncherXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="${backgroundStyle === 'color' ? '@color' : '@mipmap'}/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
      const icLauncherXmlBlob = new Blob([icLauncherXmlContent], { type: 'text/xml' });

      const AnydpiV26FormData = new FormData();

      AnydpiV26FormData.append('targetDirectory', `games/${gameDir}/icons/android/mipmap-anydpi-v26`);
      AnydpiV26FormData.append('files', icLauncherXmlBlob, 'ic_launcher.xml');
      AnydpiV26FormData.append('files', icLauncherXmlBlob, 'ic_launcher_round.xml');

      await axios.post('/api/assets/upload', AnydpiV26FormData);

      // mipmap-xxxhdpi 文件夹
      const xxxhdpiFormData = new FormData();

      xxxhdpiFormData.append('targetDirectory', `games/${gameDir}/icons/android/mipmap-xxxhdpi`);
      xxxhdpiFormData.append('files', await resizeImage(roundedRectangleIcon, 192, clipInset.android.roundedRectangle), 'ic_launcher.png');
      xxxhdpiFormData.append('files', await resizeImage(circleIcon, 192, clipInset.android.circle), 'ic_launcher_round.png');
      xxxhdpiFormData.append('files', await resizeImage(foregroundImage, 432), 'ic_launcher_foreground.png');

      if (backgroundStyle === 'image') {
        xxxhdpiFormData.append('files', await resizeImage(backgroundImage, 432), 'ic_launcher_background.png');
      }

      await axios.post('/api/assets/upload', xxxhdpiFormData);

      // mipmap-xxhdpi 文件夹
      const xxhdpiFormData = new FormData();

      xxhdpiFormData.append('targetDirectory', `games/${gameDir}/icons/android/mipmap-xxhdpi`);
      xxhdpiFormData.append('files', await resizeImage(roundedRectangleIcon, 144, clipInset.android.roundedRectangle), 'ic_launcher.png');
      xxhdpiFormData.append('files', await resizeImage(circleIcon, 144, clipInset.android.circle), 'ic_launcher_round.png');
      xxhdpiFormData.append('files', await resizeImage(foregroundImage, 324), 'ic_launcher_foreground.png');

      if (backgroundStyle === 'image') {
        xxhdpiFormData.append('files', await resizeImage(backgroundImage, 324), 'ic_launcher_background.png');
      }

      await axios.post('/api/assets/upload', xxhdpiFormData);

      // mipmap-xhdpi 文件夹
      const xhdpiFormData = new FormData();

      xhdpiFormData.append('targetDirectory', `games/${gameDir}/icons/android/mipmap-xhdpi`);
      xhdpiFormData.append('files', await resizeImage(roundedRectangleIcon, 96, clipInset.android.roundedRectangle), 'ic_launcher.png');
      xhdpiFormData.append('files', await resizeImage(circleIcon, 96, clipInset.android.circle), 'ic_launcher_round.png');
      xhdpiFormData.append('files', await resizeImage(foregroundImage, 216), 'ic_launcher_foreground.png');

      if (backgroundStyle === 'image') {
        xhdpiFormData.append('files', await resizeImage(backgroundImage, 216), 'ic_launcher_background.png');
      }

      await axios.post('/api/assets/upload', xhdpiFormData);

      // mipmap-hdpi 文件夹
      const hdpiFormData = new FormData();

      hdpiFormData.append('targetDirectory', `games/${gameDir}/icons/android/mipmap-hdpi`);
      hdpiFormData.append('files', await resizeImage(roundedRectangleIcon, 72, clipInset.android.roundedRectangle), 'ic_launcher.png');
      hdpiFormData.append('files', await resizeImage(circleIcon, 72, clipInset.android.circle), 'ic_launcher_round.png');
      hdpiFormData.append('files', await resizeImage(foregroundImage, 162), 'ic_launcher_foreground.png');

      if (backgroundStyle === 'image') {
        hdpiFormData.append('files', await resizeImage(backgroundImage, 162), 'ic_launcher_background.png');
      }

      await axios.post('/api/assets/upload', hdpiFormData);

      // mipmap-mdpi 文件夹
      const mdpiFormData = new FormData();

      mdpiFormData.append('targetDirectory', `games/${gameDir}/icons/android/mipmap-mdpi`);
      mdpiFormData.append('files', await resizeImage(roundedRectangleIcon, 48, clipInset.android.roundedRectangle), 'mipmap-mdpi/ic_launcher.png');
      mdpiFormData.append('files', await resizeImage(circleIcon, 48, clipInset.android.circle), 'mipmap-mdpi/ic_launcher_round.png');
      mdpiFormData.append('files', await resizeImage(foregroundImage, 108), 'mipmap-mdpi/ic_launcher_foreground.png');

      if (backgroundStyle === 'image') {
        mdpiFormData.append('files', await resizeImage(backgroundImage, 108), 'ic_launcher_background.png');
      }

      await axios.post('/api/assets/upload', mdpiFormData);

      console.log('上传 Android 图标成功');
    } catch (error) {
      console.error('上传 Android 图标失败:', error);
      return false;
    }

    return true;
  };

  const handleClose = () => {
    setIsOpen(false);
    setForegroundImage(null);
    setBackgroundImage(null);
    setBackgroundColor('#FFFFFF');
    setForegroundOffset({ x: 0, y: 0 });
    setBackgroundOffset({ x: 0, y: 0 });
    setForegroundScale(1);
    setBackgroundScale(1);
    setGridLineColor('#000000');
  };

  const handleUpdateOffsetMouseDown = (
    { event, offset, onChange }: {
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
      offset: { x: number; y: number; };
      onChange: (value: { x: number; y: number; }) => void
    }) => {
    document.body.style.cursor = 'move';
    const startX = event.clientX;
    const startY = event.clientY;

    const handleMouseMove = (moveEvent: { clientX: number; clientY: number; }) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      onChange({
        x: offset.x + dx * 4,
        y: offset.y + dy * 4,
      });
    };

    const handleMouseUp = () => {
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
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
      <Dialog open={isOpen} onOpenChange={() => isOpen ? handleClose() : setIsOpen(!isOpen)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t`修改游戏图标`}</DialogTitle>
            <DialogContent>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', userSelect: 'none', gap: '1rem', }}>
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
                    <Button className={styles.fileInput}>
                      <label htmlFor="foreground-file-input">
                        {t`选择图片`}
                      </label>
                    </Button>

                    {foregroundImage && (
                      <>
                        <span className={styles.title}>{t`调整前景图片`}</span>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                          <Slider
                            title={t`缩放前景图片`}
                            min={0}
                            max={300}
                            value={foregroundScale * 100}
                            onChange={(_, data) => setForegroundScale(data.value / 100)}
                            style={{ width: '100%', flexGrow: 1 }}
                          />
                          <Button
                            title={t`移动前景图片`}
                            appearance='transparent'
                            icon={<ArrowMoveIcon />}
                            onMouseDown={(event) =>
                              handleUpdateOffsetMouseDown({
                                event,
                                offset: foregroundOffset,
                                onChange: setForegroundOffset,
                              })}
                            style={{ cursor: 'grab' }}
                          />
                        </div>
                      </>
                    )}
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
                        <Button className={styles.fileInput}>
                          <label htmlFor="background-file-input">
                            {t`选择图片`}
                          </label>
                        </Button>
                        {backgroundImage && (
                          <>
                            <span className={styles.title}>{t`调整背景图片`}</span>
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                              <Slider
                                title={t`缩放背景图片`}
                                min={0}
                                max={300}
                                value={backgroundScale * 100}
                                onChange={(_, data) => setBackgroundScale(data.value / 100)}
                                style={{ width: '100%' }}
                              />
                              <Button
                                title={t`移动背景图片`}
                                appearance='transparent'
                                icon={<ArrowMoveIcon />}
                                onMouseDown={(event) =>
                                  handleUpdateOffsetMouseDown({
                                    event,
                                    offset: backgroundOffset,
                                    onChange: setBackgroundOffset,
                                  })}
                                style={{ cursor: 'grab' }}
                              />
                            </div>
                          </>
                        )}
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
            </DialogContent>
            <DialogActions style={{ marginTop: '1rem' }}>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance='secondary'>{t`取消`}</Button>
              </DialogTrigger>
              <Button
                appearance='primary'
                disabled={isSaving}
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
                  cursor: isSaving ? 'wait' : 'pointer',
                }}
              >
                {isSaving && <Spinner size='extra-tiny' />}
                {!isSaving && <span>{t`确定`}</span>}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};

export default IconCreator;