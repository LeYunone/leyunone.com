---
date: 2023-05-04
title: Skywalking源码系列-探针
category: 
  - Skywalking
  - 源码阅读
tag:
  - Skywalking
  - 源码
head:
  - - meta
    - name: keywords
      content: skywalking,源码阅读
  - - meta
    - name: description
      content: skywalking 8.6.0 版本源码阅读，探针分析
---
# Skywalking源码系列-探针 

## 下载源码

![image-20230504234100016](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-04/4cbefd50-3719-4712-8063-db0e2dbabb2e.png)

[https://github.com/apache/skywalking](https://github.com/apache/skywalking)

Fork下来的时候，记得别勾上框框中的选项，不然看不到其他版本代码

**切换版本**

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-04/a40861a0-898d-4160-bee5-f39f6e422c72.png)

![image-20230504234448065](C:/Users/leyuna/AppData/Roaming/Typora/typora-user-images/image-20230504234448065.png)

本次使用的是8.6版本的skywalking

## 模块分析

## agent分析

入口：**SkyWalkingAgent**

了解过Java探针的同学应该都明白，Skywalking是一款探针型注入式的链路追踪框架，所以使用他，需要手动的去引用Skywalking-agent。

