const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronFuncs', {
    steam: {
        initialize: (appId) => ipcRenderer.invoke('steam-initialize', appId),
        unlockAchievement: (achievementId) => ipcRenderer.invoke('steam-unlock-achievement', achievementId),
    },
});
