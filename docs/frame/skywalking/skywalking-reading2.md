---
date: 2023-05-15
title: Skywalking源码系列2-探针
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
# Skywalking-源码解析-探针

> 本章将根据源码，讲解Agent从运行到实施动作的详细步骤

# 开头

从 `SkyWalkingAgent` 类开始，`premain`方法

premain方法总共做了四个动作

1. 加载Agent基本属性配置
2. 加载Agent插件
3. Agent自定义动作
4. 开启

