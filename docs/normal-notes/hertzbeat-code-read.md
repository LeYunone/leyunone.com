# hertzbeat时间轮源码阅读

`hertzbeat`作为和`prometheus`一样运维监控工具，具备获取目标系统性能指数的功能，并将其图表可视化（虽然后者依靠Grafana）。

他们是如何在恶劣的环境下（数据量、性能）获取数据的，一直是我疑惑的点，`prometheus` Go语言开发+国外的标签一直是我没有主动解惑的原因；在最近了解使用到hertzbeat后，也是顺势而为的阅读起这个JAVA+国产开发的运维监控系统；

项目地址：[https://github.com/apache/hertzbeat](https://github.com/apache/hertzbeat)

## 入口（调度器）

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-02-23/image-20250218170421545.png" alt="image-20250218170421545" style="zoom: 80%;" />

包名一目了然，我的目的是想知道如何获取数据，因此关注hertzbeat-collector包：

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-02-23/image-20250218170519830.png" alt="image-20250218170519830" style="zoom:80%;" />

至于为什么本次的切入点入口是`CommonDispatcher` ，一是因为类上的注释`Collection task and response data scheduler` = **收集任务和响应数据调度器** . 二则是命名直觉，其中的参数名和方法都指向了这个类的作用就是进行收集任务的调度；

回到入口，见类中的`start()` 方法，在类初始化时被调用，作用名如其名：**开始**

```java
 public void start() {
        try {
            workerPool.executeJob(() -> {
                Thread.currentThread().setName("metrics-task-dispatcher");
                while (!Thread.currentThread().isInterrupted()) {
					/**
					*  从队列里中取MetricsCollect任务
					*  异常处理：降优先级，重新投递
					**/
                }
            });
            ThreadFactory threadFactory = new ThreadFactoryBuilder()
                    .setNameFormat("metrics-task-timeout-monitor-%d")
                    .setDaemon(true)
                    .build();
            //开启一个延时2秒，20秒间隔的周期任务
            ScheduledThreadPoolExecutor scheduledExecutor = new ScheduledThreadPoolExecutor(1, threadFactory);
            scheduledExecutor.scheduleWithFixedDelay(this::monitorCollectTaskTimeout, 2, 20, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Common Dispatcher error: {}.", e.getMessage(), e);
        }
    }
```

入口的处理很简单，指取任务执行，重点类是`MetricsCollect` ，见后文；而周期任务也可以从方法名看出来，用来处理超时任务：

```java
    private void monitorCollectTaskTimeout() {
        try {
            long deadline = System.currentTimeMillis() - DURATION_TIME;
            for (Map.Entry<String, MetricsTime> entry : metricsTimeoutMonitorMap.entrySet()) {
                MetricsTime metricsTime = entry.getValue();
                if (metricsTime.getStartTime() < deadline) {
                    // Metrics collection timeout  
                    WheelTimerTask timerJob = (WheelTimerTask) metricsTime.getTimeout().task();
                    //省略
                    log.error("[Collect Timeout]: \n{}", metricsData);
                    //如果改任务优先度为0，即使超时也进行数据上报，进行强行补偿
                    if (metricsData.getPriority() == 0) {
                        dispatchCollectData(metricsTime.timeout, metricsTime.getMetrics(), metricsData);
                    }
                    metricsTimeoutMonitorMap.remove(entry.getKey());
                }
            }
        } catch (Exception e) {
            log.error("[Task Timeout Monitor]-{}.", e.getMessage(), e);
        }
    }
```

大致就是从`metricsTimeoutMonitorMap` 中取出任务判断是否超时，那么这里的逻辑核心就是找到`metricsTimeoutMonitorMap`的数据来源在哪。

## 收集器

可以看到入口上任务是由`MetricsCollect` 驱动的，他的属性包含有：

| 字段                | 含义                                    |
| ------------------- | --------------------------------------- |
| runPriority         | 执行优先度                              |
| collectDataDispatch | 采集调度器                              |
| timeout             | 超时时间                                |
| metrics             | 分配配置                                |
| isCyclic            | 是否为周期性任务                        |
| isSd                | 是否需要发送给其他服务（hertzbeat集群） |
| ...                 | ...                                     |

`run`方法中，只有一个动作：发起请求获取数据，将数据推入收集调度方法中：

```java
 	public void run() {
  		//
        CollectRep.MetricsData.Builder response = CollectRep.MetricsData.newBuilder();
        response.setApp(app);
        response.setId(id);
        response.setTenantId(tenantId);

        //如果是prometheus的值直接无缝使用
        if (DispatchConstants.PROTOCOL_PROMETHEUS.equalsIgnoreCase(metrics.getProtocol())) {
            List<CollectRep.MetricsData> metricsData = PrometheusAutoCollectImpl
                    .getInstance().collect(response, metrics);
            validateResponse(metricsData.stream().findFirst().orElse(null));
            collectDataDispatch.dispatchCollectData(timeout, metrics, metricsData);
            return;
        }
        response.setMetrics(metrics.getName());
        //获取对应协议的数据采集器
        AbstractCollect abstractCollect = CollectStrategyFactory.invoke(metrics.getProtocol());
        if (abstractCollect == null) {
        } else {
            try {
                abstractCollect.preCheck(metrics);
                //采集数据
                abstractCollect.collect(response, metrics);
            } catch (Exception e) {
            }
        }
        if (fastFailed()) {
            return;
        }
        //计算请求拿到的值 通过单位转化器、Jexl表达式获取最终采集值
        calculateFields(metrics, response);
        CollectRep.MetricsData metricsData = validateResponse(response);
        //将数据上报给调度方法
        collectDataDispatch.dispatchCollectData(timeout, metrics, metricsData);
    }
```

ok，收集器的动作如料想的一样：

1. 发起请求获取数据
2. 将数据值进行转化为hertzbeat格式数据
3. 数据上报给调度器

因此我们的采集链路到了又到了调度器中，见`dispatchCollectData`方法

## 上报

