const { app, BrowserWindow, globalShortcut, Menu, ipcMain } = require('electron');
const log = require('electron-log');
const path = require('path');
const Steamworks = require('steamworks.js');

let steamClient;
let steamCallbackInterval;

const parseAppId = (appId) => {
    if (typeof appId === 'number') {
        return appId;
    }
    const numeric = Number(appId);
    return Number.isNaN(numeric) ? appId : numeric;
};

const stopSteamCallbacks = () => {
    if (steamCallbackInterval) {
        clearInterval(steamCallbackInterval);
        steamCallbackInterval = undefined;
    }
};

ipcMain.handle('steam-initialize', async (_event, appId) => {
    if (steamClient) {
        return true;
    }

    try {
        const parsedAppId = parseAppId(appId);
        steamClient = Steamworks.init(parsedAppId);

        if (typeof steamClient?.runCallbacks === 'function' && !steamCallbackInterval) {
            steamCallbackInterval = setInterval(() => {
                try {
                    steamClient.runCallbacks();
                } catch (error) {
                    log.error('Steamworks runCallbacks failed', error);
                }
            }, 1000 / 60);

            if (typeof steamCallbackInterval?.unref === 'function') {
                steamCallbackInterval.unref();
            }
        }

        log.info('Steamworks initialized');
        return true;
    } catch (error) {
        log.error('Failed to initialize Steamworks', error);
        steamClient = undefined;
        stopSteamCallbacks();
        return false;
    }
});

ipcMain.handle('steam-unlock-achievement', async (_event, achievementId) => {
    if (!steamClient) {
        log.warn(`Cannot unlock achievement ${achievementId}: Steamworks not initialized`);
        return false;
    }

    try {
        const result = steamClient.achievement?.activate
            ? steamClient.achievement.activate(achievementId)
            : false;

        if (!result) {
            log.warn(`Steamworks failed to activate achievement ${achievementId}`);
        }

        return Boolean(result);
    } catch (error) {
        log.error(`Error unlocking Steam achievement ${achievementId}`, error);
        return false;
    }
});

app.commandLine.appendSwitch("--in-process-gpu"); // 修复 steam overlay
app.commandLine.appendSwitch("--autoplay-policy", "no-user-gesture-required"); // 允许自动播放

/**
 * 关闭默认菜单栏
 */
Menu.setApplicationMenu(null);

/**
 * 在应用启动后打开窗口
 */
app.whenReady().then(() => {
    createWindow()

    try {
        Steamworks.electronEnableSteamOverlay();
    } catch (error) {
        log.warn('Steam overlay could not be enabled', error);
    }

    // 适配 Mac OS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

/**
 * 打开窗口
 */
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        icon: path.join(__dirname, '../../icon.ico'),
        useContentSize: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    })

    win.loadFile('./public/index.html').then(r => {
        console.log(r)
        win.webContents.executeJavaScript('window.isElectron = true')
    });

    // 注册快捷键 Ctrl + F12 切换开发者工具
    globalShortcut.register("Ctrl+F12", () => {
        win.isFocused() && win.webContents.toggleDevTools();
    });

    // 捕获渲染进程控制台信息
    win.webContents.on('console-message', (event, level, message) => {
        const logLevels = {
            '[silly]': log.silly,
            '[debug]': log.debug,
            '[verbose]': log.verbose,
            '[warn]': log.warn,
            '[error]': log.error,
        };

        const logMessage = (message) => {
            const level = Object.keys(logLevels).find(key => message.toLowerCase().includes(key));
            const selectedLevel = level ? logLevels[level] : log.info;
            selectedLevel(message);
        }

        logMessage(message);
    });

    /**
     * 侦听BrowserWindow关闭事件
     */
    win.on("close", () => {
        app.quit();
    });
}

app.on('before-quit', () => {
    globalShortcut.unregisterAll();
    stopSteamCallbacks();

    if (steamClient && typeof steamClient.shutdown === 'function') {
        try {
            steamClient.shutdown();
        } catch (error) {
            log.error('Steamworks shutdown failed', error);
        }
    }

    steamClient = undefined;
});

/**
 * 在关闭所有窗口时退出应用
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
