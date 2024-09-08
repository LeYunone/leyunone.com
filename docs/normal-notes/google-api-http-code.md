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

不过因为Google库过于庞大，本篇仅从[https://developers.google.cn/api-client-library/java/google-api-java-client/requests?hl=zh-cn&authuser=0000](https://developers.google.cn/api-client-library/java/google-api-java-client/requests?hl=zh-cn&authuser=0000)为例

api版本：`1.42.3`



## API使用

### 1\令牌生成

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

### 2\构建api访问器

核心类在`AbstractGoogleJsonClient` 中

往下延生具体的http服务调用则按业务点被各个子模块实现，比方说`HomeGraphService` 继承自 `AbstractGoogleJsonClient` 为google智能云的api访问器；

构建`HomeGraphService` 访问器如下：

```java
HomeGraphService homeGraphService =
                    new HomeGraphService.Builder(
                            GoogleNetHttpTransport.newTrustedTransport(),
                            GsonFactory.getDefaultInstance(),
                            new HttpCredentialsAdapter("第一步中生成的令牌对象"))
                            .setApplicationName("HomeGraphExample/1.0")
                            .build();
```

可以看到决定这个访问器的变量集中在前两个变量中，跟进：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-09/1.png)

**JsonFactory**： 响应与请求的序列化工厂；

参数如其名，负责的部分就是我们常见的进行http请求前需要用到的JSON解析器，以及相应后用的JSON视图器，在默认`GsonFactory.getDefaultInstance()` 中使用的是`GsonFactory` ，方法很简单：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-09/2.png)

可见默认没做任何的序列化操作，仅仅是将拿到的响应字符串流转化成字符串；

因此影响`api访问器` 的核心因素是第一个参数`HttpTransport`

**HttpTransport**： http传输器

同样的我们先见默认采用的`GoogleNetHttpTransport.newTrustedTransport()`

```java
public class GoogleNetHttpTransport {
    public static NetHttpTransport newTrustedTransport() throws GeneralSecurityException, IOException {
        return newTrustedTransport(MtlsUtils.getDefaultMtlsProvider());
    }
    ...
}
```

而在创建的`NetHttpTransport`类中，可以直观的看到如下属性：

**SSLSocketFactory** ：创建SSL套接字的工厂
**HostnameVerifier**：证书认证器
**Proxy **：Http代理设置https://docs.oracle.com/javase/7/docs/api/java/net/doc-files/net-properties.html
**ConnectionFactory **：在未设置代理时生成本次http请求客户端的连接

各个属性都是和http请求有直接联系的关键类，由此可见HttpTransport是决定`api访问器` 发起http请求方式的顶级接口

观察他的实现类：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-09/3.png)

**很好奇为什么谷歌把test模块中的各种`mock` 测试类发布到了正式包中** ，可能是想证明他们真的有写单测把！狗头.jpb🐕

除了NetHttpTransport，还有ApacheHttpTransport...

在官方demo中，演示时使用的shi`GoogleNetHttpTransport` 为何？后续在言；

### 3\执行

执行的动作很好跟踪，以demo中的执行请求为例，可以直接跟踪到`AbstractGoogleClientRequest` 中的 **execute** 方法

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-09/4.png)

当请求是媒体文件下载型，会将输出流通过GZIP库的压缩算法解析下载，而普通请求则会构建本次路由的请求执行器。

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-09/5.png" style="zoom:67%;" />

可见会使用api访问器中设置的http传输器生成本次http请求的执行器；

那么往下看就很轻松了，除开Google-api私定的各种各样的请求头、参数、签名等等设置的校验型代码；

核心落到`HttpRequest`类的`execute`方法中，见1012行，执行动作落到了`LowLevelHttpRequest`接口中

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-09/6.png)

而执行方法的实现，都是HttpTransport中构建的http请求类型的实际落地；

至此请求完成，接下来就是对响应参数解析：

```java
    public T execute() throws IOException {
        return this.executeUnparsed().parseAs(this.responseClass);
    }
```

直接通过前述设置的json格式工厂已规定的路线进行输出流的解析

### 4\超时，错误

在执行过程中，以NetHttpTransport为例：

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-09/7.png" style="zoom:67%;" />

Google通过响应式编程`Future`函数的方式，巧妙的让开发者可根据设置响应后防止响应流过大超时时间无法控制而设置写超时时间；

这一步真的是惊天由人，看似简单，但是我相信在很多开发者设计一个Http请求工具时都不会将Http请求响应写入到输出流的这部分时间划算到请求时间中；

大部分都是简简单单的设置一个Http的读请求，草草完事；更何况此处使用`Feture` 函数这么优雅的实现，在很多开发者的第一意识中都很难思考到，所以狠狠的 **Get** 到 😀；

Google提供直接设置读与写请求的超时时间API：

```
private HttpRequestInitializer setHttpTimeout(final HttpRequestInitializer requestInitializer) {
  return new HttpRequestInitializer() {
    @Override
    public void initialize(HttpRequest httpRequest) throws IOException {
      requestInitializer.initialize(httpRequest);
      httpRequest.setConnectTimeout(3 * 60000);  // 3 minutes connect timeout
      httpRequest.setReadTimeout(3 * 60000);  // 3 minutes read timeout
      httpRequest.setWriteTimeout(3 * 6000)
    }
  };
```

## 总结

中间有提到为什么谷歌demo中使用的是NetHttp，通过翻阅资料：

可见一篇文章：[七大主流的HttpClient程序比较](https://blog.csdn.net/weixin_43847283/article/details/135073288)

下图：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-09/8.png)

NetHttpTransport使用的是HttpURLConnection

ApacheHttpTransport使用的是HttpClient

作为一个面向全球的国际化`api-sdk` ，人人可用，什么项目都可行，因此选择JDK默认自带，最原始的最为demo是必须的。

不过见上图，默认的NetHttpTransport性能很差，并且Google-api在一些接入中，如智能云的云上报就会经常使用；

没有连接池的兜底控制，资源损耗可想而知，因此大伙一定要注意换成ApacheHttpTransport；

最后，无论是从工厂、模板、抽象等设计模式上，还是对公共头、参数、签名等处理操作上，本地阅读源码的体验良多；