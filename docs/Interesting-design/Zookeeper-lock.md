---
date: 2022-05-04
title: Zookeeper实现分布式锁
category: 
  - 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: Zookeeper,分布式锁
  - - meta
    - name: description
      content: 在分布式场景中，虽然可以用Redis实现分布式锁的概念，但是Redis在实现的过程中需要考虑到客户端锁释放以...
---
# Zookeeper实现分布式锁
 在分布式场景中，虽然可以用Redis实现分布式锁的概念，但是Redis在实现的过程中需要考虑到客户端锁释放以及客户端挂掉的种种情况发生。但是Zookeeper由于是基于临时节点实现的锁，所以当客户端挂掉的时候，会自动释放锁。所以我们只需要关注用锁，释放锁的流程就行。![emo](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210538.jpg)

## 实现方案
目前有两种，一是使用JDK的API底层实现、二是使用市场上已经成熟的Zookeeper分布式锁框架 **CURATOR**。

### JDK
先直接贴上代码
```
package xyz.leyuna.laboratory.core.concurrent;

import org.apache.dubbo.common.utils.CollectionUtils;
import org.apache.zookeeper.*;
import org.apache.zookeeper.data.Stat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;

/**
 * @author LeYuna
 * @email 365627310@qq.com
 * @date 2022-05-04
 */
public class ZookeeperLock {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    private String con = "";

    private ZooKeeper zooKeeper ;

    private CountDownLatch conSuccess = new CountDownLatch(1);

    private CountDownLatch lockWathch = new CountDownLatch(1);

    private String currenNode;

    private String preNode;

    public ZookeeperLock() throws IOException, KeeperException, InterruptedException {
        ZooKeeper zooKeeper = new ZooKeeper(con, 2000, new Watcher() {
            /**
             * 监控节点的方法
             * @param watchedEvent
             */
            @Override
            public void process(WatchedEvent watchedEvent) {
                if(watchedEvent.getState() == Event.KeeperState.SyncConnected){
                    //如果Zookeeper 监听器监听连接成功
                    conSuccess.countDown();
                }

                //如果监听到的是删除节点操作  并且这个节点与当前线程的等待锁监听的前一节点路径相同
                if(watchedEvent.getType() == Event.EventType.NodeDeleted && watchedEvent.getPath().equals(preNode)){
                    lockWathch.countDown();
                }
            }
        });

        this.zooKeeper = zooKeeper;
        conSuccess.await();

        Stat exists = zooKeeper.exists("/locks", false);
        if(exists == null){
            zooKeeper.create("/locks","locks".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE,CreateMode.PERSISTENT);
        }
    }

    /**
     * 加锁方法
     */
    public void lock() throws KeeperException, InterruptedException {
        if(zooKeeper == null){
            logger.error("连接异常");
        }
        //ZooDefs.Ids.OPEN_ACL_UNSAFE 完全开放这个节点下的读写     CreateMode.EPHEMERAL_SEQUENTIAL自增长的业务id
        currenNode = zooKeeper.create("/locks/" + "lock-", null, ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);

        List<String> children = zooKeeper.getChildren("/locks", false);
        //按自增长顺序排序
        Collections.sort(children);

        //业务id
        String ephemeral = currenNode.substring("/locks/".length());
        if(CollectionUtils.isNotEmpty(children)){
            int i = children.indexOf(ephemeral);
            if(i==-1){
                logger.error("节点异常");
            }else if (i != 0){
                //监控前一个节点 watch = true
                byte[] data = zooKeeper.getData("/locks/" + children.get(i - 1), true, null);
                preNode = "/locks/"+children.get(i-1);
                //阻塞当前线程 直到前一个节点被释放【删除】
                lockWathch.await();
                return;
            }else{
                //获得锁
                return;
            }
        }
    }

    public void unLock() throws KeeperException, InterruptedException {
        zooKeeper.delete(currenNode,1);
    }
}
```
JDK实现Zookeeper锁的核心是，Zookeeper的监听机制Watcher。
在并发场景下，我们控制锁，是使用Zookeeper的一个特点：
1. 节点形式的数据
2. 可创建临时文件，以及自增长文件
3. 业务ID

所以加锁的过程，如下：
1.  构建当前Zookeeper临时锁节点的最新自增长节点
2.  判断当前结点是否是 Zookeeper临时锁节点中，最小的业务节点
3. 如果是，则说明前面没有节点 = 没有线程占用锁，加锁成功
4. 如果不是，则阻塞当前线程，并且监听当前自增节点的前一节点

那么我们需要一个控制器，用于阻塞以及释放线程，我们可以使用Lock可重入锁，也可以使用JUC下的各类信号量等等，我这里使用的是
```
private CountDownLatch lockWathch = new CountDownLatch(1);
```
所以在Zookeeper的监听方法中，
```
         //如果监听到的是删除节点操作  并且这个节点与当前线程的等待锁监听的前一节点路径相同
         if(watchedEvent.getType() == Event.EventType.NodeDeleted && watchedEvent.getPath().equals(preNode)){
             lockWathch.countDown();
         }
```
当前一节点被释放时，则释放当前线程。
因为如果前一节点被释放，则说明前一节点一定是获取锁的线程，并且是Zookeeper临时锁节点中最小的节点。

那么释放锁的过程就非常简单了，只需要触发Zookeeper删除当前路径 = 节点的事件，就达到了释放锁，并且通知其他线程拿锁的动作了，这一切都是在监听器中完成。
#### 总结
通过JDK手写的一个Zookeeper分布式锁，可以发现不同于Redis，我们需要平衡锁过期、客户端、服务端挂掉等问题。
由于Zookeeper集群、客户端与服务端的特性，我们只需要由运维维护主从集群的平稳运行即可。
但是由于Zookeeper是基于最小自增长节点的这一性质完成的分布式锁，所以它一定是一种排队的形式，等待前一节点释放锁，依次获得锁的。
**所以Zookeeper一定是一个公平锁**

## Curator
由原生API打造的分布式锁，由于个人技术问题，有很多缺陷：
1. 重复new出监听器
2. 不支持多节点的创建以及删除
3. 会话连接需要自己处理
4. 不支持复杂业务

所以我们需要一个成熟体系的框架，已经帮我们封装好了异步、连接、迭代循环、多层锁等等功能。
```

        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-framework</artifactId>
            <version>2.11.0</version>
        </dependency>
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-recipes</artifactId>
            <version>2.11.0</version>
        </dependency>
```
具体使用比较简单，和一般Lock锁一模一样，其实现原理还需后续阅读源码阶段一一品尝。![emo](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210445.jpg)
