---
date: 2024-07-14
title: ThreadLocal之子线程共享
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: JAVA,单元测试,工厂模式,Mock
---
# ThreadLocal之子线程共享

ThreadLocal在我们开发中经常会被作为线程上下文存储的工具使用，每个线程拥有自己独立的副本集；

但是这仅仅只是针对当前线程的链路下共享，但我们在线程中开启子线程时；

由于ThreadLocal的key存储的是当前线程的实例，在子线程中无法找到父线程实际存储的内容，因此无法让主线程与子线程线程共享；

不过Jdk提供了一个类，alibaba开源了一个类供我们应对这种场景；

本篇是针对`InheritableThreadLocal` 和 `TransmittableThreadLocal` 的一则分析记录；

## InheritableThreadLocal

在`InheritableThreadLocal`中实现很简单，源码仅仅是重写了父类`ThreadLocal` 的三个方法

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-07-14/4.png" style="zoom: 67%;" />

在线程创建初始化时，会调用内部的`init()` 方法：

在其中有一断判断：

```java
        if (inheritThreadLocals && parent.inheritableThreadLocals != null)
            this.inheritableThreadLocals =
                ThreadLocal.createInheritedMap(parent.inheritableThreadLocals);

```

inheritThreadLocals默认为true，同时校验parent，是当前创建线程的线程中是否使用`inheritableThreadLocals` 赋值；

如果是，则将父类的map传入到子类中构建子线程的threadLocalMap；

在构建的过程中，会将父类的thread实例+子线程的thread实例组成一个新的`entry` 放进新的map中；

最终达到的效果就是子线程可访问到父类的共享值；

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-07-14/5.png" style="zoom: 67%;" />

**问题：** 只解决了父子线程的共享问题，但是在使用线程池创建子线程任务使用`InheritableThreadLocal` 去传递值时；会出现由于线程复用的关系，导致新建的任务取自的值不一定是来自父线程传递来的，而是该线程上一个任务所设置的，很明显这并不是我们想要的；

## TransmittableThreadLocal

2013年，alibaba开源了`TransmittableThreadLocal` 简称TTL，用来解决上述提出的问题；

地址：[https://github.com/alibaba/transmittable-thread-local](https://github.com/alibaba/transmittable-thread-local)

效果：

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-07-14/6.png" style="zoom:67%;" />

关于如何使用，因为是国人制造，中文文档写的很清楚，这里就不多赘述；

实现原理大体上看不难，将线程运行阶段分为三步：

1. 捕捉当前版本的所有TTL中设置的值（capture）
2. 在子线程运行时，将捕捉到的TTL进行赋值与备份（replay）
3. 子线程运行完毕，还原TTL值到捕捉版本（restore）

源码分析：

因为体库的轻量，源码非常简单的都能跟踪到；

首先是记录所有线程上下文内容的map：

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-07-14/7.png" style="zoom:67%;" />

由于继承自`InheritableThreadLocal` ，所以线程初始化创建时所做的逻辑与`InheritableThreadLocal` 无异；

然后是方法使用的入口：`TtlExecutors.getTtlExecutor`

```java
    @Nullable
    @Contract(value = "null -> null; !null -> !null", pure = true)
    public static Executor getTtlExecutor(@Nullable Executor executor) {
        if (TtlAgent.isTtlAgentLoaded() || executor == null || executor instanceof TtlEnhanced) {
            return executor;
        }
        return new ExecutorTtlWrapper(executor, true);
    }
//////

class ExecutorTtlWrapper implements Executor, TtlWrapper<Executor>, TtlEnhanced {
    private final Executor executor;
    protected final boolean idempotent;

    ExecutorTtlWrapper(@NonNull Executor executor, boolean idempotent) {
        this.executor = executor;
        this.idempotent = idempotent;
    }

    @Override
    public void execute(@NonNull Runnable command) {
        executor.execute(TtlRunnable.get(command, false, idempotent));
    }
}
```

针对线程池的执行做了一层封装，对所有线程使用TtlRunnable.get()方法；

TtlRunnable.get()方法返回出来的是一个`Runnable` ，可以定位到：

```java
    public static TtlRunnable get(@Nullable Runnable runnable, boolean releaseTtlValueReferenceAfterRun, boolean idempotent) {
        if (runnable == null) return null;

        if (runnable instanceof TtlEnhanced) {
            // avoid redundant decoration, and ensure idempotency
            if (idempotent) return (TtlRunnable) runnable;
            else throw new IllegalStateException("Already TtlRunnable!");
        }
        return new TtlRunnable(runnable, releaseTtlValueReferenceAfterRun);
    }
//////

public final class TtlRunnable implements Runnable, TtlWrapper<Runnable>, TtlEnhanced, TtlAttachments {
    
    @Override
    public void run() {
        final Object captured = capturedRef.get();
        if (captured == null || releaseTtlValueReferenceAfterRun && !capturedRef.compareAndSet(captured, null)) {
            throw new IllegalStateException("TTL value reference is released after run!");
        }
		
        final Object backup = replay(captured);
        try {
            runnable.run();
        } finally {
            restore(backup);
        }
    }
}
```

可以发现实际就是开头提到的，在线程运行时做的三个流程；

三个流程对应的含义也时如前文所说，代码实现则是简单的业务上的增删改了;

不过实现起来看似简单，但是作为一个高start的开源项目，总有优势让人买账；

我认为除了上述基本功能的实现外，`TransmittableThreadLocal` 还推出了agent探针的方式，无侵入的对当前系统进行补强是大部分人看好它的一大原因。

# 总结

使用建议：在高并发场景下，由于InheritableThreadLocal需要额外维护状态，‌这可能会对性能产生一定的影响；并且使用InheritableThreadLocal一定要注意set与remove配套使用；

在TransmittableThreadLocal中，子线程由于还原（restore）的特性，会自动的清空set的数据，倒是不用在意这点；不过也是在线程池使用中，要注意主线程set之后的remove或者重新set的时间，防止子线程拿到无效数据