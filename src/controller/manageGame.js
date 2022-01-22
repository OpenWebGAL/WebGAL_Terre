const express = require('express');
const manageGame = express.Router();
const getGameList = require("../service/getGameList")
const createNewGame = require("../service/createNewGame");

manageGame.get('/gameList', async (req, res) => {
    let gameList;
    gameList = await getGameList();
    res.send(gameList);
})

manageGame.get('/test', (req, res) => {
    res.send('ManageGame Test OK!');
})

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

module.exports = manageGame;