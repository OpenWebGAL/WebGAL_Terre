const fs = require('fs');

const mkDir = (current, Name) => {
    const root = './public/Games/';
    const dirToMake = root + current + '/' + Name;
    console.log(dirToMake);
    return new Promise(r => {
        fs.mkdir(dirToMake, () => {
            r('OK');
        })
    })
}

module.exports = mkDir;