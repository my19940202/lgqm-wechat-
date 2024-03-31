// 临高启明微信公众号采用主动回复, 调用大模型回复用户问答
const express = require('express');
const app = express();
// 引入mysql2库
const mysql = require('mysql2/promise');
const path = require('path');
app.use(express.json());
const {PORT = 8800, MOD = 'prod', password = '@xsb2024'} = process.env;
const {sendInitiativeMsg, resLlmMsg, isHitKeyworkd} = require('./util');

// 建立连接池
console.log({
    host: MOD === 'dev' ? 'sh-cynosdbmysql-grp-igrnwmoq.sql.tencentcdb.com' : '10.12.108.152',
    port: MOD === 'dev' ? 28177 : 3306,
    user: 'root',
    database: 'nodejs_demo',
    password: password,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

const pool = mysql.createPool({
    host: MOD === 'dev' ? 'sh-cynosdbmysql-grp-igrnwmoq.sql.tencentcdb.com' : '10.12.108.152',
    port: MOD === 'dev' ? 28177 : 3306,
    user: 'root',
    database: 'nodejs_demo',
    password,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// 设置静态文件
app.use(express.static(path.join(__dirname, 'public')));

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
app.get('/auto-make-article', async (req, res) => {
    // 执行查询
    const [rows, fields] = await pool.query('SELECT * FROM gzh_article_stat');

    res.render('article', {
        title: '自动化生成每日临高宇宙新闻',
        rows,
        fields
    });
});

app.listen(PORT, function(){
    console.log('lgqm msg service is running = ' + MOD)
});
