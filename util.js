// 工具函数

const request = require('request');
const API = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/plugin/3pyn7rz4zmzdffp7/?access_token=';
const {AK, SK} = process.env;
const {keywordList} = require('./constant');

function safeParseJSON(str) {
    try {
        let ret = JSON.parse(str);
        if (ret === null) {
            return {};
        }
        return ret;
    } catch (e) {
        return {};
    }
}

async function baiduBot(content) {
    if (content) {
        const access_token = await getAccessToken();
        const options = {
            method: 'POST',
            url: API + access_token,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: content.trim(),
                plugins: ['uuid-zhishiku'],
                verbose: true,
                llm: {
                    temperature: 0.7,
                    top_p: 1,
                    max_output_tokens: 400
                }
            })
        };
        return new Promise((resolve, reject) => {
            try {
                request(options, (error, response) => {
                    if (error) {
                        reject({result: '服务繁忙，稍后回复'});
                    }
                    else {
                        const ret = safeParseJSON(response.body);
                        console.log('ret', ret);
                        ret && ret.result && resolve(safeParseJSON(response.body));
                    }
                })
            } catch (error) {
                reject({result: '服务繁忙，稍后回复'});
            }
        })
    }
}

async function qianfanSdkBot(content) {
    if (content) {
        console.time('qianfansdk')
        const options = {
            method: 'POST',
            // 还是写公网地址 内网地址无法访问
            url: 'http://qianfan-appbuilder-70138-4-1319072486.sh.run.tcloudbase.com/chat',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                msg: content,
                appid: 'f3aff6e7-9fd6-4d17-939e-d6065a133bf3'
            })
        };
        return new Promise((resolve, reject) => {
            try {
                request(options, (error, response) => {
                    if (error) {
                        reject({result: '服务繁忙，稍后回复'});
                    }
                    else {
                        const ret = safeParseJSON(response.body);
                        console.log('ret', ret);
                        ret && ret.data && resolve(ret.data);
                        console.timeEnd('qianfansdk')
                    }
                })
            } catch (error) {
                reject({result: '服务繁忙，稍后回复'});
            }
        })
    }
}

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
function getAccessToken() {
    const options = {
        method: 'POST',
        url: [
            'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials',
            `&client_id=${AK}`,
            `&client_secret=${SK}`
        ].join('')
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(JSON.parse(response.body).access_token);
            }
        })
    })
}

function resDefMsg(second) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('服务器太火爆了🤔, 请10秒后再提提问试试');
        }, second * 1000);
    });
}

function resLlmMsg(text, cacheKey, cacheMap) {
    return new Promise(async (resolve, reject) => {
        const data = await qianfanSdkBot(text);
        if (data) {
            resolve(data);
            if (cacheKey && cacheMap) {
                cacheMap[cacheKey] = data;
            }
        }
        else {
            reject(0);
        }
    });
}

// 使用主动回复 发送回复消息
function sendInitiativeMsg(appid = 'wx1432d9c9b2205448', mess) {
    console.log('mess', mess);
    return new Promise((resolve, reject) => {
        request({
            method: 'POST',
            url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=${appid}`,
            body: JSON.stringify(mess)
        }, function (error, response) {
            if (error) {
                console.log('接口返回错误', error)
                reject(error.toString())
            } else {
                console.log('接口返回内容', response.body)
                resolve(response.body)
            }
        })
    })
}

function isHitKeyworkd(content, event) {
    return event === 'subscribe' || keywordList.some(word => content.includes(word));
}

module.exports = {
    baiduBot,
    safeParseJSON,
    resDefMsg,
    resLlmMsg,
    sendInitiativeMsg,
    isHitKeyworkd
}

