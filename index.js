//initialize
const Port = 80;//设置端口号，一般是80
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors');
const api = require('./src/router')
process.env.PORT = `${Port}`;

app.use('/', express.static(__dirname + '/public', {
    setHeaders: (res => {
        res.set('Access-Control-Allow-Origin', '*');
    })
}));//allow browser access resources
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

app.listen(Port, () => console.log('服务器已就绪，运行在端口' + Port))//输出服务器启动信息

module.exports = app;