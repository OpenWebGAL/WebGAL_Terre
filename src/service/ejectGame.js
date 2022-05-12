const fs = require('fs');
const {readdir} = require("fs");
const {webgalMkdir, webgalCopy} = require("../util/webgal-fs");

/**
 * 导出游戏
 * @param gameName 游戏名称
 * @param ejectPlatform 导出平台
 * @returns {Promise<void>}
 */
ejectGame = async (gameName, ejectPlatform) => {
    // 根据 GameName 找到游戏所在目录
    const gameDir = `./public/Games/${gameName}/`;
    // 创建游戏导出目录
    const exportDir = `./Exported_Games/${gameName}`;
    await webgalMkdir(exportDir);
    // 将游戏复制到导出目录，并附加对应的模板
    if (ejectPlatform === 'electron-windows') {
        const electronExportDir = `${exportDir}/electron-windows`;
        await webgalMkdir(electronExportDir);
        await webgalCopy(`./WebGAL_Electron_Template/`, `${electronExportDir}/`);
        await webgalCopy(gameDir, `${electronExportDir}/resources/app/public/`);
    }
    if (ejectPlatform === 'web') {
        const webExportDir = `${exportDir}/web`;
        await webgalMkdir(webExportDir);
        await webgalCopy(gameDir, `${webExportDir}/`);
    }
}

// 测试游戏导出
module.exports = ejectGame;
