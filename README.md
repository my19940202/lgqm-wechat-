# 临高启明的微信公众号自动回复接入大模型

## ✅ 接入大模型 
目前已经支持ready，但是影响了之前的默认关键词回复，体验不大好

## ❌ 保证原来的关键词回复不失效
需要把之前默认关键词回复 补齐

## ❌ 支持文章自动化生成
需要想下如何把文章自动化生成，搞起来


## 启动办法
```
docker run -p 8800:8800 -it -v /Users/xishengbo/Desktop/dev.tmp/git_repo/lgqm-wechat-ghz:/app dockette/nodejs:v18 sh
```

## 参考资料
- [微信接口调研](./微信回复调研.md)