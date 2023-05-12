import { t } from 'i18next';

export const dirnameToDisplayNameMap = new Map();
const tPrefix = 'editor.sideBar.assets.folders.';

dirnameToDisplayNameMap.set('animation', () => t(tPrefix + 'animation'));
dirnameToDisplayNameMap.set('background', () => t(tPrefix + 'background'));
dirnameToDisplayNameMap.set('bgm', () => t(tPrefix + 'bgm'));
dirnameToDisplayNameMap.set('figure', () => t(tPrefix + 'figure'));
dirnameToDisplayNameMap.set('scene', () => t(tPrefix + 'scene'));
dirnameToDisplayNameMap.set('tex', () => t(tPrefix + 'tex'));
dirnameToDisplayNameMap.set('video', () => t(tPrefix + 'video'));
dirnameToDisplayNameMap.set('vocal', () => t(tPrefix + 'vocal'));

export const dirNameToExtNameMap = new Map();

dirNameToExtNameMap.set('animation', ['.json']);
dirNameToExtNameMap.set('background', ['.jpg', '.png', '.webp']);
dirNameToExtNameMap.set('bgm', ['.mp3', '.ogg', '.wav']);
dirNameToExtNameMap.set('figure', ['.png', '.webp']);
dirNameToExtNameMap.set('scene', ['.txt']);
dirNameToExtNameMap.set('tex', ['.png', '.webp']);
dirNameToExtNameMap.set('video', ['.mp4']);
dirNameToExtNameMap.set('vocal', ['.mp3', '.ogg', '.wav']);
