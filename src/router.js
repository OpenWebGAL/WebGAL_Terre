const express = require('express');
const app = express.Router();

//测试
app.get('/', (req, res) => {
    res.send('API Test OK!');
});

module.exports = app;