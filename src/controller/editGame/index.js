const express = require('express');
const getAssets = require("./getAssets");
const addAsset = require("./addAsset");
const mkDir = require("../../service/mkDir");
const editGame = express.Router();

editGame.get('/test', (req, res) => {
    res.send('Test Edit OK');
})

editGame.use('/getAssets', getAssets);
// 上传文件资源
editGame.use('/addAsset', addAsset);

editGame.post('/mkdir', async (req, res) => {
    const result = await mkDir(req.body['current'], req.body['Name']);
    res.send(result);
})

module.exports = editGame;