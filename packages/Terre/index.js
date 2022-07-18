//initialize
const Port = 3001;//设置端口号，一般是80
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors');
const api = require('./src/router')
const open = require('open')
process.env.PORT = `${Port}`;

/**
 * socket 部分，使用9999 端口
 */
const ws = require('ws');
const logger = require("./src/extend/logger");
const removeRedundantFiles = require("./src/util/removeRedundantFiles");
const wsServer = new ws.WebSocketServer({port: 9999});

const connectionList = [];

wsServer.on('connection', (conn) => {
    logger.info('ws已连接');
    connectionList.push(conn);
    conn.on('message', (data) => {
        const str = data.toString();
        logger.info('WS收到：', str);
        connectionList.forEach(e => {
            e.send(str);
        })
    })
})
// app.use('/', express.static(__dirname + '/public', {
//     setHeaders: (res => {
//         res.set('Access-Control-Allow-Origin', '*');
//     })
// }));//allow browser access resources

//allow browser access resources

express.static.mime.define({'application/x-javascript': ['js']});
express.static.mime.define({'text/css': ['css']});

app.use('/', express.static('public', {
    setHeaders: (res => {
        res.set('Access-Control-Allow-Origin', '*');
    })
}));

app.use('/Games/:gamename/game/', express.static('public/Games/:gamename/game', {
    setHeaders: (res => {
        res.set('Access-Control-Allow-Origin', '*');
    })
}))

app.use('/Games/:gamename/', express.static('WebGAL_Template', {
    setHeaders: (res => {
        res.set('Access-Control-Allow-Origin', '*');
    })
}))


app.use(cors());//允许跨域访问
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false, uploadDir: './uploads'}))
// parse application/json
app.use(bodyParser.json())

//err catch
process.on('uncaughtException', function (err) {
}) //监听未捕获的异常
process.on('unhandledRejection', function (err, promise) {
}) //监听Promise没有被捕获的失败函数

app.use('/api', api);

app.listen(Port, () => console.log('已就绪，请访问：' + `http://localhost:${Port}/`))//输出服务器启动信息
console.log('WebGAL Terre 1.2.7');
console.log('Github: https://github.com/MakinoharaShoko/WebGAL ');
console.log('Made with ❤ by MakinoharaShoko');
open(`http://localhost:${Port}/`);

// removeRedundantFiles('WebGAL_Template/assets');
// removeRedundantFiles('public/assets');

module.exports = app;
