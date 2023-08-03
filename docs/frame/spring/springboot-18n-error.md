---
date: 2023-08-04
title: SpringBoot国际化 - 失效案例
category:
  - Spring
tag:
  - SpringBoot
head:
  - - meta
    - name: keywords
      content: Spring,国际化配置
  - - meta
    - name: description
      content: SpringBoot国际化配置在Linux出现失效的案例
---
# SpringBoot国际化 - 失效案例

记录一次配置i18n文件失效的经历

## 配置

首先简单的过一下SpringBoot国际化配置的设置：

**配置文件**：

```yaml
spring:
  # 资源信息
  messages:
  	encoding: UTF-8
    # 国际化资源文件路径
    basename: static/i18n/messages
```

**文件创建**：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-08-03/72fee462-5b50-47f6-946e-a4f392f77d97.png)

`messages.properties` 为默认国际化配置，未匹对语言文件时使用的默认文件

`messages_zh_cn.properties` 中文的国际化配置

**文件内容**：

```properties
查看>=Check>
```

## 使用

```java
Locale locale = new Locale(语言);
String message = messageSource.getMessage(key, null, locale);
```

## 失效

### 第一点，对于特殊符号的判定。

由于SpringBoot对于国际化内容的解析与判定是通过key = key的字符串比较形式，去寻找对应的value的。

这也导致了当字符内容有特殊符号，比如umb64，》书名号，emoji表情，ASCII等等，都会导致配置失效的情况。

不过发生这点的原因，一般也是配置国际化文件时，以及使用时对key内容控制错误的问题导致，是一个开发级的失效错误

### 第二点，文件名大小写问题。

这个问题是我想对SpringBoot关于国际化配置这块比较抗议的点；

对于各语言的配置文件 `messages_zh_cn.properties` 可以发现，zh_cn 是这个文件的一个语言标识。

这就导致了一个问题，配置化的过程是通过 `Locale` 类中的语言去寻找的。

而 `Locale` 类生产的语言则是由程序控制的，例如：

`Locale locale = new Locale("zh_cn")` 就是一个中文语言的配置文件。

那么在Windows系统中，不管我们的配置是  `messages_zh_cn.properties` 还是  `messages_zh_CN.properties` 都是可以被SpringBoot寻找的。

但是在Linux系统中，由于对大小写的极度敏感，这也就导致了 生成Locale中的语言假如和配置文件名不一致的话，就会造成配置Not found，失效的情况。

例如：

`Locale locale = new Locale("zh_cn")`  但是 配置文件是 `messages_zh_CN.properties`。

但是，这个问题又不是只由某一端就能解决的事。

因为在需要进行国际化应用的APP中，往往都是取各用户userId 对应的 language。

而这个对应关系，最佳方案是由视图端将用户的使用语言通过接口或是请求头的方式绑定至后台。

所以也就导致了，这个人传给我的是zh_cn，那个人给我的是zh_CN，这样格式混乱的情况出现。

这样在一款中心化的服务中绝对是灾难级的BUG。

最后采取的做法是

- 在后台维护一份字典控制其语言和配置文件名一致的问题；
- 获取统一将_下划线后的字符整体大写或小写化；



