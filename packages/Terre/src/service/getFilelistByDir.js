const fs = require('fs')
const {readdir} = require("fs");
const logger = require("../extend/logger");


const getFilelistByDir = (dir) => {
    const dirName = `./public/Games/${dir}`;
    return new Promise((resolve) => {
        readdir(dirName, (err, data) => {
            if (err) throw err;
            logger.info('获取到的目录：', data);
            resolve(data);
        });
    })
}
module.exports = getFilelistByDir;