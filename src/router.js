const express = require('express');
const app = express.Router();
const manageGame = require('./controller/manageGame')
const editGame = require("./controller/editGame/editGame");

//测试
app.get('/test', (req, res) => {
    res.send('API Test OK!');
});

app.use('/manageGame', manageGame);

app.use('/editGame',editGame);

module.exports = app;