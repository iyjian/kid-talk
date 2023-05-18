const Proxy = require("static-web-proxy");
const path = require("path");

const proxy = new Proxy({
  proxy: [
    {
      host: "api",
      scheme: "http",
      port: 3000,
      targetPath: "/",
      path: "/api",
    },
    {
      host: "api",
      scheme: "http",
      port: 3000,
      targetPath: "/socket.io",
      path: "/socket.io/",
    }
  ],
  web: {
    dir: path.join(__dirname, "/dist"), //静态网站目录
    index: "index.html", //初始页面文件
  },
  bind: {
    host: "0.0.0.0",
    port: 3001,
  },
});

proxy.start();
