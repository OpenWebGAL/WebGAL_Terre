const fs = require('fs');
const logger = require("../extend/logger");

const webgalMkdir = (path) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, result => {
            resolve();
        });
    });
}

const webgalCopy = (src, dest) => {
    return new Promise((resolve, reject) => {
        fs.cp(src, dest, {recursive: true}, result => {
            resolve();
        })
    });
}

function webgalDelete(path) {
    return new Promise((resolve, reject) => {
        fs.rm(path, (err) => {
            if (err) {
                logger.error('删除文件或文件夹失败');
            }
            resolve();
        })
    });
}

module.exports = {webgalMkdir, webgalCopy, webgalDelete};
