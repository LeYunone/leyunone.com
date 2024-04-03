---
date: 2024-04-03
title: completefuture造成的rpc重试事故
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,笔记,事故分析
---
## 前言

最近经历了一个由于 `completefuture ` 的使用，导致RPC重试机制触发而引起的重复写入异常的生产bug。复盘下来，并非是错误的使用了completefuture，而是一些开发时很难意识到的坑。

## 背景

用户反馈通过应用A使用ota批量升级设备时存在概率性失败的可能；

功能的运行流程如下：

1. 应用A调用应用B的rpc接口
2. 应用B将请求发布至mqtt
3. 设备订阅接收，开始进行ota升级

通过复盘设备端以及后台的调用日志得知，设备端在相同时间戳或毫秒级相差的时间戳内收到了两条相同的指令，后台日志中也可以找到对应的消息发送日志。

那么这就是一个消息被重复发送的问题，一般有两种情况：

1. rpc接口被多次调用
2. 发布消息时出现重复发送

考虑到mqtt的qos特殊性，短暂的将`qos=0`，即不存在mqtt重发机制，依然会出现重复发送问题；

结合后台的接口调用日志后，可以确认是应用A重复调用了rpc接口。

## 复盘

在定位到是后台重复调用rpc接口问题后，解决与排查方式也就变得透彻了。

首先是查看代码：经过排查以及debug，应用A只是简单的业务方调用接口，并且由于app上有防触和后台接口限流处理，排除应用A的功能开发问题；

问题只可能出现在 **调用rpc** 与 **应用B接收与返回** 两个动作上；

熟悉远程调用服务的同学应该明白，rpc接口调用，特别是基于dubbo-注册中心这样的传统调用方式，是存在默认的失败熔断、降级，以及造成这次事故的罪魁祸首 `异常重试机制`。

**重试机制：**

```
在分布式接口调用场景中，上游方调用接口，为保证其接口的高可用性，会配置无感的重试时间以及重试策略用来抵御当网络波动，请求丢失，异常等问题时的接口可用性
```

由于应用B是中心类应用，是很多服务的下游应用，所以针对接口的高可用的设计都将其考虑到了正常调用的范畴中。

因此未防止应用A发起请求后，出现由于应用B的网络波动或业务内部的长链路导致的超时而出现重试调用的问题，业务B中采用了以下的执行器方式进行具体消息的发布：

```java
    public static void main(String[] args) {
		System.out.println("我已经收到了:"+t());
    }

	public static void rpcInterface(){
        Executor executor = new ThreadPoolExecutor(1, 2, 1L,
                TimeUnit.SECONDS, new LinkedBlockingDeque<>(2), Executors.defaultThreadFactory(), new ThreadPoolExecutor.CallerRunsPolicy());
        CompletableFuture<String> completableFuture = CompletableFuture.supplyAsync(() -> {
            System.out.println("业务开始，时间："+System.currentTimeMillis());
            try {
                Thread.sleep(1000L);
            } catch (InterruptedException e) {}
            System.out.println("开启供应链头,组装消息");
            System.out.println("组装");
            String message = "message";
            return message;
        }, executor);
		
        completableFuture.whenComplete((message, exception) -> {
            System.out.println("消息发送:" + message);
        });
        return "ok";
    }
```

当应用B的接口判断为处理时间不可控、非查询、消息发布等特殊接口时，会通过以上处理，将实际处理动作线程与rpc接口调用的返回分割开。

比如以上代码执行结果为：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-04/7c9c9a0a-922d-4773-b611-0570c2ccfafa.png)

### 出现问题

在排查过程中，猜测一定是CompletableFuture运行中出现了阻塞，导致返回 `ok` 的时间超过配置的超时时间而发生重试；

往这个方向考虑结果就很清晰了：

CompletableFuture发生阻塞，再次请求rpc接口，这时CompletableFuture运行，第一次与第二次请求同时进行了消息发布动作；

这里先提应用B在此处线程池的设计与使用了：超时时间3S，有边界队列，拒绝策略为线程等待或主线程执行；

在经过压测后并未发现问题，于是在次接口处理中同样使用了该线程池；

但是，批量ota升级这个动作有些业务上的特殊，会导致任务入队到执行的时间比预想中的要长；

因此这里出现阻塞的原因通过一步步排查得出结论为：

```
1、多个地方使用同一线程池，而最大线程数未扩容；
2、业务内部设计不合理，出现预料外的慢业务链路，导致占满
```

### 结论

这就像是一个陌生的同事接手了一个业务，然后模仿其他相识接口的开发`copy` 了相同的线程池执行器，然后一股脑的进行套用；

最终出现了这种在测试环境很难出现的问题，因为本地网络加上测试环境线程充足的原因，并且因为相同的线程执行器所以也未考虑到经过压测；

不过回顾这次事故本身，问题与解决很简单，可以算是不熟悉系统导致的bug。但是从另一个角度上看，其实完全可以从源头上避免掉这种重复调用rpc接口的bug出现。

## 接口幂等

处理重复调用，即对接口进行幂等性；

并非所有的rpc接口都需要对接口做幂等处理，对于非订单操作，db生成的功能，仅查询是无所谓重复调用的。

不过还是需要结合实际考虑，因为本次事故的接口中也是考虑到线程的分离也就没注意对接口进行幂等；

rpc接口幂等有三种通用方案：

### 方案一：

请求方请求时创建对应接口规则的分布式锁，下游方针对该锁作本次请求的一次调用

### 方案二：

结合重试时间对接口进行同一请求，几秒内请求ｎ次的限制

### 方案三：

前两者是比较自定义式的在接口的入口处进行幂等的处理方式；

在spring项目中，我们还可以通过aop组件去实现一个基于自定义注解的接口增强；

我们可以设计一个公共的sdk包common，在其中实现接口幂等组件的装配；

实现方式也很简单：

```java
@Aspect
@Component
public class InterfacelimitAspect {

    @Around("@annotation(limitInterface)) ")
    public Object limit(ProceedingJoinPoint point, VoiceEnter voiceEnter) throws Throwable {
        // 组成唯一的业务id point.getArgs();
        //或使用traceId
        boolean is =localCache.get(id);
        if(is)  //判断是否已经被执行 
            return;
        Object proceedResult =  point.proceed();
		
        return proceedResult;
    }
}
```





