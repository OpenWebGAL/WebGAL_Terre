import { IFolderType } from "@/components/Assets/Assets";

export const dirNameToExtNameMap = new Map<IFolderType, string[]>([]);

dirNameToExtNameMap.set('animation', ['.json']);
dirNameToExtNameMap.set('background', ['.png', '.jpg', '.webp']);
dirNameToExtNameMap.set('bgm', ['.mp3', '.ogg', '.wav']);
dirNameToExtNameMap.set('figure', ['.png', '.jpg', '.webp', '.json']);
dirNameToExtNameMap.set('scene', ['.txt']);
dirNameToExtNameMap.set('tex', ['.png', '.webp']);
dirNameToExtNameMap.set('video', ['.mp4', '.webm', '.ogg']);
dirNameToExtNameMap.set('vocal', ['.mp3', '.ogg', '.wav']);
