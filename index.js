//initialize
const Port = 80;//设置端口号，一般是80
const express = require('express');
const {fstat} = require('fs');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const {resolve} = require('path');
const {rejects} = require('assert');
process.env.PORT = `${Port}`;

app.use('/', express.static(__dirname + '/public'));//allow browser access resources
app.use(cors());//允许跨域访问
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// parse application/json
app.use(bodyParser.json())

//err catch
process.on('uncaughtException', function (err) {
}) //监听未捕获的异常
process.on('unhandledRejection', function (err, promise) {
}) //监听Promise没有被捕获的失败函数

const MongoUrl = "";

//测试
app.get('/api', (req, res) => {
    res.send('API Test OK!')
});

app.listen(Port, () => console.log('服务器已就绪，运行在端口' + Port))//输出服务器启动信息

module.exports = app;