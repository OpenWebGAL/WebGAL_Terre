const fs = require('fs');

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

module.exports = {webgalMkdir, webgalCopy};
