const fs = require('fs');

const mkDir = (current, Name) => {
    const root = './public/Games/';
    return new Promise(r => {
        fs.mkdir(root + current + '/' + Name, () => {
            r('OK');
        })
    })
}

module.exports = mkDir;