const express = require('express');
const manageGame = express.Router();
const getGameList = require("../service/getGameList")
const createNewGame = require("../service/createNewGame");

manageGame.get('/gameList', async (req, res) => {
    let gameList;
    gameList = await getGameList();
    res.send(gameList);
})

//测试游戏管理api
manageGame.get('/test', (req, res) => {
    res.send('ManageGame Test OK!');
})

// 创建新游戏：将模板复制到新建的游戏目录下
manageGame.get('/createGame/*', async (req, res) => {
    let url = req.url;
    url = url.split('/');
    let gameName = url[url.length - 1];
    console.log(gameName);
    let createResult;
    createResult = await createNewGame(gameName);
    if (createResult) {
        res.send('OK')
    } else {
        res.send('AlreadyExist');
    }
})

// 上传文件资源，并写入文件资源的map中


module.exports = manageGame;