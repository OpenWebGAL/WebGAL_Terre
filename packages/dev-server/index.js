const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
app.set("port", "80");

app.all("*", function(req, res, next) {
  // 解决跨域问题
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    res.send(200);
  } else {
    next();
  }
});

app.use(createProxyMiddleware("/api", {
  target: "http://localhost:3001",// http代理跨域目标接口
  changeOrigin: true
}));

app.use(createProxyMiddleware("/games", {
  target: "http://localhost:3001",// http代理跨域目标接口
  changeOrigin: true,
}));

app.use(createProxyMiddleware("/", {
  target: "http://localhost:3000",// http代理跨域目标接口
  ws:true,
  changeOrigin: true
}));

app.listen(app.get("port"), () => {
  console.log(`反向代理已开启，端口：${app.get("port")}`);
});
