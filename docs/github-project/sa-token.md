---
date: 2024-03-03
title:  Sa-Token轻量级 Java 权限认证框架
category: 
  - GitHub
tag:
  - GitHub
head:
  - - meta
    - name: keywords
      content: Java,工具,Sa-Token
  - - meta
    - name: description
      content: 这可能是史上功能最全的Java权限认证框架！目前已集成——登录认证、权限认证、分布式Session会话、
---
# Sa-Token轻量级 Java 权限认证框架

> 这可能是史上功能最全的Java权限认证框架！目前已集成——登录认证、权限认证、分布式Session会话、微服务网关鉴权、单点登录、OAuth2.0、踢人下线、Redis集成、前后台分离、记住我模式、模拟他人账号、临时身份切换、账号封禁、多账号认证体系、注解式鉴权、路由拦截式鉴权、花式token生成、自动续签、同端互斥登录、会话治理、密码加密、jwt集成、Spring集成、WebFlux集成...

早在2020年，这个项目只有几百 `star` 的时候就接触使用过；

但后续因为公司，个人的项目在设计用户管理这一块主要是依靠已经成体系的自研模式下的权限控制，所以一直没有真正用到Sa-Token；

但最近有一个独立项目游离与各数据中心，需要一套自成体系的用户管理，秉承着简单好用的理念，想到了Sa-Token这一简单、优雅的框架，选择他也是因为文档上的前几句话：

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-03-01/9158a4ae-2ef8-4824-a90e-fe57de6dd0ab.png)

## 为什么选择他

从0开发并且使用一个用户-角色-权限的RBAC的方案，如果有项目经理安排工作，还需要你预估工时。

这不可好办，要知道一个严格的用户中心一定得支持缓存、token过期、信息回拿、分布式等等功能；

而且作为工程师， 我们最好的品质一定得有“懒惰”，有简单好用，而且功能强大，社区活跃的轮子；

`傻子才不用`

因此如果项目的规格可预见、功能可控，那么我认为选择 Sa-Token 是目前市面上权限认证框架的最好方案；

我简单的以我的使用体验上来好，对比现在主流的各类权限认证框架：

 **Spring Security**：体量重，与Spring体系项目无缝集成，功能相对两者更为丰富和安全；但是架构冗余，使用起来不流利的同时还需要极佳的service、dao去配合；

**Shiro**：依赖性最低的工具，完全基于拦截器的原理实现，配置和使用上都很简单，依赖Session管理，非常适用与独立项目或者认证场景复杂的项目

**Sa-Token**：使用与配置更加简便，并且功能解耦高，架构编排优雅，相比与Shiro，支持自成体系的分布式与缓存。不过不支持多种认证方式，在API接口的项目中使用更加广泛；

## 怎么使用他

官方文档：[https://sa-token.cc/doc.html#/](https://sa-token.cc/doc.html#/)

作为一个简单使用的框架，怎么使用他，作为使用过的人来说根本无言说起：

因为他的使用真的太简单了，简单到登录、获取登录信息、权限控制....都只需要调用已封装好的API

所以作为鉴赏文章，怎么使用它，我更推荐去研读非常完善的文档。

~~拒绝重复造轮子~~

## 缺陷

与其讨论Sa-token怎么使用，有多好玩。

我更愿意谈其使用中感受到的点点缺陷，当然了，缺陷并不代表缺点，只是使用者在使用中对自己开发习惯的违背点；

### **1**

首先第一个，也是我在Git上有提PR的一个非常简单的改动：[https://github.com/dromara/Sa-Token/pull/575](https://github.com/dromara/Sa-Token/pull/575)

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-03-05/aa16fbdf-b1f5-4996-b37a-33e84e6bd483.png" style="zoom: 67%;" />

不过因为吃了闭门羹式的回复，失去了讨论的兴趣所以这个PR理所当然的被拒绝了

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-03-05/7b96fb74-7a25-43c8-b76b-d8d70b6abd38.png" style="zoom: 50%;" />

这个我认为的缺陷感觉很明确且明显：

在 `StpInterface` 接口中，一般是重写 `getRoleList` 、`getPermissionList` 方法装配用户角色和权限的关系，但是问题来了；

因为Sa-Token不能限定用户标识id的数据类型，因此整个架构定义id都是 `Object`

这也导致了getRoleList和getPermissionList的方法入参也是Object类型

倘若你第一次接收某个项目，或者需要与此对接，那么就有一个问题：

如果最开始实现StpInterface接口的人，没有拿到Object id 后强转为项目中的数据类型，那么你对此标识是无从猜测的；

因此我觉得在 StpInterface实现接口之初将id的类型指定下来也很合理吧。

### 2

其次是想要有的东西

Oauth2认证服务器，基本架构是一个授权接口，一个认证接口，一个刷新认证接口；

同样作为权限认证的框架，但是我们却无法将Sa-Token变成一个Oauth2应用，即使sa-token提供了oauth2相关的Api；

为什么？

原因也很明显，在设计之初秉承以轻量级框架的设计，API/接口方向二选一的可能，因此目前的Sa-Token都是像润滑剂方法一样出现在项目的各个角落；

但是两者都用过的人可以发现两者如果运用得当可以很接近的实现；

那么为何Sa-Token本身不去支持一个自成体系的Oauth2服务器步骤呢；

或许后期随着Sa-Token的功能丰富，版本迭代，会提供Sa-Token-Oauth2的单独模块出来；

## 总结

因为是鉴赏篇，所以很多地方点到为止的带过；

写这种文章的目的主要是有强烈的 "我来过，我走过" 的意图

