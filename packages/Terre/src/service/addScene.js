const fs = require('fs');
const {readdir} = require("fs");
const logger = require("../extend/logger");

const addScene = (gameName, SceneName) => {
    //检查是否存在相同名称的Scene，如果有，就中断这个操作。
    const dirName = `./public/Games/${gameName}/game/scene`;

    return new Promise(r => {
        //获取这个目录下的所有文件
        readdir(dirName, (err, data) => {
            if (err) throw err;
            logger.info('获取到的目录：', data);
            if (data.includes(SceneName + '.json')) {
                logger.warn('已经存在这个文件');
                r('exist');
            } else creatScene();

        });

        function creatScene() {
            //创建一个空的数组作为json文件，用于做编辑器的存储，json转txt由其他模块处理
            const data = [];
            const jsonData = JSON.stringify(data);
            fs.writeFile(dirName + '/' + SceneName + '.json', jsonData, (err, data) => {
                if (err) {
                    console.log(err);
                    r('fail')
                } else
                    r('OK');
            })
        }
    })
}

module.exports = addScene;