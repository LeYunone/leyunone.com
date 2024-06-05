---
date: 2024-06-06
title: Mybatis-Plus被恶意CVE一事
category: 
  - Mybatis
tag:
  - Mybatis
head:
  - - meta
    - name: keywords
      content: CVE,Mybatis,
  - - meta
    - name: description
      content: Mybatis-Plus框架在2024年5月被人在CVE网络安全漏洞库上提交了漏洞，
---
## 前言

Mybatis-Plus框架在2024年5月被人在CVE`网络安全漏洞库`上提交了漏洞，该漏洞可笑无比，但是有趣的是竟然还是被CVE审核确认为了SQL注入漏洞；

## 发生了什么

见Mybatis-plus发出的申明公告：[https://mp.weixin.qq.com/s?__biz=MzA4NzgyMTI0MA==&mid=2649526788&idx=1&sn=5f4cfbe92097cdd45fa8db72e5b9c1f1&chksm=882bacd3bf5c25c5407d6251f4fa6a7ad444c1fcfba5830636cb217b7ffd37324f15bea0000d&token=72916232&lang=zh_CN#rd](https://mp.weixin.qq.com/s?__biz=MzA4NzgyMTI0MA==&mid=2649526788&idx=1&sn=5f4cfbe92097cdd45fa8db72e5b9c1f1&chksm=882bacd3bf5c25c5407d6251f4fa6a7ad444c1fcfba5830636cb217b7ffd37324f15bea0000d&token=72916232&lang=zh_CN#rd)

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-06/XQ23TL{F_TRA7VC]{@TMCXW.png" style="zoom:67%;" />



简单的说，就是一个`网友` 写了一个接口，而这个接口的入参是一个Sql语句，并且直接使用`Mybatis-plus` 提供的`QueryWrapper` 或`UpdateWrapper` 直接将其作为入参拼接；

例如如下接口：

```java
	@GetMapping("/test")
    public void test(String column,String condition) {
        LambdaQueryWrapper<Object> lambda = new QueryWrapper<>().eq(column,condition).lambda();
        mapper.selectList(lambda);
    }
```

然后社区人员琢磨着是来整活的，这个问题对于一个带点 `脑子` 的开发者来说过于愚蠢，于是乎就直接关闭了这个`issues` ；

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-06/mp2.png" style="zoom:67%;" />

不过万万没想到的是提问者竟然直接将这个 "BUG" 上述给了CVE，而CVE竟也通过了；

要知道作为一个开源框架，在CVE的一封修复邮件下来，无论是否修复都很影响这个框架的维护和使用；

因此这个提问者钻篓子的行为，只可能是两种：

1. 恶意提CVE
2. 真的影响到他了，比如他真的这样设计然后出了Bug

如果是前者，那么不得不说国内的开源环境真的恶劣；

在无私奉献的同时还要提防各式各样的攻击；

## 看法

占三派，

- 一是认为`Mybatis-plus` 允许Sql直接的拼接操作是BUG
- 二是认为`Mybatis-plus` 应该在文档上认认真真进行说明
- 三是认为这很搞笑

我站队第三者；

**第一，关于SQL拼接；**

这让我想到了以前用过了好几个数据库框架，`Dibbot` 、`MyBatis-Flex`...

都存在可供直接拼接的SQL方法；

因为随着JDK版本推进，以及各类语言的语法糖的迭代升级，如今的开发在去掉了繁多的XML配置的同时，也直接引入了各类的链式编程，函数式编程让开发者便捷开发；

注意这里的设计指的是框架开发者在开发人员的角度上实现的功能，因此SQL拼接这种在开发时可见的`漏洞`，设计者是认为：**你既然知道这么使用了，那么我就完全信任你了** 

（来自issues下的评论：

mybatis-plus 中的 wrapper 不是面向用户的，就像 jdbc 一样，完全信任程序员。一般情况下，用户都不应该能直接与 wrapper 存在交互。

我们不会也没有办法来纠正程序员本身的行为造成的错误！在基础设施层增加不必要的校验会有各种问题出现，自由度也会降低。）

所以至于这是不是BUG：

从CVE的安全角度上来看，这肯定是一个漏洞，而且危险等级还不低；但是：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-07/mp3.png)

**第二，文档质量**

这一点我也很认同，一个框架的文档是在一次次的漏洞中完善的；

这次让提问者找到了这种傻瓜级的BUG未在文档中撇开关系，这也一定是~~漏洞~~

## 官方做法

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-06/mp.png" style="zoom:67%;" />

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-07/mp4.png" style="zoom:67%;" />
