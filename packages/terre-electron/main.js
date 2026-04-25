global['isElectron'] = true;
const { app, BrowserWindow, globalShortcut, Menu, ipcMain } = require('electron');
const log = require('electron-log');
const http = require('http');
const path = require('path');

let Steamworks;
let steamClient;

try {
    Steamworks = require('steamworks.js');
} catch (error) {
    log.warn('Steamworks integration is unavailable', error);
}

const WEBGAL_PORT = Number.parseInt(process.env.WEBGAL_PORT ?? '3000', 10);
const WEBGAL_URL = process.env.WEBGAL_URL ?? `http://127.0.0.1:${WEBGAL_PORT + 1}`;
const STEAM_APP_ID = process.env.STEAM_APP_ID ?? process.env.STEAM_APPID;
const APP_ID = 'com.openwebgal.webgal-terre';

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

if (Steamworks) {
    try {
        Steamworks.electronEnableSteamOverlay();
    } catch (error) {
        log.warn('Steam overlay could not be enabled', error);
    }
}

const parseAppId = (appId) => {
    if (typeof appId === 'undefined' || appId === null || appId === '') {
        return undefined;
    }
    if (typeof appId === 'number') {
        return appId;
    }
    const numeric = Number(appId);
    return Number.isNaN(numeric) ? appId : numeric;
};

const initializeSteam = (appId = STEAM_APP_ID) => {
    if (!Steamworks) {
        return false;
    }
    if (steamClient) {
        return true;
    }

    try {
        const parsedAppId = parseAppId(appId);

        if (
            parsedAppId &&
            process.env.STEAM_RESTART_IF_NECESSARY === '1' &&
            Steamworks.restartAppIfNecessary(parsedAppId)
        ) {
            app.quit();
            return false;
        }

        steamClient = Steamworks.init(parsedAppId);
        log.info(`Steamworks initialized${parsedAppId ? ` with AppID ${parsedAppId}` : ''}`);
        return true;
    } catch (error) {
        log.error('Failed to initialize Steamworks', error);
        steamClient = undefined;
        return false;
    }
};

ipcMain.handle('steam-initialize', async (_event, appId) => initializeSteam(appId));

ipcMain.handle('steam-unlock-achievement', async (_event, achievementId) => {
    if (!steamClient && !initializeSteam()) {
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

require('./dist/main');

/**
 * 关闭默认菜单栏
 */
Menu.setApplicationMenu(null);

/**
 * 在应用启动后打开窗口
 */
app.whenReady().then(() => {
    app.setAppUserModelId(APP_ID);
    initializeSteam();
    createWindow();

    // 适配 Mac OS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

/**
 * 打开窗口
 */
const waitForServer = (url, retries = 120, delay = 250) => new Promise((resolve, reject) => {
    const tryConnect = (remaining) => {
        const request = http.get(url, (response) => {
            response.resume();
            resolve();
        });

        request.on('error', (error) => {
            if (remaining <= 0) {
                reject(error);
                return;
            }
            setTimeout(() => tryConnect(remaining - 1), delay);
        });

        request.setTimeout(2000, () => {
            request.destroy(new Error(`Timed out while waiting for ${url}`));
        });
    };

    tryConnect(retries);
});

const createWindow = async () => {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        icon: path.join(__dirname, 'public', 'icon.ico'),
        useContentSize: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    })

    try {
        await waitForServer(WEBGAL_URL);
        await win.loadURL(WEBGAL_URL);
    } catch (error) {
        log.error(`Failed to load WebGAL Terre from ${WEBGAL_URL}`, error);
    }

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

    win.on('close', () => {
        app.quit();
    });
}

app.on('before-quit', () => {
    globalShortcut.unregisterAll();

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
