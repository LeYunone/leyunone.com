---
date: 2024-06-02
title: 消息队列的选型
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: Java、消息队列
---
# 消息队列的选型

现时代中可供我们选择的消息队列组件不少也不多，在国内环境中，大多数企业需要考虑的组件往往只需要在`RabbitMQ` 、`RocketMQ`、`Kafka`中选择；

为此针对以上三者在何种系统何种业务下是最佳选型，此篇记录；

## 消息队列的任务是什么

消息队列作为分布式系统中非常重要的一环，它需要做到的事却非常简单，概括为两个：`解耦`、`异步`

**解耦：** 拆解流程，上游生产，下游发送；

**异步：** 拆解流程，上游为过去，下游为现在；

即由业务方发送一条消息，消费方何时消费，如何消费，都不需要关注，各方只需做好自己的工作；

由于发布-订阅模式的因素，消息队列都天生满足以上两点；

由此各大组件都为了自己的核心竞争力，在缓存、性能、高可用...上下足了手脚，这也是各大组件虽然都是消息队列组件但选型上又存在非常大差异的原因；

## 三大组件选型

选型前，先简单的了解以下三个组件`RabbitMQ` 、`RocketMQ`、`Kafka`的现状；

使用量：`RabbitMQ`  >  `RocketMQ` > `Kafka`

活跃度：`RabbitMQ`  >  `Kafka` >  `RocketMQ`

开源度：`RocketMQ`  >  `RabbitMQ` >  `Kafka`

其中RocketMQ是由alibaba采用JAVA语言开源出来的组件；

### RabbitMQ

RabbitMq采用`Erlang `语言开发，因此其插件和内部性能的扩展与增强都只能通过社区上开源的插件或定制版本实现（国内很少有Erlang 工程师的岗位）；

不过由于`RabbitMq`的社区活跃度的问题，现如今存在大量的插件可供各式各样的业务需求直接使用，这也间接降低了它的学习与使用门槛。

首先列出它的所有特点：

1. 兼容目前主流的所有编程语言：Java、C、C+、C#、PHP、Py...
2. 通过交换机、路由、key可以非常灵活的分配生产者与消费者
3. 提供死信，延时队列和ack机制等业务功能
4. 常态万级吞吐量

不过它被大多数中小公司青睐的原因主要是：

1. 插件直接使用的手法，比如延时队列插件
2. 基于内存的小吞吐量在数据量小的环境下，性能最高
3. 版本迭代稳定

### RocketMQ

作为Java开发，它在国内环境中已经高出其他组件太多了，~~因为中国的Java程序员数量~~；

首先，RocketMq是阿里巴巴参考Kafka的架构，又在基础上进行调整，最后贯通RabbitMq设计出来的 ~~缝合怪~~，因此非常的很强大；

对比RabbitMq，它在性能以及基础功能上有着绝对的优势；

不过劣势有很明显，

- 一是社区活跃度非常非常低，并且我们如今使用的版本有理由怀疑是阉割版；
- 二是无法应对消息路由转向的场景；
- 三是不支持很多语言的使用

但是只在Java领域使用，如果一个系统未来的前景是往好的方向，那么其吞吐量远大于RabbitMq就表明在两者之间熟好

### Kafka

`kafka`很少出现在大众的视野中，不是它小众，而是它服务的领域比较 "高端"；

kafka功能非常简单，发-收；没有任何的业务性功能，延时、ack、 路由...

因此只保留消息队列功能的它非常的轻便，消息吞吐量可以达到百万级之上；所以服务的系统，只有两种：

- 日志、文本采集
- 大数据统计

除此之外的系统选用kafka，会被其没有延时队列，没有消费事务等本不需要开发人员考虑的事给狠狠教训到；

这里需要提醒的是，kafka集群在早期版本与zookeeper强行绑定，非常重；

后续更新中，默认取消了zookeeper默认作为集群间通信的节点组件

## 表格

| 组件     | 系统             | 吞吐量 | 扩展性 | 基本功能 | 覆盖语言协议 |
| -------- | ---------------- | ------ | ------ | -------- | ------------ |
| RabbitMQ | 业务系统         | 万     | 靠社区 | 满足大多 | 几乎所有主流 |
| RocketMQ | 业务系统         | 十万   | 靠自己 | 满足大多 | Java         |
| Kafka    | 采集、大数据系统 | 百万   | 无     | 满足收发 | 几乎所有主流 |

