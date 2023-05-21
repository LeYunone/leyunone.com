---
date: 2023-04-02
title: Rabbitmq-Delay-延迟消费队列
category: 
  - 消息队列
tag:
  - RabbitMQ
head:
  - - meta
    - name: keywords
      content: RabbitMQ,乐云一、延迟队列、消费
  - - meta
    - name: description
      content: RabbitMQ延迟消费的两种办法
---
# Rabbit延时消费方案实现

**业务背景：**

- 验证码业务，验证码过期时需要做回执处理【过期短信发送/日志记录/...】
- 订单业务【支付/办理/..】，一个订单时间后，做订正/查额/失效...等操作
- 推送服务，某些前置业务结束后，X分钟后进行推送判断；
- ...

## 实现

### 1\插件

**地址：**[https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases)

由于RabbitMq并不自带延时消费的功能，且延时消费对于消费队列来说并不保证百分百安全、可控。而且延时消费业务在设计上来说本身就不属于**RabbitMQ** 消费队列的设计理念；

不过产品是顺应时代发展而进化的，所以RabbitMQ在 **3.8** 版本衍生出 **rabbitmq-delayed-message-exchange** 插件。

#### 安装

