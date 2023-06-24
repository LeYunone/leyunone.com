---
date: 2023-06-16
title: DBshop日记2
category: 
  - 开发日记
tag:
  - 开发日记
---
# DBshop
> 数据库对比工具开发记录

## 使用版本

开发前定义了三个使用版本

1、 自动读取项目数据库配置，选择对比目标数据库

2、 在线页面模式，输入数据库一、数据库二，选择对比

3、 控制台打印模式，配合（1），直接在控制台将对比结果输出

简单的说就是：页面版本、控制台版本、自动版本![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/2023-04-23/bd8b271f-8282-47e9-884e-84b7220769ba.jpg)

## 随手记开发记录：

目前的进度到了解析两张表的对比结果的Sql语句；

不过因为存在类型转化、数据库类型、多库等原因，目前还只是到了半成品节点的2成；

不过也可以简单的去使用两表对比/两库对比，拿到打包后的不完整sql；

以下简单的描述以下在开发中遇到的问题，以及应对方案

![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/2023-05-21/7e44f13f-454e-46f7-b518-8cd748bc2850.gif)

### 数据库结果集

由于Connection的特性，即断开销毁；

所以在连接中需要将load的目标数据库一次性解析成

DB -> TALBE -> COLUMN

的关联形式

使用 **CompleteFuture** ，将主线程等待数据库Load加载信息的动作，拆成3个子线程完成；同事主线程等待结果，分别返回三个【DB、TABLE、COLUMN】的加载结果

【DB、TABLE、COLUMN】的存储模式采用**策略存储**；

URL+DB+TALBENAME+COLUMN

...

### 数据URL参数问题

```xml
jdbc:mysql://地址:3306/数据库名?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&allowMultiQueries=true&nullCatalogMeansCurrent=true
```

1、nullCatalogMeansCurrent=true问题

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-13/4285c930-a0ed-46de-86eb-63e6c3f2fe47.png)

### 类型转化策略

见[策略工厂下的架构设计](https://leyunone.com/Interesting-design/strategy-factory-together.html)

由于Mysql驱动与JDBC的设计一致性问题；

会出现datetime 不设置长度，变成datetime(26)、tinyint(1)变成bit(1)，等等问题

所以需要一个处理流做两件事，一是拿到对应规则工厂，二是执行策略

并且需要对外放开，有结果集与无结果集两种处理模式供后续扩展

在多数据库类型下 ，类型转化工厂类型居多，所以还需使用模板模式控制各数据库类型的sql和类型转化规则

### SQL语句自动解析提取

在表/字段 进行 **对比** 操作后，将最终结果集交给sqlProduction类分析处理。

处理过程，采用消息模板+填充的方式

见 [消息模板的设计](https://leyunone.com/unidentified-business/message-center-design.html#%E8%AE%BE%E8%AE%A1)

预先设定好各sql语句，比如

```java
public enum SqlModelEnum {

    //SQL语句模板
    //采用{}进行内容填充

    ADD_COLUMN("ALTER TABLE {} ADD COLUMN {} {}({}) COMMENT '{}' ;", "新增字段"),
   .......
```

进行一系列主表/从表；名是否相同，类型是否相同，size是否相同，备注是否相同；得到一个对比出来的总sql集

## 预计目标

首先完成无页面，即单元测试版本，输入两个数据库信息，然后将两者比较的结果打印到文件中。

主要是要完成可以自动比较然后打包出成体的SQL，目标是在7月完成，应该自己现在急需要这个功能（~~某个项目要上线了~~）；

其次是页面，依然是使用ELementUI随便搞个页面了，咱主打的是功能：）

## 难搞

在开发过程中，除了Mysql连接的一些坑，导致一个结点直接重做；

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/2023-05-21/dee4ef76-8feb-420f-a850-d9597faea90c.jpg" alt="emo" style="zoom:67%;" />

最难受的就是Mysql的字段类型，和DatabaseMetaData解析出来的类型有很大出入的问题了；

好在设计了一种策略处理流，完全的解耦了字段类型转化这个流程，不过因为建表，修改，主键，删除等等sql语句，夹带着数据库的基本信息，编码、类型等等。

需要很多很多的策略转化去适配使用者需要的sql语句

所以这个开发过程会被拉的很长![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/2023-05-21/1ee2b9a5-b3e9-4b4d-949e-03b3aec6621d.jpg)

但是！我在~~暴力~~请我的某个帮手，可以分担一些策略类的开发，如果他不帮，别逼我~~跪~~~~求~~
