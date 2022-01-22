const express = require('express');
const app = express.Router();
const manageGame = require('./controller/manageGame')

//测试
app.get('/test', (req, res) => {
    res.send('API Test OK!');
});

app.use('/manageGame', manageGame);

module.exports = app;