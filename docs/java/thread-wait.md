---
date: 2023-06-03
title: 主线程等待子线程\线程池的几种方式
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: JAVA，主线程等待子线程\线程池的几种方式
  - - meta
    - name: description
      content: 对于线程在开发中的灵活运用，有些知识点是需要碰到坑时才方悟甚往。比如本次将阐述的，主线程等待子线程任务完成的几种方式
---
​	**对于线程在开发中的灵活运用，有些知识点是需要碰到坑时才方悟甚往。比如本次将阐述的，主线程等待子线程任务完成的几种方式。**

**方法很简单，但我们一定要深刻的了解各个方式的优缺点，以对在实际开发中的合理运用**

# 线程等待

`本篇中的介绍顺序没有任何意义`，包含线程池场景、单个子线程场景、多个子线程场景

## Thread.join()

关于线程的生命周期，以下图为网络资源

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-03/14dd0e47-e790-4af1-9414-0697e7a445c8.png)

在这里join方法就不过多介绍了，相信接触过线程的多少都有所了解

通过join方法，可以指定某个线程保存等待状态，即：

```java
    public static void joinThread() throws InterruptedException {
        Thread thread = new Thread(() -> {
            try {
                TimeUnit.SECONDS.sleep(5);
                System.out.println("子线程完成1");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        thread.start();
        thread.join();
        System.out.println("主线程任务");
    }
```

从API层面，强行将线程资源倾斜，优点很明显，代码简单。

但是非常不推荐使用，除非业务场景恰好是：

仅有一个子线程任务，且主线程必须等待子线程完成。

**但是**，如果面临这样的业务场景，何必还使用join，可以使用更好的方法代替。因为join的缺点很明显：

1. 超时时间无法回调以及有效判断
2. 多个子线程，无法同时等待
3. 主线程阻塞风险暴露 

## CountDownLatch

`CountDownLatch`是我比较喜欢使用的控制线程放行的原子操作类

何为原子操作类，是与JDK中Atomic、AQS有紧密关联的JUC包类，即线程的安全并行级操作的原子类

CountDownLatch使用也非常非常简单：

```java
    public static void countlatchdown() throws InterruptedException {
        final CountDownLatch countDownLatch = new CountDownLatch(4);
        ExecutorService executorService = Executors.newFixedThreadPool(4);
        for (int i = 0; i <= 3; i++) {
            final int count = i;
            executorService.submit(() -> {
                        try {
                            TimeUnit.SECONDS.sleep(count);
                            System.out.println("子线程完成" + count+"当前："+countDownLatch.getCount());
                            countDownLatch.countDown();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
            );
        }
        countDownLatch.await();
        System.out.println("主线程完成");
    }
```

通过给 `CountDownLatch` 设置计数值，使用 `await`方法阻塞，当计数为<=0时，阻塞放开。

由于 `CountDownLatch` 提供的getCount 方法，我们可以操作出：

- 打印子线程的执行状态
- 控制子线程完成量

并且由于 CountDownLatch 原子的特性，支持在多个子线程、线程池中控制子线程与主线程的阻塞关系

所以他的优点：

- 实现简单
- 可控
- 支持多个线程池操作

但是缺点也很明显，只可以在明确知道创建几个子线程并为其等待的业务场景中使用。

## 等待标识

等待标识的设置方式非常的广，其标识设计，也是一个开发技术成长的一个过程：

- 并发级集合
- Mysql控制
- volatile关键字
- 原子类AtomicInteger、AtomicBoolean...
- redis
- redisLua脚本
- zookeeper锁
- ...

比如以下一个最简单的通过标识控制线程阻塞：

```java
 public static void waitFlag() {
        AtomicInteger integer = new AtomicInteger(0);
        Thread thread = new Thread(() -> {
            try {
                TimeUnit.SECONDS.sleep(5);
                System.out.println("子线程任务");
                integer.addAndGet(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        thread.start();
        while(integer.get()!=1){   
        }
        System.out.println("主线程任务");

    }
```

笼统的来说，等待标识更像是主线程与子线程，被一把锁给控制，不过这把锁的控制权可以全权交给业务方处理。

并且，后续基于redis/Zookeeper...等第三方组件设计标识，更是可以达到分布式子线程之间的交互控制。

所以他的优点是：

- 可行性控制（控制标识交予业务方自己处理）
- 跨线程任务
- 支持多线程
- ...

不过由于阻塞原理类似Thread.join()方法，所以在风险与缺点层面有其相似： 

- 超时时间无法回调以及有效判断
- 维护成本高（仅对使用第三方标识时）
- 阻塞方式一般都损耗性能：无论是将主线程挂起 `LockSupport.park();` 或是 线程等待。

## CompletableFuture

再JDK8中，引入了`CompletableFuture `也带来了响应式编程概念。

何为响应式编程，举个形象的例子：

主线程运行像一条水流，绵绵不绝；而`CompletableFuture`触及的地方，则是流向这条水流的小分支。

比如我简单的实现一个`CompletableFuture `，并主线程为其等待的代码：

```java
    public static void completableFuture() throws ExecutionException, InterruptedException, IOException {
        CompletableFuture<String> thread1 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(2000L);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "子线程任务一";
        });
        CompletableFuture<String> thread2 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(4000L);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "子线程任务二";
        });
        System.out.println(thread1.get());
        System.out.println(thread2.get());
        System.out.println("主线程任务");
    }
```

`CompletableFuture` 可通过get/join/when...等方式，让主线程代码做出等待其完成的操作，就像是给这条水流上了一个阀口，控制流动。

本篇文章不介绍 `CompletableFuture`  的特性以及使用，但是响应式编程的思路，本身就是一个等待响应，继续运行的设计。

`CompletableFuture`是基于对 `Future` 的迭代升级，所以他目前支持，同步、异步、回调、异常等方向。

不过缺点就是会使代码可读性变弱，并且拥有一定的学习成本



## 线程池等待

当使用到线程池时，可以通过 `awaitTermination` 方法进行阻塞

```java
    public static void threadPoolWait() throws Exception{
        ExecutorService executorService = Executors.newFixedThreadPool(4);
        for (int i = 0; i <= 3; i++) {
            final int count = i;
            executorService.submit(() -> {
                        try {
                            TimeUnit.SECONDS.sleep(count);
                            System.out.println("子线程任务"+count);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
            );
        }
        boolean b = executorService.awaitTermination(20, TimeUnit.SECONDS);
        System.out.println("主线程完成"+b);
    }
```

不过只适用与小任务的线程池创建使用，因为 awaitTermination 会强行将主线程挂起，直到超时时间结束。

但是通过超时时间的设置，我们可以得到两种结果：

- 超时时间内，线程池执行完毕，返回true
- 超时时间内，线程池位执行完毕，返回false

所以对于需要回调子线程执行结果集的场景，使用 `awaitTermination ` 小巧且灵活

