const fs = require('fs');
const logger = require("../extend/logger");

const uploadFile = (fileName, destination, orgin) => {
    logger.info(fileName);
    let copyTo = './public/Games/'+destination+'/' + fileName;
    logger.info(copyTo);
    logger.info(orgin);
    return new Promise(resolve => {
        fs.cp(orgin, copyTo, () => {
            deleteOrgin();
        });

        function deleteOrgin() {
            fs.unlink(orgin, () => {
                resolve('OK');
            })
        }
    })
}

module.exports = uploadFile;