---
date: 2021-09-30
title: DiBoot-无Sql关联查询
category: 
  - GitHub
tag:
  - GitHub
head:
  - - meta
    - name: keywords
      content: DiBoot,Java,GitHub
  - - meta
    - name: description
      content: DiBoot就是一款让你点一点，少量代码完成CRUD操作的工具。
---
# DIBoot
[DiBoot](https://www.diboot.com/)低代码开发平台。

> 开发的时候总是感觉，CRUD，重复的表单好恶心！有没有画图一样的图形化界面，把这些操作点一点、画一画就完成。

现在，DiBoot就是一款让你点一点，少量代码完成CRUD操作的工具。
按照官方介绍![QQ截图20211009135710.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-10-09/QQ截图20211009135710.png)
从中我就看到这几大字：**写得更少，性能更好**
## 低代码
虽然DiBoot有很多库功能，但是我着重的是他封装的数据库关联功能。
与其说是着重，到不与说，DiBoot对数据库优化提供了一种额外的方案和启发。
说起对数据库的优化，就要先谈谈关于数据库和《阿里巴巴JAVA开发手册》
## 高性能的MySQL
在17年版的《[阿里巴巴JAVA开发手册](https://yq.aliyun.com/attachment/download/?id=5585)》中，有提到
![QQ截图20210930102847.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-30/QQ截图20210930102847.png)
明确禁止三张表的join连接，甚至尽可能少的关联表连接查询。
会出现这种禁令，其实是在数据库设计之初就隐约规定了的。
首先要知道，join连接的一大缺点：
- join连接的匹配查询的复杂度基于大的那张表的O(N^2)

所以当表数据量及大的时候，会有很多很多无用的匹配相对。
且join连接的表越多，对比当次查询的性能就越明显。
在必须需要关联查询的场景下。
《高性能的MySQL》书中也有建议的解决方案，
![QQ截图20210930104135.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-30/QQ截图20210930104135.png)

将join连接的表，分别拆开单词查询。配合主键索引，极大的增加了索引利用和减少无用匹对。
更重要的是，单次连接采取主键，可以更好的发挥出缓存的作用。
**其二：**
计算机解决问题，要么用空间换时间，要么用时间换空间，此二法基本上能解决大多数疑难杂症，你现在看到的各种高大上的玩法，基本上都跟此二法沾亲带故。
除了对sql语句的拆分优化，对不得不建立连接的场景下。还可以去冗余一张数据库表，将需要查询的数据建立在一张表上或是另起一张临时表。
虽然违反了数据库设计的三大范式，但其实在实际生产中，不设置外键这一点就已经影响了三大范式了。
所以在可控范围内，可自定义表字段的设计。

## DIBoot关联查询无Sql
前文提过了：**禁止三张表的join连接**
那么，如果我们采取第一种解决方案，将三张表拆开进行单次查询。那么我们在代码中，会造成不必要的代码浪费和冗余。
所以为使代码更加简洁与敏捷，DiBoot提供了注解的方式去绑定元素，使之在绑定的过程中，自动进行对应表的单次查询。
### 准备
在使用DiBoot关联查询前，首先要知道一点
- Sql语句查询条件

然后就是sql环境查询的几步走
1. 建立各表对应的Entry实体类
2. 创建表对应的mapper映射类，以及文件
3. 创建表对应的dao层接口和他的实现类
4. 建立业务对应输出的DTO类

在DiBoot规则下，dao层接口和他的实现类必须实现MyBatis-Plus的Iservice和ServiceImpl /DiBoot封装的BaseService和BaseServiceimpl
![QQ截图20210930110545.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-30/QQ截图20210930110545.png)
![QQ截图20210930110642.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-30/QQ截图20210930110642.png)。

### 注解
准备工作完成后，就是注解使用去绑定需要关联查询的表了，在注解前，先展示一条sql语句
```
select from order o 
left join customer customer on customer.id=o.id
left join order_main_contract mainContract on mainContract.order_id= o.id 
left join order_workflow orderworkflow on orderworkflow.order_id=o.id
where o.id= ?

```
在这条sql中，我join连接了三张表，很明显，不管是对应那框系统而言，order表或者customer表或contract合同表数据量都是极大的，所以我们需要将他拆开进行单次查询。
```
select o.id from order o where o.id=?
select from customer c where c.id=o.id;
select from order_main_contract maincontract where order_id=o.id;
select from order_workflow orderworkflow where order_id=o.id;
```
在不使用DiBoot注解的前提下，需要在代码中作逻辑分别查询，如果查询出来的不是单条数据，还要额外进行逻辑处理。
**但是使用了Diboot后，简化成了一行**
在业务对应输出的DTO类中
![QQ截图20210930111656.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-30/QQ截图20210930111656.png)
#### @BindEntity
使用 **@BindEntity** 注释，绑定一个表关联对象，其中 **entry=?.class** 为关联表的entry实体类，**condition=？** 为关联的条件，
比如order表和customer表关联，this.customerId=id,其中 this.customerId 是指OrderResultDTO中custommerId的属性，id是指customer表的id字段。
对于查询条件而言，可以在OrderResultDTO中设置好字段，进行赋值，然后使用this.xxx 指定。

#### @BindField
除了绑定对应表的实体对象，在我们只需要指定的字段时，可以绑定需要的数据库字段，来进行关联赋值。
![QQ截图20210930131904.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-30/QQ截图20210930131904.png)

#### @BindDict
用于绑定数据库中配置好了的数据字典枚举属性
![QQ截图20210930132818.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-30/QQ截图20210930132818.png)

### 触发绑定查询
在绑定好了对应的实体类或属性后，
在代码中实现：
![QQ截图20210930132136.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-30/QQ截图20210930132136.png)
或者
![QQ截图20210930132310.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-30/QQ截图20210930132310.png)

两者效果是相同的，视场景而变。

## 总结
排开性能而言，短短的一行注释让业务逻辑变得更加的简洁易懂这一点就非常值得我们使用了，更况且join连接拆开变成单次查询，在缓存以及索引优化完善的前提下，性能有极大的提升。
但是DiBoot目前使用率以及曝光度很低，肯定还存在很多不适用的现象。不过DiBoot提供的绑定关联，拆开join进行单词查询，在面对需要关联多张表的业务下，提供了额外的有效解决方案。
