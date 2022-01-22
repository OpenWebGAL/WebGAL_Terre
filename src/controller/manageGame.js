const express = require('express');
const manageGame = express.Router();
const getGameList = require("../service/getGameList")

manageGame.get('/gameList', async (req, res) => {
    let gameList;
    gameList = await getGameList();
    res.send(gameList);
})

manageGame.get('/test', (req, res) => {
    res.send('ManageGame Test OK!');
})

module.exports = manageGame;