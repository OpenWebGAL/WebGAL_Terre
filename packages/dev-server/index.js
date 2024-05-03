const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { env } = require("process")

const app = express();
app.set("port", "80");

app.all("*", function (req, res, next) {
  // 解决跨域问题
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    res.send(200);
  } else {
    next();
  }
});

let WEBGAL_PORT = 3000; // default port
if (env.WEBGAL_PORT) {
  WEBGAL_PORT = Number.parseInt(env.WEBGAL_PORT);
}

app.use(
  createProxyMiddleware("/api", {
    target: `http://localhost:${WEBGAL_PORT + 1}`, // http代理跨域目标接口
    changeOrigin: true,
      ws:true
  })
);

app.use(
    createProxyMiddleware("/template-preview", {
        target: `http://localhost:${WEBGAL_PORT + 1}`, // http代理跨域目标接口
        changeOrigin: true,
    })
);

app.use(
  createProxyMiddleware("/games", {
    target: `http://localhost:${WEBGAL_PORT + 1}`, // http代理跨域目标接口
    changeOrigin: true,
  })
);

app.use(
    createProxyMiddleware("/templates", {
        target: `http://localhost:${WEBGAL_PORT + 1}`, // http代理跨域目标接口
        changeOrigin: true,
    })
);

app.use(
  createProxyMiddleware("/", {
    target: `http://localhost:${WEBGAL_PORT}`, // http代理跨域目标接口
    ws: true,
    changeOrigin: true,
  })
);

app.listen(app.get("port"), () => {
  console.log(`反向代理已开启，端口：${app.get("port")}`);
});
