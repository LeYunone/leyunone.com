---
date: 2023-11-09
title: DBshop日记3
category: 
  - 开发日记
tag:
  - 开发日记
---
于2023-11-09日记录

以上为目前工具的使用，简单的概括：**功能以完成，剩下的就交给时间。**

并且对比功能，数据库之间对比这一实际的投入到了我平时和同事的开发使用中，效果比预想中的要好的多。

在没有复杂情况中，比如复合主键、在未找到转换规则定义中的特殊字段、非常用索引...，已经可以做到稍作检查就可以直接使用自动生成出来的Sql。

`有成果的收获更令人美味`

## 开发小结

在[日记2](https://leyunone.com/development-diary/dbshop/dbshop-2.html)的记录中，有提到Sql语句的自动解析，这方面也是到目前为止最费力的环节。

### SQL解析

首先Sql语句总类很多，

- 新增字段
- 修改字段
- 创建表
- 删除表主键
- 删除自增
- 新增自增
- ....

在最开始的设计中，解析流程大致如下：

1. 两表对比，发现有差异，根据类型、名字等因素定位到具体表的具体字段
2. 根据主从表设置，决定该字段需要生成 新增\修改\删除 类型SQL
3. 调用工具，通过Sql模板的设置生成对应类型的字符串
4. 执行字段类型转换策略

在早期设置sql类型少的时候，只需要添加工具中对于各类型SQL的生成方式的逻辑就好。

但是当遇到创建表，表中设置自增、主键、索引...这种组合型的复合类型，随着类型增多，愈加难以维护。

最终 流程3，调用工具，采取了设计模式中策略模式的设计。

将各个类型的SQL对应到具体策略中，复合型SQL则只需要建立起策略执行链路，就可以非常直观的完成一次例如建表的SQL语句。

所以设计了SQL语句解析这套链路后，有了一个非常深的体会： **策略模式真TM好用**

由其在结合了日记2中的抽线策略工厂后，整个代码体系在开发感观上有一个质的提升

### 类型转换

除了核心功能的Sql语句自动解析外，字段的类型设置与实际想要得到的这一点，也是一个非常重要的扩展点

并且由于 Java中原生JDBC对各数据库类型的弱化获取，导致 `DatabaseMetaData` 中拿到的字段与在数据库中设置的会存在偏差。

比如在Mysql中，`datetime` 类型在默认设置中，被 `DatabaseMetaData` 解析出来的会是 `datatime(26)` ；

`tinyint(1)` 会变成 `bit(1)`

`json` 会变成 `json(65535)`

...

因此，在Sql生成后，还需要通过自定义去勾选或添加转换类型，将 `datetime(?)` 变成 `datetime(0)` 这样符号日常需要的Sql类型

关于类型转换规则的种类，也随着在使用过程中发现各类类型在原生中的解析偏差，比如 `Longtext` ...

所以这部分功能的完善也只能慢慢的交给时间

### 核心对比逻辑

简单的梳理流程：

1. 加载两个对比的数据库数据，并且以 `数据库-List<表>` `表-List<字段>` 进行本地的缓存存储
2. 遍历其中一个数据库的表，另一个数据库的表生成 `name` 的字典，初次判断将名字不相同，即一个库存在，另一个不存在的表打上差异标识。
3. 将遍历结果解析，如果有差异标识，则根据主从表生成对应主表的 创建表 或 删除表 Sql。
4. 如果没有差异标识，则继续比对两表的字段差异，从字段名、字段类型、字段长度、自增属性、主键属性、备注依次判断
5. 根据步骤4的结果生成对应差异的语句，比如字段名差异，则说明新增或删除字段，类型、长度、备注则说明更新字段...
6. 将最终结果sql推入到类型转换策略器中
7. 打印最终结果集

大致方向就是以上7点，使用事实证明，确实可以完成非常有效的数据库对比逻辑判断

## 未来

目前除了继续完善维护已经完成的数据库对比功能，还会考虑以下：

- 自动筛选项目中未用到的表
- 自动判断项目中实体类与表的字段差异
- 网页端的使用

其中1和2是突发灵感想到的需求，3则是必须要做的。

果然需求来源于生活，在我烦恼数据库中哪些表是废表的时候，需求就此诞生了



