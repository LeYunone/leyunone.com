---
title: 已知面试问题归纳
category: 总结
tag:
  - 无
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,字节码详解,Java 基本数据类型,装箱和拆箱
  - - meta
    - name: description
      content: 全网质量最高的Java基础常见知识点和面试题总结，希望对你有帮助！
---
# 已知面试问题归纳

>  收纳目前认知中所有面试问题

**当前版本2022-04-22**

## 通用题

**P1 谈谈你的项目经验**

**P2 说一下你在项目遇到的困难[技术/业务]**

**P3 在项目中解决过最复杂的问题是什么？**

**P4 你最熟悉和擅长的技术是什么？**

**P5 设计模式**



## Java

### 基础

**P1 Java面向对象有哪些特征？**

**P2 Java中抽象类和接口有什么区别？**

**P3 Session和Cookie的区别**

**P4 Servlet⽣命周期**

**P5 volatile作用及实现原理**

**P6 Java的四种引用类型：[强引用、软引用、弱引用、虚引用]**

### JUC

**p1 自旋锁实现方案**

**p2 什么是CAS**

**P3 什么是悲观锁、乐观锁**

**P4 AQS的核心组成**

**P5 如何实现自定义线程池的淘汰策略**

**P6 线程池的创建方式**

**P7 线程池的用法及优势**

**P8  synchronized和reentrantLock的区别？**

### API

**P1 JDK动态代理为什么只能代理有接口的类？**

**P2 JDK1.8的新特性有哪些？**

**P3 hashcode和equals的意义和如何使用**

**P4 Java代理的几种实现方式**

**P5 String、StringBuilder、StringBuffer**

### JVM

**P1 请说一下对象的创建过程？**

**P2 JVM是什么？**

**P3 内存溢出OOM、栈满是怎么回事**

**P4 垃圾收集算法，如何找出垃圾**

**P5 垃圾收集器（CMS、G1）**

**P6 JVM调优时机**

**P7 JVM调优原则**

**P8 定位JVM异常【用top指令看cpu占用最高进程、使用jstat找到进程下所有线程、定位占用最高线程、使用jstack定位线程、查看他做了什么】**

**P8 获得.class的方法 【.getClass()、.classForName()、.class、使用类加载器ClassLoader.loadClass(类名)】**

**P9 如何打印JVM内存信息**

```xml
-XX:+PrintGC：输出形式:
 [GC 118250K->113543K(130112K), 0.0094143 secs]
 [Full GC 121376K->10414K(130112K), 0.0650971 secs]
-XX:+PrintGCDetails：输出形式:
 [GC [DefNew: 8614K->781K(9088K), 0.0123035 secs] 118250K->113543K(130112K), 0.0124633 secs]
 [GC [DefNew: 8614K->8614K(9088K), 0.0000665 secs][Tenured: 112761K->10414K(121024K), 0.0433488 secs
-XX:+PrintGCTimeStamps：打印GC停顿耗时
-XX:+PrintGCApplicationStoppedTime：打印垃圾回收期间程序暂停的时间.
-XX:+PrintHeapAtGC：打印GC前后的详细堆栈信息
-Xloggc:filename：把相关⽇志信息记录到⽂件以便分析.
```



### 容器

**P1 ConcurrentHashMap 底层实现原理？**

**P2 HashMap如何解决哈希冲突？**

**P3 集合的排序如何实现？**

**P4 ArrayList去重思路**

**P5 ArrayList和LinkedList有什么区别？**

**P6 LinkedHashMap排序的原理？**

## 缓存[Redis]

**P1 缓存雪崩和缓存穿透的理解以及如何避免？**

**P2 Redis的内存淘汰算法和原理是什么?**

**P3 Redis和Mysql如何保证数据一致性?**

**P4 什么是哨兵模式**

**P5 Redis的缓存穿透和缓存雪崩，以及解决方案**

## 数据库

**P1 innoDB如何解决幻读?**

**P2 MySQL性能如何优化?**

**P3 事务的ACID以及如何实现的？**





## 数据结构

**P1 谈谈你对B树和B+树的理解**

**P2 什么叫阻塞队列的有界和无界?**

## 并发

**P1 谈谈分布式锁的理解以及实现**

**P2 volatile关键字有什么用，它的实现原理是什么?**

**P3 死锁的发生原因和怎么避免？**

**P4 请你谈一下CAS机制？**

**P5 线程池如何知道一个线程的任务已经执行完成？**

**P6 lock和synchronized的区别**

**P7 分布式事务是怎么处理的？**



## Spring全家桶

### SpringBoot

**P1 Spring Boot 自动装配机制的原理？**

**P2 Spring Boot 约定优于配置，你的理解是什么？**

**P3 @PostConstruct注解有什么用？**

### SpringMVC

**P1 谈谈你对SpringMVC的理解**

## 系统问题

**P1 CPU飙高系统反应慢怎么排查？**

## 
