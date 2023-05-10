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
# Skywalking-源码解析-开篇

>  将以最白话的方式记录SkyWalking源码阅读的过程

## 下载源码

![image-20230504234100016](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-04/4cbefd50-3719-4712-8063-db0e2dbabb2e.png)

[https://github.com/apache/skywalking](https://github.com/apache/skywalking)

Fork下来的时候，记得别勾上框框中的选项，不然看不到其他版本代码

**切换版本**

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-04/a40861a0-898d-4160-bee5-f39f6e422c72.png)

![image-20230504234448065](C:/Users/leyuna/AppData/Roaming/Typora/typora-user-images/image-20230504234448065.png)

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

OAP是Skywalking的服务端，作数据收集
