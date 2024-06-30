const {app, BrowserWindow, globalShortcut, Menu} = require('electron');
const log = require('electron-log');

/**
 * 关闭默认菜单栏
 */
Menu.setApplicationMenu(null);

/**
 * 在应用启动后打开窗口
 */
app.whenReady().then(() => {
    createWindow()
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
        height: 900
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
}

/**
 * 在关闭所有窗口时退出应用
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
