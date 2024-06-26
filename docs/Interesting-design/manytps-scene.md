# TPS(系统吞吐量)达到瓶颈

## 前言

逛知乎的时候，刷到了一篇文章：[物联网Java项目, 2万多TPS如何处理?](https://www.zhihu.com/question/655958909)

因为目前接触的项目正是物联网Java项目，所以对这个提问中的回答有一些内行人的理解和赞同；

于是针对这个问题，当项目中TPS量遇到瓶颈时，有什么公式化的应对手段；

## 问题

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-07-02/1.png)

复刻简化一下提到的知乎提问：

**项目原本为一个用户每30s发送一条状态信息给系统，系统进行数据落库；现如今需改成每1s发送一条状态信息给系统**

于是随着用户量的增大，系统将面临如下问题：

1. 系统吞吐量不够，消费上报的信息跟不上生产速度
2. 服务器带宽压力，假设每个用户上报一条数据为10KB，有1W个用户，那么每秒会出现近100Mb带宽耗损。
3. 接入层达到瓶颈时，延时，重试等衍生问题
4. ...

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-07-02/2.png)

## 方案

**回到问题，首先要知道2万的TPS在物联网处理方案中是一个非常常见且已经有了最佳实例方案的场景，因此在如今的角度上看有非常非常多的方式去解决提高系统吞吐量的手段**

首先是回答这个提问的第一反应方案：

**框架与工具**：Redis，Mysql，MongoDB，InfluxDB，Nginx，Kafka

**Redis：** 存储基本信息的缓存，以及存储上一次上报数据的hash以作对比是否需要更新

**Mysql**：记录基本信息内容

**MongoDB**： 构建实时状态模型

**influxDB**： 存储时序数据，比如每秒帧数据的实际落库点

**Nginx**： 负载均衡

**Kafka：** 时序数据业务分流

具体链路如下：

1. 每条数据最先经过边缘计算，根据缓存内容以及具体模型判断是否捕捉数据
2. 基本信息更新直接落库，Mysql+Redis，缓存数据一致性策略：延时双删
3. 属性状态更新直接落库，MongoDB，构建模型
4. 将时序数据推入Kafka中，另一系统消费 = 每帧数据记录
5. ...

大致如上，其中包括对每秒数据的处理与流向落库的方式，省略了后续的查询，数据同步...，因为这涉及到的是另一个问题了。

同时还可以进一步优化：

1. 使用单机应用纯内存处理缓存，适用小范围部署时的微集群方案
2. 程序中更多的使用异步式的响应式编程，提高主线程流动率
3. 堆服务器，软的不行来点硬的
4. ...

**以上是看到提问后的第一反应，很多地方都象征性的跳过，在看了各位大牛的回答后总结了如下的新方案**

框架不变，目前感觉大部分物联网项目都是 `关系型数据库` + `时序数据库` + `大数据` + `非关系型数据库` 的组合

因此主要总结的是思路与求同存异；

**思路一：** 设备（用户） 自行处理上报频率

这一点在不同的人的角度上有不同的见解；