​	**对于线程在开发中的灵活运用，有些知识点是需要碰到坑时才方悟甚往。比如本次将阐述的，主线程等待子线程任务完成的几种方式。**

​	**方法很简单，但我们一定要深刻的了解各个方式的优缺点，以对在实际开发中的合理运用**

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

从 

```makefile
1、并发级集合
3、Mysql控制
2、volatile关键字
3、原子类AtomicInteger、AtomicBoolean...
4、redis
5、redisLua脚本
6、zookeeper锁
7、...

```

