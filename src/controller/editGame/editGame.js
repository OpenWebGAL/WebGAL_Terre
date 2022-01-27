const express = require('express');
const getAssets = require("./getAssets");
const addAsset = require("./addAsset");
const editGame = express.Router();

editGame.get('/test',(req,res)=>{
    res.send('Test Edit OK');
})

editGame.use('/getAssets',getAssets);
// 上传文件资源
editGame.use('/addAsset', addAsset);

module.exports = editGame;