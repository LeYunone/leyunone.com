---
date: 2024-04-20
title: 游览器缓存问题记录
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: 游览器缓存,html2canvas
  - - meta
    - name: description
      content: 浏览器通过在电脑本地内存中划分一个数据传输的缓冲区，并且这个区域的文件是被记录在电脑硬盘中可被用户访问的文
---
# 游览器缓存机制

生产环境上出现了一个因为浏览器缓存造成的不可名状bug，简单的说就是由于缓存加载图片的问题导致了明明已经修复的功能依然报错，然后一直在原地打转定位问题；

先做一个复盘：

web项目上线之后，因为正式环境的域名未配置阿里云的跨域设置，因此前端同志使用`html2canvas` 报了跨域错误：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-21/aba06726-7053-4250-a5dd-e29fd81875eb.png)

解决方法简单，只需要在OSS上进行如下设置：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-21/63a723ea-d2af-471e-a39c-9b638631269b.png)

然后问题出现了，无论我们如何设置以及前端如何调整请求头，生成图片依然失败；

最终清理浏览器缓存+换电脑，浏览器排除法发现是游览器缓存搞的鬼，这一点就令人感到诧异：失败的图片错误竟然会被游览器缓存；

## 游览器缓存

先来理解一下浏览器缓存是什么东西

### 用处

1. 缓解浏览器请求压力
2. 加快页面渲染速度
3. 减少带宽网络的消耗

### 实现

浏览器通过在电脑本地内存中划分一个数据传输的缓冲区，并且这个区域的文件是被记录在电脑硬盘中可被用户访问的文件夹中，比如`%temp%` 文件；

浏览器通过将资源的访问HTTP报文作为唯一标识进行存储与识别，用户再次进入浏览器时进行HTTP请求，即在

浏览器发起HTTP请求 >   服务器进行应答响应

之间会先访问浏览器的本地缓存区，通过报文的标识判断有无缓存，过程如下：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-21/0b8186fc-6593-476d-957a-c0177d3637cc.png)

### 设置

浏览器的缓存规则可以通过对HTTP的响应报文进行设置的

一般由服务端判断本次请求是否使用缓存以及缓存时间，不过因为浏览器请求服务器大多是拿取数据的查询操作。

因此浏览器缓存多被用于浏览器访问服务器上的静态资源，比如js文件，py脚本，图片等等；

在响应报文中使用Expires 和 CacheControl 请求头设置，比如如下对HTTP请求进行不缓存设置：

```
Response.Expires = 0
Response.ExpiresAbsolute = Now() - 1
Response.Addheader “pragma”,“no-cache”
Response.Addheader “cache-control”,“private”
Response.CacheControl = "no-cache
------
Copyright by 
https://www.leyunone.com/normal-notes/httpServletResponse.html
```

**Expires** 指服务器返回该请求结果缓存的到期时间

**Cache-Control** 则缓存规则，有如下值：

- public：共享缓存，共享缓存可以被多个用户使用，响应不是针对单个用户的

- private：私有缓存，只能被单个用户缓存，通常是在用户的浏览器或用户代理中。它不能被共享缓存（如代理服务器或 CDN）所存储。通常用于那些包含用户特定信息或敏感数据的内容。通过将其标记为 Private，您可以确保这些内容不会被存储在可能被多个用户访问的共享缓存中，从而提高了隐私性和安全性。
- no-cache：客户端缓存资源，不走强制缓存；
- no-store：资源不会被缓存，即不使用强制缓存，也不使用协商缓存；
- max-age=1：缓存保质期，缓存内容将在1秒后失效；

### 判断使用

判断浏览器对HTTP请求是否使用了缓存很简单，打开浏览器开发者模式 ，`F12`；查看`Network` 网络请求。

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-21/5ff25160-6a71-4c62-9b23-4ea70f8dff68.png" style="zoom: 67%;" />

如上size中表示为`memory cache`就是使用了浏览器缓存的资源；

## 复盘

了解了浏览器缓存，那么就回到是怎么被坑的；

前端同志使用 `html2canvas`  组件生成图片，而这个组件生成图片的核心原理是将页面上的标签以及样式进行流编码生成，得到的是一张base64编码的图片；

那么问题来了，base64编码图片因为每次的生成方式相同，即图片一样，base64编码相同，则说明http请求的报文相同；

于是乎，在第一次生成失败后，由于是base64编码的图片，即使日志上显示跨域错误，但是作为HTTP请求并不会存在其对应的文件错误编码。

这个错误的图片依然被浏览器进行了缓存，后续所有的请求都会打在这个缓存上。

至于为什么每次生成访问这个缓存时还会报跨域错误，我的理解是因为 `html2canvas`   在生成图片时是进行类似 `try-catch` 的处理模式；

而在canvas再次加载时，因为是请求图片，依然由游览器发起http请求，而这个请求已经被缓存了，返回给canvas时还是不支持跨域的图片。

**解决**

在canvas访问范围中，禁止图片缓存
