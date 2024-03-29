---
date: 2023-05-04
title: Skywalking源码系列1-开篇
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
# Skywalking-源码解析-开篇

>  将以最白话的方式记录SkyWalking源码阅读的过程

## 下载源码

![image-20230504234100016](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-04/4cbefd50-3719-4712-8063-db0e2dbabb2e.png)

[https://github.com/apache/skywalking](https://github.com/apache/skywalking)

Fork下来的时候，记得别勾上框框中的选项，不然看不到其他版本代码

**切换版本**

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-04/a40861a0-898d-4160-bee5-f39f6e422c72.png)

![image-20230504234448065](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-06/035a8431-2ae5-43bb-ad22-7c36155b99d6.png)

本次使用的是**8.6**版本的skywalking

## 模块分析

目前Skywalking的核心功能有：

- 服务关系拓扑图
- 服务实例与端点的依赖分析
- 链路追踪
- 报警
- 日志收集
- 性能剖析
- JVM状态分析
- 数据库访问状态，DB速度分析

Skywalking是一款插桩式的APM系统，遵循着代码0侵入的原则。

不过他的日志收集功能，则是基于logback模块进行配置，所以有用到日志收集的话还需要当logger的xml特殊配置

那么对于各功能的设计，根据官方给出的架构图：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-10/ee6ceb0e-d969-4750-88b1-5b92d4c19960.png)

主要由三部分组成： `Skywalking UI` 、  `Skywalking Agent` 、`Skywalking OAP` 组成

本次不解析UI，因为UI由专业的前端同事研究就好，我们专注他的探针agent以及收集oap服务

`Skywalking Agent`

关于探针的基本知识在这里就不赘叙了，有需要的可以看 [JAVA探针机制—Agent（一）](https://leyunone.com/java/java-agent-1.html)

了解Agent的基本定义与用法

`Skywalking` Agent

```java
public class SkyWalkingAgent{
        public static void premain(String agentArgs, Instrumentation instrumentation) throws PluginException {
            ....
        }
}
```

在源码位置，查看具体实现，其运行步骤及原理会在下一章进行详细解析。

**Skywalking** 采用多插件 微内核的架构，通过插件去做数据data的收集，由agent内核去管理与收集服务OAP进行交互。

`Skywalking-OAP`

OAP是Skywalking的服务端，作数据收集作用

```java
public class OAPServerBootstrap {
    ...
}
```

在源码位置，查看具体加载，其运行步骤同样后再后续进行详细解析

## Skywalking通讯方式

Skywalking目前只支持两种通讯方式：`GRPC`、`Kafka` 。

**GRPC**：

RPC设计中的一种，与HTTP和Restful的区别是：

后两种都需要涉及Json格式字符串，导致字节大小与性能耗时都比GRPC大

而GRPC的介绍网上都有优秀的文章说明：

```markdown
GRPC 内容交换格式采用ProtoBuf(Google Protocol Buffers)，开源已久，提供了一种灵活、高效、自动序列化结构数据的机制，作用与XML，Json类似，但使用二进制，（反）序列化速度快，压缩效率高。传输协议 采用http2，性能比http1.1好了很多，和很多RPC系统一样，服务端负责实现定义好的接口并处理客户端的请求，客户端根据接口描述直接调用需要的服务。客户端和服务端可以分别使用gPRC支持的不同语言实现。PrProtoBuf 具有强大的IDL（interface description language，接口描述语言）和相关工具集（主要是protoc）。用户写好.proto描述文件后，protoc可以将其编译成众多语言的接口代码。 
来自： https://mp.weixin.qq.com/s/sRXljGf7hGFGoS7fdxUczA
```

**Kafka**：

Kafka是后续使用者发现需要一种支持灾难恢复，缓存场景而增强的通讯需求。

相比于GRPC，中间有了一层Kafka对数据进行缓存，当OAP与Agent插件通讯断开时，插件会将数据存储在Kafka中等待通讯正常，灾难恢复

缺点也很明显，首先是维护成本多了一个Kafka，其次是由于第三方中间件的加入导致数据传输不是点对点，数据没有了时效性。

## 数据收集

Skywalking支持数据库和elesticesearch做数据的存储件

支持配置可在源码中见到

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-12/a70c623a-0d79-4ce6-8c30-3d7abdc78629.png)

数据收集与处理部分由OAP模块完成

## 总结

本章要是简略的阐述Skywalking的功能，模块与其依赖的设计组件。

接下来将通过源码，去一步步的解析Skywalking-Agent的运行原理与步骤
