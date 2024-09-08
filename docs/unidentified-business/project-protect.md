---
date: 2024-07-24
title: 系统保护性设计的念念碎
category: 笔记
tag:
  - note
---
# 系统保护性设计的念念碎

在我们的项目上线之后，总会出现各种各样的意外，比方说代码版本，锁并发，占用长连接等等导致Pn级的事故出现；

即使对服务器，系统，应用保护的再好也会因为一些纰漏造成水滴石穿的效果，不过俗话说的好：

**吃一堑长一智** 

在各方应对各种杂疑难症后，脑中也浮现了一些对于可能会出现的事故，提前需要做出的保护性设计；这可能是在代码层面，系统层面，监控层面...

## 限流与过滤

限流=过滤吗？

不完全等于，在应对层面过滤希望的是减少带宽消耗；限流则是针对某个接口的某个功能在特定时间下的稳定性；

### 过滤

在项目中有接入大数据量的消费需求时，需要考虑到如何在大数据量同时或者源源不断过来时，我们的系统在接入层的保护性设计；

一般除了保证接入方的集群，高可用外，对数据进行非有效数据的过滤是一定要思考到的；

这里按照我的经验过滤层的设计上有两方面：

1. 消息生产者/消息中间件的过滤脚本设计
2. 消息先通过“过滤应用”再转发到我方应用

前者好商量，是从源头上使用各个中间件的脚本处理插件或者生产者自行判断不无脑发送消息；

后者则是通过一个子服务为主服务流量分流；

所以前者不提，后者我提出一个很新颖的骚操作；

一般来说，过滤服务往往是由以下结构组成

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-07-24/2.png)

需要接入redis或者db判断这条数据是否有效需被过滤；

虽然redis性能很足，但是在小应用中，指3000dps下的应用中；

我们是可以直接采用纯内存的判断，使用JVM的常量+IO读文件+内存对象进行判断的；

相当于手写一个缓存存储的过滤应用，不走任何中间件；是否可行，这里推荐大伙自行小小的写一个demo去判断这种纯内存的应用性能，这里提一个关键字：由于是纯内存，依靠JVM的性能，那么就等同于服务器CPU越好性能就可以越高；

### 限流

限流是保护系统必不可少的环节，除开从网络中间商通过购买服务完成的限流，我们可以在代理，网关，直到系统接口设计各自的限流策略；

而限流策略逃不开几个关键字：IP，时间，同一方法；所指的各类限流算法也是：计数器算法，滑动窗口，令牌桶，漏桶......

这里推荐一个针对ip单机限流的最佳实现:

```java
public class IpLimiter {
    //生成速率
    private volatile double DEFAULT_LIMITER_COUNT = 0.5;
    //十分钟消失的缓存ip限流器
    private Cache<String, RateLimiter> limiterCache = CacheBuilder.newBuilder().expireAfterAccess(10, TimeUnit.MINUTES).build();

    @Autowired
    private HttpServletRequest request;

    @Around("execution(* com.leyunone.laboratory..*.*())")
    public Object around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        //代理透传过来的ip
        String realIp = request.getHeader("X-Real-IP");
        Signature signature = proceedingJoinPoint.getSignature();
        String key = String.join("_", realIp, proceedingJoinPoint.getTarget().getClass().getName() + "_" + signature.getName());
        RateLimiter rateLimiter = limiterCache.get(key, () -> RateLimiter.create(DEFAULT_LIMITER_COUNT));
        if (!rateLimiter.tryAcquire()) {
            //限流
            throw new RuntimeException();
        }
        return proceedingJoinPoint.proceed();
    }
}
```

## 动态配置

限流与过滤其实是大伙在开发时都明白的基本保护应用的方式，但是如果无法对过滤的规则以及限流的速率做动态的修改；

那么我们保护的是什么？是需要频繁重启更新的服务？

所以动态配置在我们系统中是非常重要的一环，总结经常使用到的动态配置手法：

1. 动态线程池
2. 留后门接口
3. 数据库db
4. 探针修改类
5. 中间件发布订阅
6. 可执行的字符串代码
7. ....

**动态线程池**，来源于美团  [Java线程池实现原理及其在美团业务中的实践](https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html)

简单的解释是`ThreadPoolExecutor` 可设置

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-07-25/1.png)

只需要通过自定义一个阻塞队列`ResizableCapacityLinkedBlockingQueue` ，将容量定位可变，动态线程池就这样实现了；

**留后门接口**，这一点是很多应用中很难避开的设置；

与其修改线上的缓存，数据库配置，倒不如定义一个需要鉴权密钥才能访问的接口：比方说上述限流的速率，可以通过后门接口修改速率变量；

**数据库db**，删除缓存...

**探针**， 这一点是针对过滤器应用，当我们修改某个过滤规则时，如果改动简单，比方说仅在本类操作，何不考虑通过动态探针实现在线上环境的热部署；

当然了，大部分企业都会为了避免其带来的意料之外的影响，还是会老实的选择灰度或红黑更新；

**中间件发布订阅**，更合适的说是监听属性值的变化，比方说发布rabbitmq，消费走预先定义的修改配置通过；或者监听环境变量等等。

**可执行的字符串代码**，见`Jexl`表达式

...

还有动态国际化文件，动态消息队列订阅等等等等，当我们的系统中充斥着大量可动态配置的规则时，有点~~不敢想~~；总之，动态配置的越多，对我们的系统保护也就更灵活

## 发布策略

项目的发布策略是稳定系统运行的最重要的一环，牢记三点：

1. 错开高峰
2. 快速回滚
3. 分流

当我们选择灰度发布时，即让V1和V2的系统同时运行，用户分流打到不同系统，变相进行线上环境测试；

只有一点是开发人员需要注意的，如果我们的系统被定位以后，将来存在灰度发布的可能，那么我们在所有的数据库DB操作中；

**请牢记把INSERT，SELECT语句的所属字段列的清清楚楚**

红黑蓝绿则没有这么多的限制，能支持应用快速回滚即可

## 监控与扩容

监控这一话题是保护系统绕不开的点，技术选型上一定要使用复合型：

- prometheus+Grafana性能监控
- Skywalking链路追踪

前者关注服务器与应用的运行状态，后者给工程师排查问题定位；

所以组合一定得有：性能监控+接口链路追踪

监控的主要目的除了能给我们一个可视化的面板外，最重要的是：**性能达到阈值时，触发扩容脚本**

比方说一个例子：

> 一大批数据进行我们系统，这些数据分为两种：强时效，无时效；但是我们的系统没有资源去处理这些数据，所以我们应该优先处理强时效的数据。

这里除了人工干预外，能自动解决的方案就是强时效和无时效的数据处理分为两个线程；

系统发现性能达到阈值时，触发脚本请求接口，将强时效的线程优先级`Priority` 拉高，另一拉低；这样就做到了由监控系统处理的性能问题；

## 高可用

- 冷备
- 双机热备
- 同城双活
- 异地双活
- 异地多活

# 总结

都是碎碎念，仅是一篇记录