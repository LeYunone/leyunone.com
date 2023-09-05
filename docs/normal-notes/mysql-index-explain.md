---
date: 2023-09-05
title: Explain的索引分析
category: 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: MYSQL
  - - meta
    - name: description
      content: 索引是每一个数据库使用者必须迈过的坎，当数据量达到6位数或者分页达到10000页，甚至笛卡尔积比较大的查询语句，都绕不开索引的设计，和针对索引生效的Sql语句优化。
---
# Explain的索引分析

索引是每一个数据库使用者必须迈过的坎，当数据量达到6位数或者分页达到10000页，甚至笛卡尔积比较大的查询语句，都绕不开索引的设计，和针对索引生效的Sql语句优化。

本篇记录的是使用Explain去分析SQL的索引达成度

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-09-06/88537823-08ff-4357-83ba-14416e90ed6c.png)

## id

这个没有什么特殊含义，只是在执行Explain语句时，分析多张表时，作为临时虚拟表的主键序号

## select_type

查询类型，有以下几种：

- **SIMPLE** ： 不使用UNION或子查询等
- **PRIMARY** ： 最外层的select
- **UNION** ： UNION中的第二个或后面的SELECT语句
- **SUBQUERY** ： 子查询中的第一个SELECT
- **DERIVED** ： 派生表的SELECT(FROM子句的子查询) 

像

```mysql
SELECT * FROM test 
这种就是SIMPLE 简单查询
```

```mysql
SELECT * FROM (SELECT * FROM test WHERE id = 1) 
这种是 DERIVED
```

## table

指当前计划分析的表，如果表有别名则会显示别名

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-09-06/79e610b6-ec5e-4e70-b48f-f45ae69ec3fc.png)

## type

指本次查询连接类型的扫描方式

常见的为以下几种：

- **system** 数据库系统连接，直连表
- **const** 常量数据
- **eq_ref** 主键或非空唯一索引扫描
- **ref** 非主键唯一索引的扫描
- **range** 范围扫描
- **index** 索引树
- **ALL** 全表扫描

几种扫描的快慢为： system > const > eq_ref > ref > range > index > ALL

因此尽量不出现全表扫描的Sql语句，因为当查询出现了全表扫描，那么他一定没有走任何一个索引

## possible_keys

指可能会用到的索引，但是索引实际生效与该值没有任何关系

## **key**

本次使用到的索引

如果想要key指定，则可以使用FORCE INDEX、USE INDEX或者IGNORE INDEX 进行查询特指

## key_len

越短越好

## rows

本次Explain语句查询涉及的数据量总和

## Extra

备注，直译为Explain告诉我们这条Sql语句的建议点，比如以下几点：

- **Using where** 使用了WHERE从句来限制哪些行将与下一张表匹配或者是返回给用户。如果不想返回表中的全部行，并且连接类型ALL或index，这就会发生，或者是查询有问题
- **Using index** 列数据是从仅仅使用了索引中的信息而没有读取实际的行动的表返回的，这发生在对表的全部的请求列都是同一个索引的部分的时候
- **Using temporary**  由于排序没有走索引、使用union、子查询连接查询、使用某些视图等原因，因此创建了一个内部临时表。
- **Using filesort** 表示没有使用索引的排序
- **Range checked for each Record（index map:#）** 直译为没有走合适的索引，可能因为字符/类型等问题
- **Not exists**
- **Distinct**
