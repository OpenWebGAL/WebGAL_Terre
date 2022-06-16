const fs = require('fs');
const logger = require("../extend/logger");
const scriptParser = require("./scriptParser");

const writeScene = (gameName, sceneName, sceneData) => {
    //要写入的JSON和txt文件目录：
    const JSONdir = `./public/Games/${gameName}/game/scene/${sceneName}.json`;
    const txtDir = `./public/Games/${gameName}/game/scene/${sceneName}.txt`;

    //检查JSON语法
    const checkSyntax = (text) => {
        try {
            const json = JSON.parse(text);
        } catch (error) {
            return false;
        }
        return true;
    }
    return new Promise(r => {
        //更新JSON文件
        logger.info('现在开始写入JSON', sceneData);
        logger.info('写入到：' + JSONdir);
        const writeJson = JSON.stringify(sceneData);
        if (checkSyntax(writeJson)) {
            fs.writeFile(JSONdir, writeJson, (err, data) => {
                if (err) {
                    console.log(err);
                    r('fail')
                } else
                    updateSceneTxt();
            })
        } else {
            r('fail')
        }


        //更新txt文件（生成语句）
        function updateSceneTxt() {
            const txtStr = scriptParser(sceneData);
            fs.writeFile(txtDir, txtStr, (err, data) => {
                if (err) {
                    console.log(err);
                    r('fail')
                } else
                    r('OK')
            })
        }
    })


}

module.exports = writeScene;