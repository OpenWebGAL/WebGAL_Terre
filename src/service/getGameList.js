const {readdir} = require('fs');
const logger = new (require('cloudlogjs'))();

const getGameList = () => {
    return new Promise((resolve) => {
        readdir("./public/Games/", (err, data) => {
            if (err) throw err;
            logger.info('获取到的目录：', data);
            resolve(data);
        });
    })
}

module.exports = getGameList;