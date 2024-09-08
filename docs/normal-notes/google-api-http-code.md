---
date: 2024-09-09
title: Google-api-http模块源码阅读
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: 源码阅读,谷歌,Google,api,Http,Https
---
# Google-api-http模块源码阅读

> Google-api的文档地址：https://developers.google.cn/api-client-library/java/google-api-java-client/setup?hl=zh-cn&authuser=0000

## 前言

最近在搞`open-api`的接口项目，其中SDK提供快速调用目标接口的方法的模块总是拿不准该如何设计；

因为从动作上来看实在是太简单了，无非就是封装请求头，请求体，鉴权，请求....几个耳熟能详的方法。

考虑到未来的拓展性，使用可更加灵活且性能可缩可减...不能按照常规的SDK静态方法去思考整个模块架构；

于是乎过去使用`Google-api`的记忆涌现，是时候看看作为世界首屈一指的`open-api-sdk`模块，是如何构建他的架构的；

不过因为Google库过于庞大，本篇仅从https://developers.google.cn/api-client-library/java/google-api-java-client/requests?hl=zh-cn&authuser=0000为例

## API使用

第一步是构建令牌，用作权限认证：

```java
GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();
```

由于google的令牌申请下来的是一个json文件，而此处的`applicationDefault` 意为从项目应用默认文件夹下获取令牌的json文件；

在源码中`DefaultCredentialsProvider` 类的`getDefaultCredentialsUnsynchronized` 方法可知：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-04/1.png)

```java
    String getEnv(String name) {
        return System.getenv(name);
    }
```

默认是从**GOOGLE_APPLICATION_CREDENTIALS** 系统环境变量中获取json文件路径，当这个变量未配置时：

```json
       if (credentials == null) {
            File wellKnownFileLocation = this.getWellKnownCredentialsFile();
            InputStream credentialsStream = null;
....
```

```
static final File getWellKnownCredentialsFile(DefaultCredentialsProvider provider) {
    String envPath = provider.getEnv("CLOUDSDK_CONFIG");
    File cloudConfigPath;
    ...
```

则是从 **CLOUDSDK_CONFIG** 环境变量中获取文件，这是由于前者为谷歌的应用令牌，后者则是后续分裂出来的谷歌云的令牌，两者相同

