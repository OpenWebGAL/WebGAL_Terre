const fs = require('fs');
const {readdir} = require("fs");

const createNewGame = (gameName) => {
    return new Promise(resolve => {
        //先检查是否有重名情况
        readdir("./public/Games/", (err, result) => {
            //result是获取到的全部游戏的名称
            if (result.includes(gameName)) {
                resolve(false)
            } else {
                createGameFromTemplate();
            }
        });

        function createGameFromTemplate() {
            //创建目录
            fs.mkdir('./public/Games/' + gameName, result => {
                //然后，将模板复制到 ./public/Games/下
                fs.cp('./WebGAL_Template/game', './public/Games/' + gameName + '/' + 'game', {recursive: true}, createResult => {
                    resolve(true)
                })
            })


        }
    })

}

module.exports = createNewGame;
