const express = require('express');
const getAssets = require("./getAssets");
const addAsset = require("./addAsset");
const mkDir = require("../../service/mkDir");
const addScene = require("../../service/addScene");
const editGame = express.Router();

editGame.get('/test', (req, res) => {
    res.send('Test Edit OK');
})

editGame.use('/getAssets', getAssets);
// 上传文件资源
editGame.use('/addAsset', addAsset);

//创建新目录
editGame.post('/mkdir', async (req, res) => {
    const result = await mkDir(req.body['current'], req.body['Name']);
    res.send(result);
})

editGame.post('/addNewScene', async (req, res) => {
    const gameName = req.body['gameName'];
    const sceneName = req.body['sceneName'];
    const result = await addScene(gameName, sceneName);
    res.send(result);
})

module.exports = editGame;