// 被动回复
const express = require('express');
const app = express();
app.use(express.json());

const {PORT = 8800} = process.env;
const {resDefMsg4s, resLlmMsg} = require('./util');
let cacheResultMap = {};

app.post('/', async (req, res) => {
    console.log('/消息推送', req.body);
    res.send('success');
});

app.get('/cache', (req, res) => {
    res.json(cacheResultMap);
});

app.all('/chat', async (req, res) => {
    const appid = req.headers['x-wx-from-appid'] || '';
    console.log(appid, '/chat消息推送', req.body)
    let {ToUserName, FromUserName, MsgType, CreateTime, Content} = req.body;
    Content = Content.trim();
    if (MsgType === 'text') {
        const msgData = {
            ToUserName: FromUserName,
            FromUserName: ToUserName,
            CreateTime: CreateTime,
            MsgType: 'text'
        };

        // 命中消息缓存 直接缓存消息回复
        if (Content === '1') {
            res.send({
                ...msgData,
                Content: cacheResultMap[ToUserName] || '小书虫没找到答案，请稍后再重试'
            });
        }
        else {
            // 微信公众号需要5秒nei回复，暂时先采用race方式
            // 如果大模型5秒内回复，正常交互
            // 如果超过5秒，使用回复1进行交互得到答案
            const result = await Promise.race([
                resLlmMsg(Content, ToUserName, cacheResultMap),
                resDefMsg4s(msgData)
            ]);
            res.send({
                ...msgData,
                Content: result
            });
        }
    }
    else {
        res.send({
            ToUserName: FromUserName,
            FromUserName: ToUserName,
            CreateTime: CreateTime,
            MsgType: 'text',
            Content: '暂不支持非文字类信息回复'
        });
    }
});

app.listen(PORT, function(){
    console.log('passive msg service is running')
})
