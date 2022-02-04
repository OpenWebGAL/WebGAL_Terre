const fs = require('fs');
const logger = require("../extend/logger");

const writeScene = (gameName, sceneName, sceneData) => {
    //要写入的JSON和txt文件目录：
    const JSONdir = `./public/Games/${gameName}/game/scene/${sceneName}.json`;
    const txtDir = `./public/Games/${gameName}/game/scene/${sceneName}.txt`;

    return new Promise(r => {
        //更新JSON文件
        logger.info('现在开始写入JSON', sceneData);
        logger.info('写入到：' + JSONdir);
        fs.writeFile(JSONdir, JSON.stringify(sceneData), (err, data) => {
            if (err) {
                console.log(err);
                r('fail')
            } else
                updateSceneTxt();
        })

        //更新txt文件（生成语句）
        function updateSceneTxt() {
            let txtStr = '';

            //语法生成器
            for (const sentence of sceneData) {
                switch (sentence['type']) {
                    case 'dialog':
                        let temp;
                        if (sentence['speaker'] === '') {
                            temp = `${sentence['content']};\n`;
                        } else {
                            temp = `${sentence['speaker']}:${sentence['content']};\n`;
                        }

                        txtStr = txtStr + temp;
                        break;
                }
            }

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