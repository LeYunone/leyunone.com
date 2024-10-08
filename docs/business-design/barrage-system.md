---
date: 2024-08-01
title: 直播间弹幕系统
category: 
  - 业务设计
tag:
  - 业务设计
---
# 直播间弹幕系统

​	刷B站的时候，感叹某个视频的弹幕数量之大的同时；一时好奇这种视频弹幕的实现方案，仔细思索也就是 `时间埋点` + `落库查询` 的方式；

​	对于只是播放的视频来说，发送弹幕不会有时效性，持续的并发压力等等问题。虽然直到实际实现起来问题多多，但感觉还是在能考虑的范畴中；

推移到直播间中的弹幕，这里的设计方案门路就多的一时想象不出![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ%E5%9B%BE%E7%89%8720220302210445.jpg)

本篇展开对直播间的弹幕系统设计方案的思考

## 弹幕的性质与侧重

本质上看，直播弹幕系统与IM即时通讯相差不大；

前者在公开的环境下，使用开发者指定的消息模板如普通字符串，表情等进行实时的群聊互动；

后者则是在一个范围内，不受限制的散发群聊信息；

因此弹幕系统相当于一般的IM通讯来说，侧重点在性质上来说有很大不同，主要如下：

- 消息及时性强，即发即显
- 单系统对不同直播间具备性能扩展能力，大主播与小主播的房间性能扩容与缩减
- 用户随进随出，不考虑历史弹幕
- 弹幕内容需要通过过滤审核
- 大量的互动功能，比如口令红包，抽奖，拉黑，特殊文字等
- ....

并且在直播互联网这种高速发展的环境下，系统的最主要的目的是三个：

1. 支持万级用户同时在线发弹幕
2. 快速上线，先行一步抢占市场
3. 创意创新，用户体验

由此心急吃不上豆腐，但是也得喝上热汤，所以需要经过普通版，进阶版，高级版的层层迭代；

## 弹幕读写

### 第一阶段-拉模式

获取数据的方式无非两个动作，我向你请求或者你主动给我；

而拉模式则是相当容易实现，后期容易扩展的模式；

用户发送弹幕，调用接口进行数据落库，前端机则通过轮询的方式访问数据，模型大体为：

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-08-02/1.png" style="zoom:67%;" />

技术选型为redis存储弹幕，kafka异步流式落库；

使用redis的sortedset类型存储时序发来的弹幕，弹幕包括礼物信息，普通弹幕，因此结构为：

```json
{
    "timestamp":19999,
    "msg":"{}",
    "type":1,
    "userId":"1"
    ...
}
```

通过redis的`Zadd` 命令进行每一条弹幕的落库，`ZrangeByScore ` 操作完成用户轮询范围查询；

然后前端机开启轮询操作如下：

1. 前端机开启每X秒一次的请求拉取当前时间-X秒的弹幕
2. 处理机查询redis，通过`ZrangeByScore`定位弹幕
3. 返回，渲染

用户发送弹幕操作如下：

1. 用户发送弹幕
2. 前端机本地进行第一层过滤
3. 根据房间Id，用户Id，Hash路由到处理机
4. 落库

#### 问题

拉模式的简单流程如上，再加上具体业务的渲染，其实需要考虑的东西特别多；

比方说消息的审核，接收层的削峰，弹幕的持久化等等；

因此以下发散一下以轮询拉模式运行的弹幕系统将出现的问题；

##### 消息堆积

因为消息是一条一条通过Kafka推入到redis中的，当直播间热度过大时一定会出现大量弹幕堆积再kafka中等待消费；

这样一来被堆积的弹幕基本失去了时效性，严重影响用户体验；（比如说奥运里中国已经拿到金牌了，你却还在接收比赛中加油的弹幕）

关于堆积问题的处理，前后端都有相应的处理手段：

对于不同的直播间的系统资源倾斜率不一样，大至分为4个档位

**后端：** 增加消费者，通过

第一档：一个消费主题，加锁入redis

第二档：多个消费主题，加锁入redis

第三档：一个消费主题，不加锁入redis

第四档：多个消费主题，不加锁入redis

**前端：** 丢弃消息

第一档：发送后主动请求

第二档：发送后等待轮询更新

第三档：发送后立马在直播间显示自己弹幕，等待轮询再次显示自己弹幕

第四档：发送后只在本地客户端显示自己弹幕，丢弃掉 **直播间等级低的** 弹幕

并且几个档位是可以根据消息堆积带来的延迟动态的切换，通过探针打入记录同一个消息id从发送服务到处理机接收之间的时间，就是这条弹幕的延迟时间。

除了针对直播房间进行分档，我们还可以更细的对该直播间的消息类型划分上述档位；

比如礼物，当然不能丢失；点赞，互动可以延后；普通弹幕可以丢失等等...

##### 大Key

将弹幕存入到redis中，在运行时读写基于redis的性能强大不会存在问题，只是大key问题是使用redis存储大量数据不可逃避的问题；

因此从源头上必须通过时间分片，可以每小时判断直播间的热度，划分时间粒度按秒/按分/按小时；

这样一来，前端机的消息除了上报基本的数据结构外，还需要额外维护一份本地的访问时间分片的偏移量；用来告知获取服务当前的消息分片落在哪个key上；

虽然有效的可以减少大Key的产生，但是无限大的数据背景下总会出现；

所以少不了监听冷保存，Nosql....的组合拳

> 1、减少大Key出现的可能
>
> 2、监听缓存，当key出现大key阈值的时候，打上标记等分片偏移量过去将其delete数据冷保存
>
> 3、切换redis，采用nosql

##### 并发读写

由于前端机的轮询拉和处理机的持续写是并行发起的；

因此很容易出现：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-08-02/2.png)

用户A轮询拉取1234消息时，用户C和用户B同时在消息4的时间戳上写入了5和6；

这样一来用户A下次根据时间戳拉取最新消息的时候就会越过上一次时间戳的5和6，丢失消息；

为彻底解决并发读写的这种常见问题，前后端都可以有自己的处理方式；

**后端：**

同一类型的消息一定由相同消费组的服务消费，同时加锁，针对每一类型的消息添加全局锁，确保串行化的写入redis。这样一来即使时间戳相同，入库以及访问时的时间都会存在延时；

**前端：**

针对所有消息打上tag，记录其顺序编号；

当发现获取1234后，下次获取时越过5和6，从7开始；

回滚时间戳，过滤已经接收到的4；

> 保证数据不丢失是以性能换业务的设计
>
> 在如今的弹幕环境下，并不需要做到百分百的业务性；
>
> 所以结合消息堆积中的四个档位，处理并发读写时是可以允许不同程度上的丢失；
>
> 甚至依靠市场传统，咱们可以针对性的保证上榜大哥的消息不丢失

##### Http资源

基于请求的拉模式一定是依靠无状态下的http请求；

大量http请求，一是考验代理服务器的性能，二是大量带宽消耗问题；

因此使用拉模式-短连接的模式构建的系统，逃不开没有复用连接，频繁进行短连接造成的系统性问题；

### 第二阶段-拉模式+本地缓存+长轮询

这个阶段主要解决两个问题：

1. 缓存的压力和瓶颈
2. 无状态短链接消耗资源

回到弹幕读写问题上，当热门直播间出现大量弹幕时；

由于我们使用的时 `ZrangeByScore` 相当于数据库查询中的时间范围查询的语句操作；

随着数据增多，redis的ZrangeByScore操作消耗时间和资源也就越长；

因此对于热门直播间，一定要考虑空间换时间的方案；

在获取服务上添加 `LocalCache` 本地缓存，并且开启每秒一次的定时拉取缓存当前时间窗口下的所有数据；

前端机请求打过来时，直接与本地内存进行交互；

> 但是这种操作只适用在热门直播间中，因为LocaCache数据增大同样也会出现GC越来越频繁的问题；
>
> 所以这是一个针对大主播的空间换时间的方案

**短连接轮询优化**

**长轮询：** 客户端向服务器发起Ajax请求，服务器接到后将请求`hold`

当消息上游有消息进入到当前时间窗口时，提醒获取服务处理这次请求；

优点：在没有弹幕新增更新，或系统高峰期时可通过控制hold时长，进行从请求源头上的资源倾斜

缺点：服务器hold连接会消耗资源

### 第三阶段-推模式长连接

随着用户量和业务的增长，无法避免http断开，超时，量大等因素影响弹幕时效性的问题；

并且拉模式本身由前端机触发，并不具有强时效的特质，长连接变成了群聊系统中后期一定需要用到的模式；

长连接-推模式的架构图如下：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-08-02/4.png)

连接层与前端机只记录与保持连接关系，避免处理服务更新时造成的连接丢失重启；

推送层存储用户与直播间的订阅关系，负责具体推送。整个连接层与推送层与直播间业务无关，不需要感知到业务的变化；

长连接模块实现WebSocker共享，以验证用户进入直播间的工作；

使用推模式的侧重点在前端机与服务器的连接上，其余的则是传统的业务挑战：

1. mq，push动作失败重试
2. 长连接带来的宽带压力
3. 灰度部署
4. ...

在推模式的基础上我们还可以分为两种，一种是提醒告知，第二种是广播通知；

对于小主播来说，推模式是这样：

1. 进入直播间，拉取当前时间片缓存弹幕
2. 出现新弹幕，连接层告知前端机
3. 前端机拉取最新弹幕

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-08-02/5.png)

对于大主播来说，推模式是这样：

1. 进入直播间，拉取当前时间片缓存弹幕
2. 出现新弹幕，连接层拿到所有前端机连接
3. 广播发送此条弹幕

![6](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-08-02/6.png)

## 回放录像

回放功能=弹幕持久化

找到如何将缓存中的弹幕落库到持久化的库中，就是实现这个功能的唯一要点；

比如使用redis的rdb文件，做数据同步服务

或者监听分片key过期，在直播的过程中批量的将弹幕写入数据库等等

## 口令红包

互动方式之一，发送指定弹幕参与抽奖；

抽奖池有两种实现方向：

1. 前端抽奖
2. 后端抽奖

前端抽奖的实现很简单，且不会对服务器造成任何的负担；

流程如下：

1. 开始抽奖，向后台请求一个随机数为抽奖数
2. 用户发送弹幕，计算当前用户的权重，计算出用户此时的随机数=从后台请求的随机数
3. 如果相等，通知后台本次抽奖结束

等同于发送弹幕的那一刻在前端机上就已经确定了是否中奖，当然了是否抽中，以及并发时同时抽中这些常规的并发锁场景问题也是需要考虑的；

第二则是后端抽奖，就是非常常规的收集用户，放到池中，随机数拿下标，中间。

# 总结

只是从客观，表象上拆解弹幕系统，很多地方肯定不对，但是弹幕读写的三阶段我认为是业界逃不过的；

在代码开发层面认为比较复杂的跳转应该是百分百灰度发布的开发模式；

因为从没有听过哪个直播网站出现过运维停机的情况，所以这种系统是开机不停机的类似。业务层的服务都是灰度发布的模式，所以开发中db操作和设计都要深思熟虑
