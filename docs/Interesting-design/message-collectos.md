---
date: 2022-05-04
title: 按秒触发消息收集器
category: 
  - 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: JAVA,消息队列,阻塞队列,线程池,rabbitmq,乐云一
  - - meta
    - name: description
      content: 需要将接收到的消息进行累计，然后每过X秒之后，统一消费；以此循环，只要有消息接收，就进行累计-统一消费的逻辑
---
>  开发时遇到一个需求场景：
>
> 需要将接收到的消息进行累计，然后每过X秒之后，统一消费；以此循环，只要有消息接收，就进行累计-统一消费的逻辑

**场景**：

每5秒消费一次收集的消息

# 数据收集

## 方案一：

定时任务+一个map

实现：

```
Task/任何框架或While死循环线程 的定时任务，每5秒执行一次。

使用一个全局的ConcurrentHashMap；

定时任务中 直接对该map进行 每5秒一次的消费 - 清空
```

**缺点**： 能想到的关于性能、安全等问题全没有保证

**优点**： 简单



## 方案二：

延时队列 **DelayQueue **

实现：

```
定义一个上一个5秒的时间戳，比如现在的上一个时间戳是8:00:35
那么35秒 - 40秒 ，
在36秒收集一条消息，存入DelayQueue中时间为4秒
在37秒收集一条消息，---------------时间为3秒
......

当到40秒时，存入的消息释放，给予一个100ms的处理【取出】时间放入一个map中。
```

**缺点**：很跳脱的想法；如果5秒内，不管哪个时间点上存入一笔多消息，那么队列移动节点的开销以及时间消耗无法估量。

**优点**： 不需要关注安全问题，因为每个时间点存入的消息在统一消费时都是隔离着的。



## 方案三：

 **ScheduledThreadPoolExecutor**+状态阻塞

实现：

```
创建一个5S延时执行的线程池。
当一条消息进入时，创建一个线程加入线程池；
并且将该消息放至唯一的一个消息收集容器中
后续判断线程池是否有线程，如果有则填入容器中

5秒收集结束后，改变status为阻塞【CountDownLatch】，消息处理完以后放开
```

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-10-31/f43e30fd-70d2-4196-8e19-95e6f5734f90.png)

**缺点**： 消息处理速度无法估量，导致前一个线程已经过了5秒但是无法立刻放开，主线程阻塞消息堆积，导致ack重发、SQL超时等等问题

**优点**： 引入线程池+延时的概念，创建收集桶【消息收集容器】，保证了消息的统一收集，统一消费

## 方案四：

**ScheduledThreadPoolExecutor**+2个map+轮询

实现：

```
创建一个5S延时执行的线程池。
当一条消息进入时，创建一个线程加入线程池；
然后判断当前status【默认为1】，
如果为1，则将消息放至2中。
如果为2，则将消息放至1中。

5秒收集结束，
如果当前status为1，则接受容器2中所有对象，然后将status改变为2。
如果当前status为2，则接受容器1中所有对象，然后将status改变为1。
处理消息
清空拿到的容器。
```

**缺点**： 如果处理消息时间过长，则会将 下下个5秒的消息累计到下个5秒上。并且由于当前累积，导致下次累积，又会导致下次累积++++。

**优点**： 理论上根据业务的并发强度以及消息的处理速度，创建2个甚至2个以上map容器进行存储，是可以保证没有缺点的【统一收集，统一消费，5秒】的方案



## 方案五：

**ScheduledThreadPoolExecutor** + 线程队列

本方案是根据业务设定的最终方案，也是我觉得最适合“消息收集”场景使用的模板

```java
@Component
@RabbitListener(bindings = @QueueBinding(
        value = @Queue(value = "XXX", durable = "true"),
        exchange = @Exchange(value = "XXX", type = ExchangeTypes.TOPIC),
        key = {"XXX"}
))
public class CollectosMessageConsumer {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    private final ScheduledExecutorService threadPool = Executors.newScheduledThreadPool(3);

    private final BlockingQueue<ProductionThread> blockingQueue = new LinkedBlockingDeque<>(3);
    
    @Autowired
    private XXXService xxxService;

    @RabbitHandler
    public void processMessage(@Payload String msg, Channel channel, Message message) throws IOException {
        logger.info("RECEIVE MESSAGE = === " + msg);
        Message message = JSON.parseObject(msg, Message.class);
        if (ObjectUtil.isNotNull(message)) {
            ProductionThread lastThread = blockingQueue.peek();
            if (ObjectUtil.isNotNull(lastThread) && lastThread.status == 0) {
                //上次开始的5秒区间收集器
                this.setProductionData(message,lastThread);
            } else {
                //创建新的收集器
                ProductionThread productionThread = new ProductionThread();
                blockingQueue.add(productionThread);
                this.setProductionData(message,productionThread);
                this.startProductionThread(productionThread);
            }
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        }
    }

    private void setProductionData(Message message, ProductionThread thread) {
        ConcurrentHashMap<String, message> productionPlan = thread.getProductionPlan();
        productionPlan.put(message.getId(),message);
    }

    private void startProductionThread(ProductionThread thread) {
        threadPool.schedule(thread, 5, TimeUnit.SECONDS);
    }

    public class ProductionThread extends Thread {

        private final ConcurrentHashMap<String, message> productionPlan = new ConcurrentHashMap<>();

        public volatile int status = 0;

        @SneakyThrows
        @Override
        public void run() {
            status = 1;
            blockingQueue.remove(this);
            ArrayList<Message> messages = CollectionUtil.newArrayList(productionPlan.values());
            int i = xxxService.consumer(messages);
            logger.info("ADD DATA ======>>>>>> CLEAN productionPLan");
            logger.info("ADD DATA ======>>>>>> " + messages.size()+"=>"+i);
            
            //如果消费失败的补偿机制
            xxxService.error();
        }

        public ConcurrentHashMap<String, message> getProductionPlan() {
            return productionPlan;
        }
    }

}
```

思路、模式等一切都在代码里；
