---
date: 2023-07-19
title: Waline-评论系统
category: 
  - GitHub
tag:
  - GitHub
head:
  - - meta
    - name: keywords
      content: Waline,Vue,评论系统,部署,GitHub
  - - meta
    - name: description
      content: Waline一款简单、安全且拆箱即用的评论框架，以下是它的部署使用即注意要点
---
# Waline

一款简单、安全且拆箱即用的评论框架，以下是它的部署使用即注意要点

## 注册LeanCloud数据库 

[登录](https://console.leancloud.app/login) 或 [注册](https://console.leancloud.app/register)

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-18/1e12f689-0d40-4541-8dfc-ff2ea3705c93.png)

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-18/61d6e93a-d477-49ce-874d-4275a353cff9.png" style="zoom: 67%;" />

点击应用，打开左上角，设置 > 应用凭证

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-18/e817f810-16f2-4e44-993c-c16ad7b4e8d7.png" style="zoom: 50%;" />

将 `AppID`、`AppKey` 、`MasterKey`，保存记录

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-18/a084612c-c3f9-41b0-8269-1be54b44631a.png)

此外，虽然官方有说国内版本需要备案域名，绑定域名接入。但是在LeanCloud可以不进行设置，域名绑定在后续环节。

##  Vercel 部署

[
![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwalinejs%2Fwaline%2Ftree%2Fmain%2Fexample)

