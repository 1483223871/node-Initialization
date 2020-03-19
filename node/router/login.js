const router = require("express").Router();
let query = require('../util/mysqlDB.js');
let db = require('../util/redis.js');
let jwt = require('jsonwebtoken');
var md5 = require('md5-node'); //加密
router.get("/login", async function (req, res) {
    try {
        let name = ''
        let password = ''
        if (req.body.name && req.body.password) {
            name = req.body.name;
            password = md5(req.body.password); //密码加密
            let SQL = "";
            let user = await query(SQL); //查询用户信息
            if (user && user.length > 0) {
                user = user[0]
            } else {
                user = null
            };
            if (!user) { //判断用户是否存在
                return res.json({
                    status: 200,
                    data: null,
                    message: '用户不存在'
                });
            };
            // 存在对比密码是否正确
            if (user.password === password) {
                let content = {
                    id: user.id
                }
                let secretOrPrivateKey = "token" // 这是加密的key（密钥） 
                let token = jwt.sign(content, secretOrPrivateKey, {
                    expiresIn: 60 * 60 * 12
                });
                db.set(user.id, token, '60*60*24')//将token存入redis中
                return res.json({status: 200,data:{token: token}, message: 'success'})
            }else{
                return res.status(401).json({message:"passwords did not match"});
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: `系统异常:${error}`
        });
    }
})
module.exports = router;