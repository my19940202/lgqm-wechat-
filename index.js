// 临高启明微信公众号采用主动回复, 调用大模型回复用户问答
const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
const {PORT = 8800} = process.env;
const {sendInitiativeMsg, resLlmMsg} = require('./util');

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// 设置静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 消息回复
app.post('/', async (req, res) => {
    const appid = req.headers['x-wx-from-appid'] || '';
    const {ToUserName, FromUserName, MsgType, CreateTime, Content, Event} = req.body;
    const condition = Event === 'subscribe';
    if (MsgType === 'text') {
        // 命中原平台关键词回复的策略，不走大模型
        if (condition) {
            console.log('aaa');
        }
        else {
            const result = await resLlmMsg(Content);
            await sendInitiativeMsg(appid, {
                touser: FromUserName,
                msgtype: 'text',
                text: {content: result}
            });
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

// 选择页面
app.get('/auto-make-article', (req, res) => {
    res.render('article', {title: '自动化生成每日临高宇宙新闻'});
});

app.listen(PORT, function(){
    console.log('lgqm msg service is running')
});
