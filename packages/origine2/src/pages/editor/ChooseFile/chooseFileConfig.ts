import { IFolderType } from "@/components/Assets/Assets";

export const extNameMap = new Map<IFolderType, string[]>([]);

extNameMap.set('animation', ['.json']);
extNameMap.set('background', ['.png', '.jpg', '.webp']);
extNameMap.set('bgm', ['.mp3', '.ogg', '.wav']);
extNameMap.set('figure', ['.png', '.jpg', '.webp', '.json']);
extNameMap.set('scene', ['.txt']);
extNameMap.set('tex', ['.png', '.webp']);
extNameMap.set('video', ['.mp4', '.webm', '.ogg']);
extNameMap.set('vocal', ['.mp3', '.ogg', '.wav']);
