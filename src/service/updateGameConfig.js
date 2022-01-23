const fs = require("fs");
const updateGameConfig = (gameName, gameConfig) => {
    // 先确认这个游戏配置文件的目录
    const configDir = `./public/Games/${gameName}/game/gameConfig.json`;
    const configTxtDir = `./public/Games/${gameName}/game/config.txt`;
    //写入文件
    console.log(gameConfig);
    return new Promise(async resolve => {
        const writeData = JSON.stringify(gameConfig,null,'\t');
        let writeConfigTxt = '';
        for (const gameConfigKey in gameConfig) {
            writeConfigTxt = writeConfigTxt+`${gameConfigKey}:${gameConfig[gameConfigKey]};\n`
        }
        await fs.writeFile(configDir, writeData, err => {
            if (err) {
                console.log(err);
                resolve('fail')
            }
        })
        await fs.writeFile(configTxtDir, writeConfigTxt, err => {
            if (err) {
                console.log(err);
                resolve('fail')
            }
        })
        resolve('success');
    })
}

module.exports = updateGameConfig;