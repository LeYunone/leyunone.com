---
date: 2022-05-22 14:50:42
title: Nacos源码阅读—服务注册与发现
category:
  - nacos
tag:
  - nacos
head:
  - - meta
    - name: keywords
      content: Nacos,源码阅读
  - - meta
    - name: description
      content: 本文各功能呢的源码入口通过源码阅读经验以及官方文档找到，不详细说明。
---

# Nacos源码阅读—服务注册与发现

本文各功能呢的源码入口通过源码阅读经验以及官方文档找到，不详细说明。

## 服务注册

所有的服务注册的体系原理都离不开：

客户端发起注册->服务端接收->服务端进行客户端信息注册

所以要了解Nacos的服务注册，则需要从客户端出发。

### NacosServiceRegistryAutoConfiguration

看版本，有一些版本在该类中所有注入的类是在NacosDiscoveryAutoConfiguration配置的。

在其注入的NacosAutoServiceRegistration对象中有这么一个监听方法

```
    @EventListener
    public void onNacosDiscoveryInfoChangedEvent(NacosDiscoveryInfoChangedEvent event) {
        this.restart();
    }
```

监听了Spring容器启动后，进行的pushlishevent发布事件，此时开启nacos服务注册。

根据 **restart**方法的链路，最终会指向 **NacosServiceRegistry**类中的 **register**方法

### NacosServiceRegistry
![image-20220522215131182.png](https://www.leyuna.xyz/image/2022-05-22/image-20220522215131182.png)width="auto" height="auto"


在服务注册前，nacos客户端侧都通过对配置文件的信息解析以及客户端的解析，构造出一个Instance实例，这个实例成为客户端与服务端的信息交互媒介
![image-20220522215324684.png](https://www.leyuna.xyz/image/2022-05-22/image-20220522215324684.png)width="auto" height="auto"


在通过**NacosNamingService**类中的 **registerInstance**方法的进一步加工后，将成熟的入参转交给下一流程，准备开始发起HTTP请求。

### NamingProxy

本类是nacos进行服务注册的实际执行者，发生在 **reqApi**方法中。

**在nacos服务端为单机环境下时：**
![image-20220522215953485.png](https://www.leyuna.xyz/image/2022-05-22/image-20220522215953485.png)width="auto" height="auto"

通过开发者在配置文件中设置的 **namingRequestDomainMaxRetryCount**数，重连服务端次数，将注册信息交给 **callServer**方法处理。

**在nacos服务端集群环境，服务端数量>1时：**

![image-20220522220117574.png](https://www.leyuna.xyz/image/2022-05-22/image-20220522220117574.png)width="auto" height="auto"

生成一个随机初始点，尝试连接服务器，如果服务器连接失败，则继续连接该初始点的下一个服务器，直接连接成功或连接次数超过服务器总数。

**callServer方法**

方法内部，简单的概述就是将入参的端口与ip地址拼接为请求路径，然后将待注册的客户端信息包装后发起请求。

![image-20220522220525854.png](https://www.leyuna.xyz/image/2022-05-22/image-20220522220525854.png)width="auto" height="auto"

向http://localhost:8848/nacos/v1/ns/instance发起请求，最终返回值ok，code200，则说明客户端服务注册成功。并且在后续中，会开启一个频率为5的心跳包。

那么在服务端跟踪服务注册，则只需要关注/v1/ns/instanceAPI的接口。

### InstanceController

nacos服务端接口，将客户端请求的数据，保存在一个Map集合中。

发生在 **ServiceManager**类的 **registerInstance**方法中。

**createServiceIfAbsent方法**

根据客户端定义的服务名以及拼接的namespaceId，添加至服务列表的同时，开启对该客户端服务的心跳监听。

**addInstance方法**

将客户端服务注册至服务列表中。

以上的注册过程，均发生在一个新服务首次注册中，如果是二次注册等，则有服务端自定义的缓存机制。

## 服务发现

服务发现有两步，一是发现服务器中所有已注册完的服务列表；二是在服务列表中找到指定的服务。

### NacosNamingService

**getAllInstances方法**调用 **getServiceInfo方法**

在本方法中，如果客户端是首次获取服务器服务列表，客户端会生成一个serverList的本地缓存，并且调用server接口获取最新的服务数据，然后将本次最新数据在延时执行的定时任务中，覆盖到本地缓存中。

并且开启定时获取服务器列表的最新数据事件，在一个时间中实时的更新本地缓存**updatingMap**。
