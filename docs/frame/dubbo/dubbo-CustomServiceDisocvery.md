---
date: 2024-06-12
title: Dubbo自定义服务注册
category: 
  - Dubbo
tag:
  - Dubbo
head:
  - - meta
    - name: keywords
      content: Dubbo,乐云一,源码阅读
  - - meta
    - name: description
---
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

**首先** 我们通过上图已经知道了，dubbo会通过`internal`文件夹下的SPI配置文件所指定的类去加载注册工厂和服务注册执行类；

因此我们可以通过SPI的加载机制，强行覆盖掉我们需要自定义的逻辑类；

以下以自定义一个Nacos服务注册为例：

```java
public class NacosBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
	@Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        // 使用ExtensionLoader注册自定义的实现类
        ExtensionLoader<RegistryFactory> extensionLoader = ExtensionLoader.getExtensionLoader(RegistryFactory.class);
        extensionLoader.addExtension("nacos", CustomNacosRegistryFactory.class);
    }
}
```

在SpringBoot的后置处理器或容器初始化接口中可以使用`ExtensionLoader` 中的addExtension方法强行覆盖掉原本的`internal`下的配置

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-12/NACOS1.png)

通过如上的技巧，我们可以在不对Nacos源码二次开发的前提下，很简单的对Dubbo以Nacos为服务注册中心时的源码自定义修改；

接下来，我们只需要将原本的`NacosRegistryFactory` 类Copy过来，结合对其源码的理解进行调整；

```java
public class NacosRegistryFactory extends AbstractRegistryFactory {

    //创建服务路由的缓存key
    @Override
    protected String createRegistryCacheKey(URL url) {
        String namespace = url.getParameter(CONFIG_NAMESPACE_KEY);
        url = URL.valueOf(url.toServiceStringWithoutResolving());
        if (StringUtils.isNotEmpty(namespace)) {
            url = url.addParameter(CONFIG_NAMESPACE_KEY, namespace);
        }
        return url.toFullString();
    }
	//创建服务注册工厂
    @Override
    protected Registry createRegistry(URL url) {
        return new NacosRegistry(url, createNamingService(url));
    }
}
```

在经过自定义调整后：

```java
public class CustomNacosRegistryFactory extends NacosRegistryFactory {

    @Override
    public Registry createRegistry(URL url) {
        /**
        * 逻辑A
        **/
        return new CustomNacosRegistry(url, createNamingService(url));
    }

}
```

因而我们最后只需要自定义一个 `CustomNacosRegistry` ，在里面进行服务注册的实际调整，这样就可以完成一个Dubbo自定义基于Nacos为注册中心的服务注册了；

### Registry类

最后我们过一下需要自定义的Registry类，便于自定义服务注册时不出差错；

首先因为是源码级的修改，所以必须也是最好将原本的`NacosRegistry` 类全然Copy过来；

这是一个继承了`FailbackRegistry` 的类，注意名字，虽然他带着Fail，但是其实是指NacosRegistry是一个支持失败重试的Registry；

看源码需要根据目的对症下药，既然是要自定义服务注册，那么可以排除到很多方法，指向`FailbackRegistry`的`register`方法

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-12/nacos2.png" style="zoom:67%;" />

首先是校验上报的服务URL是否合法，然后进行缓存，清缓存，重复服务的更新意思；

最后走到了`public abstract void doRegister(URL url)`方法，而这个方法是一个抽象方法，需要其子类也就是`NacosRegistry`实现

这样看就很简单且明确了，在NacosRegistry的实现方法中：(去掉了日志和注释)

```java
    @Override
    public void doRegister(URL url) {
        if (PROVIDER_SIDE.equals(url.getSide()) || getUrl().getParameter(REGISTER_CONSUMER_URL_KEY, false)) {
            Instance instance = createInstance(url);

            Set<String> serviceNames = new HashSet<>();

            String serviceName = getServiceName(url, false);
            serviceNames.add(serviceName);

            if (getUrl().getParameter(NACOE_REGISTER_COMPATIBLE, false)) {
                String compatibleServiceName = getServiceName(url, true);
                serviceNames.add(compatibleServiceName);
            }

            for (String service : serviceNames) {
                namingService.registerInstance(service, getUrl().getGroup(Constants.DEFAULT_GROUP), instance);
            }
        }
    }
```

代码很直观：

1. 根据URL创建通讯实例，里面包括了服务的IP，端口，协议参数
2. 创建本服务的注册名和命名空间
3. （Dubbo版本升级2.7.8 ，兼容Nacos版本服务注册）
4. 服务注册服务，与Nacos进行通讯

到此，我们可以简单修改的服务注册范围结束，剩下的则是一动动万身；

不过也已经很足够了，举个例子：**我需要将我的服务不分命名空间注册到Nacos中**

**背景：** 因为实际开发中存在开发环境和测试环境两个注册中心，如果某个服务因为特殊因素影响导致只能部署测试环境，那么开发环境中的其余项目是无法调用该服务的；

因此我们可以在这部分注册的时候进行自定义修改：

```java
    @Override
    public void doRegister(URL url) {
        final String serviceName = getServiceName(url);
        final Instance instance = createInstance(url);
        //共享服务
        List<NamingService> shareNamingServices = new ArrayList<>();
        namingService.registerInstance(serviceName,
                getUrl().getParameter(GROUP_KEY, Constants.DEFAULT_GROUP), instance);
        shareNamingServices.for
            ....注册
    }
```

共享服务则是在前述NacosBeanFactoryPostProcessor中进行设置，指定初始化需要共享的服务配置；

## 结论

除了Nacos，目前Dubbo支持的注册中心核心都是实现`doRegister`方法；

并且因为都使用了SPI机制，因此可以采用上述覆盖原有源码的配置进行自定义操作；

在只需要对服务注册前和服务注册后做某些事，比如注册增强，注册完成后的日志记录都是一个非常不错的方案