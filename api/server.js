const express = require('express');
const bodyParser = require('body-parser');
// bodyParser变量是对中间件的引用。请求体解析后，解析值都会被放到req.body属性，内容为空时是一个{}空对象。
const request = require('request');
const path = require('path');
const walk = require('klaw-sync');
const config = require("../vue.config");


const origin_proxy_url = "http://origin_proxy_url.jdcloud.com";
const local_proxy_port = 3002;
const local_proxy_url = `http://localhost:${local_proxy_port}`;



const app = express();

//  创建 application/x-www-form-urlencoded 解析 :解析UTF-8的编码的数据
app.use(bodyParser.urlencoded({ extended: false })); 
// 当设置为false时，会使用querystring库解析URL编码的数据；当设置为true时，会使用qs库解析URL编码的数据。后没有指定编码时，使用此编码。默认为true


// create application/json parser
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let _existRoutes = [];
app.use((req, res, next) => { //TODO post和上传还有问题
  const { url, body, method } = req;
  if (!~_existRoutes.indexOf(req.path)) {
    const rurl = origin_proxy_url.replace(/\/$/, '') + url;
    let r = method === 'POST'
      ? request.post({ url: rurl, form: body }, (err, httpRes, reqBody) => {
        console.log(err, reqBody, body)
      })
      : request(rurl);
    console.log(`本地未定义的请求，跳转到 ${method} ${rurl}`);
    req.pipe(r).pipe(res);
    return;
  }
  next();
});

//遍历本目录下的 *.api.js
walk(path.resolve('./'))
  .filter(p => /\.api\.js$/.test(p.path))
  .map(p => p.path)
  .forEach(part => require(part)(app));


//全局配置，只在应用启动时读取一次


//记录注册过的路由
_existRoutes = app._router.stack.filter(s => s.route).map(s => s.route.path);

app.listen(local_proxy_port, () => {
  console.log(`\n\n local server running at ${local_proxy_url} \n\n`);
});