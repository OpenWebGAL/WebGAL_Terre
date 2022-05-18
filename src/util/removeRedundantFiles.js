const fs = require('fs');
const logger = require("../extend/logger");
const {webgalDelete} = require("./webgal-fs");

/**
 * 删除游戏模板和 Origine 的冗余文件（js、css）
 * @param dir {string} 可能有冗余文件的 assets 目录
 */
async function removeRedundantFiles(dir) {
    // 找冗余的index文件
    const getFileList = new Promise((resolve) => {
        fs.readdir(dir, (err, result) => {
            resolve(result);
        });
    })
    const fileList = await getFileList;
    logger.debug('可能存在冗余文件的目录内容：', fileList);
    // 获取每个文件的修改时间
    const fileInfoList = [];
    const promiseList = [];
    fileList.forEach(e => {
        promiseList.push(new Promise((resolve) => {
            fs.stat(`${dir}/${e}`, (err, result) => {
                fileInfoList.push({name: e, result: result.mtimeMs});
                resolve();
            })
        }))
    });
    await Promise.all(promiseList);
    logger.debug('文件信息', fileInfoList);

    // 删除多余的 css 文件
    const cssFileList = fileInfoList.filter(e => {
        return e.name.match(/index.*.css/g);
    })
    // 判断个数，如果文件数大于1，则代表有冗余
    if (cssFileList.length > 1) {
        cssFileList.sort((a, b) => b.result - a.result);
        logger.debug('可能冗余的css文件', cssFileList);
        // 删除除第一个以外的其他文件
        const deleteList = [];
        for (let i = 1; i < cssFileList.length; i++) {
            deleteList.push(`$dir/${cssFileList[i]}`);
        }
        deleteList.forEach(e => {
            webgalDelete(e);
        })
    }

}

module.exports = removeRedundantFiles;
