---
date: 2025-03-05
title: Actor模型-Akka
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: Actor,Akka
---
# Actor模型-Akka

Actor模型是一种处理并发计算的概念模型，在最近接触了需要考虑并发执行的业务时，方案设计中也就考虑到了Actor模型以及Java中的第三方实现库AKK

## 为什么需要Actor模型？

传统多线程编程面临**共享内存**和**锁机制**的复杂性，易导致死锁、竞态条件等问题。Actor模型通过**消息传递**和**状态隔离**实现了更高层级的并发抽象。

### 概念图：Actor模型 vs 传统线程模型

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-03-27/1.png)

## Actor模型核心原则

1. **消息驱动**：通过不可变消息进行通信
2. **状态封装**：每个Actor维护私有状态
3. **位置透明**：本地/远程Actor无差异
4. **监管机制**：层级化的错误处理

## Akka框架架构

### 核心组件

| 组件        | 说明              |
| :---------- | :---------------- |
| ActorSystem | 容器管理Actor层级 |
| ActorRef    | Actor的不可变引用 |
| Mailbox     | 消息队列          |
| Dispatcher  | 线程池管理        |

### 消息处理流程

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-03-27/2.png)

### 示例

#### 基础Actor实现

```java
import akka.actor.AbstractActor;
import akka.actor.ActorRef;
import akka.actor.ActorSystem;
import akka.actor.Props;

// 定义消息类型
class GreetMessage implements Serializable {
    public final String who;
    public GreetMessage(String who) {
        this.who = who;
    }
}

// 实现Actor
class Greeter extends AbstractActor {
    @Override
    public Receive createReceive() {
        return receiveBuilder()
            .match(GreetMessage.class, msg -> {
                System.out.println("Hello " + msg.who);
            })
            .build();
    }
}

// 创建Actor系统
public class AkkaDemo {
    public static void main(String[] args) {
        ActorSystem system = ActorSystem.create("demo-system");
        ActorRef greeter = system.actorOf(Props.create(Greeter.class), "greeter");
        
        greeter.tell(new GreetMessage("Akka"), ActorRef.noSender());
        
        system.terminate();
    }
}
显示更多
```

#### 带状态的Actor

```java
class CounterActor extends AbstractActor {
    private int count = 0;
    
    @Override
    public Receive createReceive() {
        return receiveBuilder()
            .match(Increment.class, msg -> count++)
            .match(GetCount.class, msg -> 
                getSender().tell(count, getSelf()))
            .build();
    }
    
    // 定义消息类型
    static class Increment implements Serializable {}
    static class GetCount implements Serializable {}
}
```

## Akka高级特性

### 监管策略

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-03-27/3.png)

监管策略类型：

1. Resume：继续处理后续消息
2. Restart：重启子Actor
3. Stop：永久停止
4. Escalate：向上级传递错误

### 路由机制

```java
public void t(){
    ActorRef router = system.actorOf(
        new RoundRobinPool(5).props(Props.create(Worker.class)),
        "router"
    );
}
```

## Akka集群架构

### 集群节点通信

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-03-27/4.png)

关键组件：

- Cluster Sharding
- Distributed Data
- Cluster Singleton

## 性能对比

| 指标       | 传统线程模型          | Akka                 |
| :--------- | :-------------------- | :------------------- |
| 线程利用率 | 低（上下文切换开销）  | 高（事件驱动）       |
| 内存消耗   | 高（每个线程MB级）    | 低（每个Actor KB级） |
| 错误处理   | 复杂（try-catch嵌套） | 简单（监管树）       |
| 扩展性     | 有限（单机）          | 强（无缝分布式）     |

## 适用场景

- 高并发消息处理系统
- 分布式计算任务
- 实时流数据处理
- 游戏服务器架构
- IoT设备协同

## 最佳实践

1. 消息设计原则：
   - 不可变性
   - 语义明确
   - 适度粒度
2. 避免：
   - 阻塞操作
   - 大消息体
   - 暴露内部状态

## 总结

Actor模型通过**消息传递范式**解决了传统并发编程的痛点，Akka框架提供了：

- 高性能并发处理（单机百万级Actor）
- 弹性分布式架构
- 完善的容错机制
- 响应式系统支持

随着分布式系统复杂度增加，Akka已成为构建高可用系统的首选框架之一。其学习曲线较陡峭，但通过合理运用设计模式，可以显著提升系统可靠性和扩展性。

------

**注**：实际部署时应配合Akka官方文档（https://github.com/akka/akka）进行配置优化。完整示例代码需要添加Maven依赖：

```xml
<dependency>
    <groupId>com.typesafe.akka</groupId>
    <artifactId>akka-actor_2.13</artifactId>
    <version>2.6.20</version>
</dependency>
```