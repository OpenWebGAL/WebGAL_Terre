export const dirnameToDisplayNameMap = new Map();

dirnameToDisplayNameMap.set('animation','动画');
dirnameToDisplayNameMap.set('background','背景');
dirnameToDisplayNameMap.set('bgm','音乐');
dirnameToDisplayNameMap.set('figure','立绘');
dirnameToDisplayNameMap.set('scene','场景');
dirnameToDisplayNameMap.set('tex','纹理');
dirnameToDisplayNameMap.set('video','视频');
dirnameToDisplayNameMap.set('vocal','语音');

export const dirNameToExtNameMap = new Map();

dirNameToExtNameMap.set('animation',['.json']);
dirNameToExtNameMap.set('background',['.jpg','.png','.webp']);
dirNameToExtNameMap.set('bgm',['.mp3','.ogg','.wav']);
dirNameToExtNameMap.set('figure',['.png','.webp']);
dirNameToExtNameMap.set('scene',['.txt']);
dirNameToExtNameMap.set('tex',['.png','.webp']);
dirNameToExtNameMap.set('video',['.mp4']);
dirNameToExtNameMap.set('vocal',['.mp3','.ogg','.wav']);
