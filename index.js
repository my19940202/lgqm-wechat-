// 临高启明微信公众号采用主动回复, 调用大模型回复用户问答
const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
const {PORT = 8800, MOD = 'prod'} = process.env;
const {sendInitiativeMsg, resLlmMsg, isHitKeyworkd, resDefMsg} = require('./util');
const lastAnswerTime = {};
// 设置模板引擎
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// // 设置静态文件
// app.use(express.static(path.join(__dirname, 'public')));

// 消息回复
app.post('/', async (req, res) => {
    const appid = req.headers['x-wx-from-appid'] || '';
    const {ToUserName, FromUserName, MsgType, CreateTime, Content, Event} = req.body;
    if (MsgType === 'text') {
        // 命中原平台关键词回复的策略，不走大模型
        const isHit = isHitKeyworkd(Content, Event);
        if (isHit) {
            res.send('success');
        }
        else {
            // 如果快速提问(间隔小于30秒) 提示需要等待
            if (lastAnswerTime[FromUserName] && (+new Date() < lastAnswerTime[FromUserName] + 1000 * 30)) {
                console.log('wait for 30s');
                res.send({
                    ToUserName: FromUserName,
                    FromUserName: ToUserName,
                    CreateTime: CreateTime,
                    MsgType: 'text',
                    Content: '问太快啦，请稍等一会儿再试'
                });
                return;
            }
            lastAnswerTime[FromUserName] = new Date().getTime();
            const result = await resLlmMsg(Content);
            // 使用race处理大模型超时，则发送兜底回复
            await Promise.race([
                sendInitiativeMsg(appid, {
                    touser: FromUserName,
                    msgtype: 'text',
                    text: {content: result}
                }),
                resDefMsg(30)
            ]);
            res.send('success');
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
    console.log('lgqm msg service is running = ' + MOD)
});
