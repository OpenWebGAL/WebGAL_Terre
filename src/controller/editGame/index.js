const express = require('express');
const getAssets = require("./getAssets");
const addAsset = require("./addAsset");
const mkDir = require("../../service/mkDir");
const addScene = require("../../service/addScene");
const writeScene = require("../../service/writeScene");
const logger = require("../../extend/logger");
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

editGame.post('/editScene', async (req, res) => {
    logger.info('开始更新场景');
    logger.info('场景数据：', req.body['sceneData']);
    logger.info('场景名称：' + req.body['sceneName'].substring(0, req.body['sceneName'].length - 5))
    const gameName = req.body['gameName'];//游戏名称
    const sceneName = req.body['sceneName'].substring(0, req.body['sceneName'].length - 5);//场景名称
    const sceneData = req.body['sceneData'];//场景数据
    const result = await writeScene(gameName, sceneName, sceneData);
    res.send(result);
})

module.exports = editGame;