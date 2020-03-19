var express = require("express");
var app = express();
var bodyParser = require('body-parser');
let path = require('path');
let query = require('./util/mysqlDB.js');
let db = require('./util/redis.js');
let jwt = require('jsonwebtoken');
let URL = require("url");
let createError = require('http-errors');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.listen(5001);
app.use("/upload", express.static('upload')); //配置静态目录
// 处理跨域
app.all("*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('X-Powered-By', '3.2.1');
    res.header('Cache-Control', 'no-store');
    if (req.method == "OPTIONS") {
        res.sendStatus(200).end();
    } else {
        next();
    }
});

//路由挂载之前，登录验证与鉴权
app.use("/", async function (req, res, next) {
    let currentUrl = URL.parse(req.url, true).pathname;
    let secretOrPrivateKey = "token"; // 这是加密的key（密钥）
    let token=req.header.token;
    if (!req.get('Authorization')) {
        //未携带token，游客身份
        //进一步判断请求接口是否为游客类开放接口
    }else{
        //请求携带token，效验token
        jwt.verify(token, secretOrPrivateKey, function (err, decode) {
            if (err) {
                res.send({
                    status: 403,
                    msg: '登录已过期,请重新登录'
                });
            } else {
                db.get(decode.id, function (err, result) {//redis获取token进行对比
                    if (result != token) {
                        res.send({
                            status: 403,
                            msg: '登录已过期,请重新登录'
                        });
                    } else {
                        next();                       
                    }
                })
            }
        });
    }

})
//挂载路由
app.use(require("./router/login"));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});