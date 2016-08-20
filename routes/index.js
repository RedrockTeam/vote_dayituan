'use strict';

const express       = require('express');
const getVoteInfo = require('./get_vote_info.js');
const router        = express.Router();

// 微信 api
const WX            = require('./WX.js');


let code   = '',
    openid = '';

// 获取 code 和 openid
router.get('/', (req, res, next) => {

    code = req.query.code;
    openid = req.session.openid;

    next();
});

// 检查是否有 code
router.get('/', (req, res, next) => {
    if(!code) {
        WX.getCode(req, res);
    } else {
        next();
    }
})

// 获取 openid
router.get('/', (req, res, next) => {
    if(!openid) {
        WX.getOpenid(code)
        .then((body) => {
            body = JSON.parse(body);
            req.session.openid = body.data.openid;
            return WX.getTicket(req, res)
        })
        .then((data) => {
            req.JSSDK = data;
            next();
        })
        .catch(e => console.log(e));
    } else {
        next();
    }
})

// 渲染页面
router.get('/', (req, res, next) => {
    getVoteInfo((voteInfo) => {
        res.render('index', {
            JSSDK: req.JSSDK,
            song_works: voteInfo.song_works,
            preside_works: voteInfo.preside_works,
            time: (new Date()).getTime().toString()
        });
    })
});

module.exports = router;
