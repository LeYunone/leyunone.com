# Dubbo自定义服务注册

## 前言

本篇前最好先了解什么是dubbo独特的spi机制

可见 [Dubbo源码阅读-可扩展机制](https://www.leyunone.com/frame/dubbo/dubbo-read.html#dubbo-spi)，最推荐的是结合网上的教学亲手写一个dubbo-spi的demo

## Dubbo服务注册

dubbo作为一个rpc框架，相对于其他同类框架的一个很大的优势是其强大的扩展性；

内部实现了独特的SPI机制，使得可以通过简单的`key-value`的配置实现兼容各种协议与注册中心类型；

查阅源码，服务注册模块中，通过其`internal`文件夹下的配置文件定位到具体执行的dubbo服务注册工厂；

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-12/d1.png)

关于dubbo源码的服务注册流程本篇不赘述，因为dubbo太过火热，随便一搜都可以查看优质博客分析源码

不过接下来讲述的不需要了解其注册流程，也可以自定义一个自己的dubbo服务注册；

**首先** 我们通过上图已经知道了，dubbo会通过`internal`文件夹下的SPI配置文件所指定的类去加载注册工厂和

 