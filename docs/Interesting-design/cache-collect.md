---
date: 2024-08-10
title: 自定义一个缓存型数据聚合桶
category: 
  - 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: Java,CAS,线程锁,乐云一
  - - meta
    - name: description
      content: 可使用基于本地local和缓存redis 的缓存型数据聚合桶，收集n秒内的数据批量的进行数据写入操作；
---
# 缓存型数据聚合桶

## 背景

当需求达成如下条件时：

1. 写请求频繁
2. 可通过当前数据与上一条数据对比过滤掉无效数据
3. 不需要强时效性
4. 尽可能的源源不断的上报数据

可使用基于本地`local` 和 缓存`redis` 的缓存型数据聚合桶，收集n秒内的数据批量的进行数据写入操作；

## 准备

一个对象，必要的两个属性：

1. 当前业务id下的水位值
2. 收集当前聚合时间内数据的集合

如下：

```json
{
    "currentWater":"当前水位值",
    "frequency":5, //变更频率
    "lastAttr":"最后的水位值",
    "valueCollects":["1","2"]
}
```

上述是一个收集n秒内的值记录，当n秒内值变更频率超过5次时，进行记录入库的功能。

缓存可以采用`Google Guava` 的`cache` 结构和`Redis` 的`String/list/...`结构；

`Google Guava cache`是借鉴了ConcurrentHashMap的缓存结构，因此在并发下进行数据收集时支持访问的同时被更新；并且在往其中注册`removalListener`后，通过设计可以实现和延时执行的线程一样的效果，n秒后执行`removalListener` 中的方法。

`cache` 如下：

```xml
        <dependency>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
            <version>30.0-jre</version>
        </dependency>
```

```java
Cache<String, RecordCache> localCache = CacheBuilder.newBuilder()
            .maximumSize(801).removalListener(new RemovalListener<String, RecordCache>() {
                @Override
                public void onRemoval(RemovalNotification<String, RecordCache> notification) {
                    RecordCache recordCache = notification.getValue();
                    if (ObjectUtil.isNotNull(recordCache.getLastAttr())) {
                        recordCache.getAttrLogs().add(recordCache.getLastAttr());
                    }
                    recordDao.saveBatch(recordCache.getAttrLogs());
                }
            }).expireAfterWrite(1, TimeUnit.MINUTES).build();
```

`redis`如下：

```json
key:标识id
value:{ "currentWater":"当前水位值","frequency":5}
```

## 理论

收集n秒内的消息，然后入库；

这么一个简单的动作，有很多实现方式，也是我们常说的数据聚合，批量新增；

最简单的是开启一个延时线程，延时执行线程任务：

```java
ScheduledExecutorService threadPool = Executors.newScheduledThreadPool(3);
threadPool.schedule(thread, 5, TimeUnit.SECONDS);
```

或者开启一个定时线程，使用一个全局的集合收集：

```java
public static List<String> record = new ArrayList();
@Scheduled(cron = "0 0/3 * * * *?")
public void collect(){
}
```

也可以通过消息队列异步处理；

总之，这个动作一定是延时执行一个本该在现在执行的任务，而这个任务的核心动作就是收集数据；

不难发现上述提到的都是通过开启另一个线程异步的处理，这样不好吗？很好，我指的是数据量小，收集不频繁的前提下；

额外的线程开销在开发中是不希望只为了一个简单的动作、功能展开的，因此本篇的结合本地缓存+`Redis`的思路是一个在数据量可接收，收集频繁的场景下比较好方案；



**核心思想**如下：

通过**本地缓存做收集器，Redis为其削峰兜底**

将`Google Guava cache` 的缓存过期 设置为`expireAfterWrite` ，即本次写入后，n秒内没有再次写入这个key的缓存，则这个缓存过期；

然后设置缓存的过期事件`removalListener` 在里面将缓存对象取出，而缓存对象内容则是上述中提到的对象，里面有当前时间时间片的数据集合

`"valueCollects":["1","2"]`

简单的：设置缓存=开始本次数据的收集，缓存过期=本次数据收集结束，数据批量入库

但是要注意本地缓存结构的一个特点：

**没有额外的开销会监听缓存是否过期，而是访问这个缓存的这个key时才会发现他过期而触发其过期事件**

当我们通过上述设计后，缓存key标识未被再次访问时这个缓存对象就永远不会消失而被**垃圾GC**，且本收集桶未有数据进入期间缓存对象就永远不会消失，这不妥妥的 **内容泄露** 吗 😡

所以就引入了本篇使用场景下一个很重要的条件：源源不断的数据

这一条件在很多项目中并不难达成，而需要这个条件的原因即是这个方法：

```java
    private boolean pruneLocalCache(String key) {
        LogCache ifPresent = localCache.getIfPresent(key);
        boolean hasLocal = true;
        if (ObjectUtil.isNull(ifPresent)) {
            //通知清理缓存
            localCache.cleanUp();
            hasLocal = false;
        }
        return hasLocal;
    }
```

数据来时，判断缓存是否命中，如果为命中则通知本地缓存自检清理空闲对象，这时 `Google Guava cache` 会将已经准备好的过期缓存分片直接remove掉；

那么问题解决了，问题就又来了，难道每个缓存未命中时都要做这个操作？

当然不是，首先我们对本地缓存的定位一定是有一个内存阈值的，在缓存长度未达到这个阈值时，即使“内存泄露” 不释放，也是在设计范畴内；

所以最终本地缓存的使用就变成了：

```java
    public void handler(String key, String newData) {
        boolean local = localCache.size() <= 800;
        List<String> attrLogs = new ArrayList<>();

        /**
         *  本地缓存，聚合一分钟内的数据入一次库
         *  redis缓存，入库判定成功即入库
         */

        /**
         * 该缓存逻辑为： 防止A设备进入到redis收集后，本地缓存放开，又进入到本地缓存中 反之相同
         */
        boolean inRedis = cacheManager.exists(key);
        if ((local || this.pruneLocalCache(key)) && !inRedis) {
            logger.debug("local cache attrlog:{}", key);
            useLocalCache(key, newData);
        } else {
            logger.debug("redis cache attrlog:{}", key);
            String cacheResult = useRedisCache(key, newData);
            if (ObjectUtil.isNotNull(cacheResult)) {
                attrLogs.add(cacheResult);
            }
        }
        if (CollectionUtil.isNotEmpty(attrLogs)) {
//            saveBatch(attrLogs);
        }
    }
```

使用Redis兜底，当本地缓存达到阈值时，通知本地缓存释放过期对象；

而使用Redis作为收集桶时，是否需要采用数据聚合则结合项目进行讨论；

我这里使用的是Redis收集时为实时入库，因为收集的是频繁变化的数据，所以只需要定一个过期时间，在过期时间内通过变化频率判断是否入库；

再引入一把数据标识`key` 作为同步锁，保证并发时的线程安全

## 结论

已经在线上环境中稳定工作许久的代码，性能ok，峰值ok；

当然这是结合项目、场景、数据量..等等因素综合来看是ok的设计方案，不过缺陷也很明显：

1. 由于是本地缓存，所以阈值不能太大，需要有经验的设计人士定义size
2. 大峰值时，数据库、Redis压力过大，由于本地缓存达到阈值后，流量都是直接打向Redis和数据库，所以热点可想而知
3. 数据无法恢复，使用本地缓存无法避免的问题
4. 分布式系统不能使用，这也没在这套方案的考虑范畴中
5. ...

而优点就是：`简单`、`拓展性高` 、`灵活`

## 代码

```java
public class DataCollectHandler {

    /**
     * 频率入库阈值
     * 按照设备最短每秒上报一次，最坏情况是隔n秒入库一次
     */
    @Value("${limit.collect.threshold:10}")
    private final int threshold = 10;

    /**
     * 缓存过期 = 数据落库
     */
    private final Cache<String, LogCache> localCache = CacheBuilder.newBuilder()
            .maximumSize(801).removalListener(new RemovalListener<String, LogCache>() {
                @Override
                public void onRemoval(RemovalNotification<String, LogCache> notification) {
                    LogCache logCache = notification.getValue();
                    if (ObjectUtil.isNotNull(logCache.getAttrLogs())) {
                        logCache.getAttrLogs().add(logCache.getLastAttr());
                    }
                    //saveBatch(logCache.getAttrLogs());
                }
            }).expireAfterWrite(1, TimeUnit.MINUTES).build();

    public void handler(String key, String newData) {
        boolean local = localCache.size() <= 800;
        List<String> attrLogs = new ArrayList<>();

        /**
         *  本地缓存，聚合一分钟内的数据入一次库
         *  redis缓存，入库判定成功即入库
         */

        /**
         * 该缓存逻辑为： 防止A设备进入到redis收集后，本地缓存放开，又进入到本地缓存中 反之相同
         */
        boolean inRedis = cacheManager.exists(key);
        if ((local || this.pruneLocalCache(key)) && !inRedis) {
            logger.debug("local cache attrlog:{}", key);
            useLocalCache(key, newData);
        } else {
            logger.debug("redis cache attrlog:{}", key);
            String cacheResult = useRedisCache(key, newData);
            if (ObjectUtil.isNotNull(cacheResult)) {
                attrLogs.add(cacheResult);
            }
        }
        if (CollectionUtil.isNotEmpty(attrLogs)) {
//            saveBatch(attrLogs);
        }

    }

    private boolean pruneLocalCache(String key) {
        LogCache ifPresent = localCache.getIfPresent(key);
        boolean hasLocal = true;
        if (ObjectUtil.isNull(ifPresent)) {
            //通知清理缓存
            localCache.cleanUp();
            hasLocal = false;
        }
        return hasLocal;

    }

    private void useLocalCache(String key, String newData) {
        boolean inStorage = false;
        LogCache logCache = localCache.get(key, () -> {
            LogCache log = new LogCache();
            log.setCurrentWater(newData);
            return log;
        });

        logCache.setFrequency(logCache.getFrequency() + 1);
        if (logCache.getFrequency() >= threshold && !newData.equals(logCache.getCurrentWater())) {
            logCache.setFrequency(0);
            inStorage = true;
        }
        logCache.setLastAttr(newData);
        logCache.setCurrentWater(newData);
        if (inStorage) {
            //最后的埋点置空
            logCache.setLastAttr(null);
            logCache.getAttrLogs().add(newData);
        }
    }

    /**
     * 使用redis缓存兜底 实时记录
     */
    private String useRedisCache(String dataKey, String newValue) {

        LogCache logCache = new LogCache();
        boolean inStorage = true;
        String key = dataKey;
        String inStorageResult = null;
        boolean hasCool = cacheManager.exists(key);
        if (hasCool) {
            inStorage = false;
            synchronized (key) {
                logCache = cacheManager.getData(key, LogCache.class);
                logCache.setFrequency(logCache.getFrequency() + 1);
                if (!logCache.getCurrentWater().equals(newValue) && logCache.getFrequency() >= threshold) {
                    logCache.setFrequency(0);
                    inStorage = true;
                }
                logCache.setCurrentWater(newValue);
                cacheManager.upDataValueNotExpireTime(key, JSONObject.toJSONString(logCache));
            }

        } else {
            logCache.setCurrentWater(newValue);
            cacheManager.addData(key, JSONObject.toJSONString(logCache), 1, TimeUnit.MINUTES);
        }

        if (inStorage) {
            inStorageResult = newValue;
        }
        return inStorageResult;
    }

    @Data
    public static class LogCache {

        /**
         * 当前水位值
         */
        private String currentWater;
        /**
         * 频率值
         */
        private Integer frequency = 0;
        /**
         * 最后的值上报
         */
        private String lastAttr;

        private List<String> attrLogs = new ArrayList<>();
    }
}
```

