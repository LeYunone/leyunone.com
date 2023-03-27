---
date: 2023-03-28
title: MQTT-SpringBoot-使用
category: 
  - 消息队列
tag:
  - Mq、MQTT、IOT
head:
  - - meta
    - name: keywords
      content: MQTT,物联网,通讯协议,iot
  - - meta
    - name: description
      content: 。MQTT协议是轻量、简单、开放和易于实现的，这些特点使它适用范围非常广泛。在很多情况下，包括受限的环境中，如：机器与机器（M2M）通信和物联网。
---
>  前篇介绍了MQTT的基本知识与其特性 [MQTT协议入门](https://leyunone.com/frame/messagequeuing/MQTT-about.html)

# 使用

## 消息服务器

首先需要安装一个消息服务器作为MQTT协议的仓库

这里推荐使用 [EMQX](https://www.emqx.io/docs/zh/v4.4/getting-started/getting-started.html#%E5%AE%89%E8%A3%85-emqx)

EMQX 是一款大规模可弹性伸缩的云原生分布式物联网 MQTT 消息服务器。

作为全球最具扩展性的 MQTT 消息服务器，EMQX 提供了高效可靠海量物联网设备连接，能够高性能实时移动与处理消息和事件流数据，帮助您快速构建关键业务的物联网平台与应用。

![](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-27/caaa4505-dbe6-45cd-b7fe-3965ddc34b40.png)

### docker安装

1、获取 Docker 镜像

```bash
docker pull emqx/emqx:latest
```

2、启动 Docker 容器

```bash
docker run -d --name emqx -p 1883:1883 -p 8081:8081 -p 8083:8083 -p 8084:8084 -p 8883:8883 -p 18083:18083 emqx/emqx:latest
```

记得开放18083【页面】1883【MQTT协议】8081【页面API接口】8083【MQTT-WebSocket】8084【MQTT-SSl】端口

访问IP:18083，检查是否进入到EMQ Dashboard页面，账号密码默认：admin / public

![](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-27/6e5de4b6-460a-45ef-af66-a685f4ef0599.png)

## 客户端连接使用

**接下来，将以Java语言进行操作**
