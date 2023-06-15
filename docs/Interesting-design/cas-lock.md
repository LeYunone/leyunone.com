---
date: 2022-04-16
title: 自定义一个CAS独占锁
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
      content: 首先作为一个简单的CAS控制并发，需要用到：一个控制锁状态的变量key，一个存储未抢到锁线程的阻塞队列。
---
# 自定义一把CAS形式的锁

首先作为一个简单的CAS控制并发，需要用到：一个控制锁状态的变量key，一个存储未抢到锁线程的阻塞队列。

那么可以

```
    //存放caskey的线程表头
    AtomicReference<Long> key = new AtomicReference<>();
    //阻塞队列， 有区域时加入，否则阻塞线程执行
    BlockingQueue<Thread> dThread = new LinkedBlockingQueue<>();
```

 **AtomicReference**作为原子类，可以保证一次操作原子性。
**BlockingQueue**阻塞队列，自定义规则存储什么情况下让线程进入并且阻塞，当然也可以使用任何队列，但为了锁的扩展及并发下的安全性，还是应该使用更为安全的阻塞形式。

![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210445.jpg)

那么作为一把锁，当然需要两个方法，一是**lock**，二是**unLock**。
**lock():**
```
    public void lock(){
        //控制自旋次数
        Integer count = 0;
        //当前线程
        Thread thread = Thread.currentThread();
        //设置自旋 如果发现key值被改变，则说明有锁在竞争，进入锁流程
        while(!key.compareAndSet(null,thread.getId())){
            dThread.offer(thread);
            System.out.println("自旋:"+thread.getId());
            if(count++>=10){
                System.out.println("阻塞:"+thread.getId());
                //挂起 阻塞这个线程
                LockSupport.park();
                //等待这个线程被唤醒，继续抢夺资源
                dThread.remove(thread);
            }
        }
    }
```
由于CAS最优的锁方式，是基于自旋的形式，所以在这里我也是最了最简单的循环十次，还是没有拿到资源，则将线程加入到阻塞队列中，并且将这个线程挂起[LockSupport.park（）]
这里一定要使用LockSupport的park方法的原因：
1. 需要由我们自己控制指定线程的挂起与唤醒状态
2. wait方法，即使使用notify也只是随机唤醒，这样作为一把锁控制并发，极为的不公平。
3. LockSupport的park方法具有很强的扩展性，其API更加丰富

所以当被挂起时，停止循环，停止代码，直到被唤醒unPark，从阻塞队列中移除，重新循环争夺锁资源。

**unLock()**
```
    public void unLock(){
        //如果还是当前锁的话，就解放锁
        if(key.compareAndSet(Thread.currentThread().getId(),null)){
            for(Thread thread:dThread){
                //放开所有线程，去争夺资源
                LockSupport.unpark(thread);
            }
        }
    }
```

解锁的方法比较简单，释放锁，并且将在等待锁的所有线程全部唤醒。

这样一把CAS锁就完成了，可以自定义的去测试并发。使用POSTMAN工具，或者代码的形式。
## 总结
CAS锁的优点：在线程不激烈的情况下，不会对线程性能造成影响。
比如lock方法中，如果线程竞争不激烈，且锁住的方法运行时间不快。则不会进行到循环10次，进入阻塞状态挂起，
这样频繁上下文切换的模式。
但是，当并发量很高，或者锁内方法运行时间较长，两者比例搭配不好的场景下，CAS会将所有的锁强制进入到挂起，阻塞的状态。
所以应对这样的场景，我们还可以优化。
```
    public void lock(){
     =====================
       在这里进行一个判断
       当阻塞队列达到某个峰值
       或定义一个线程共享变量，当这个变量达到某个峰值。
       则直接到入口将其挂起
     ===============
        //控制自旋次数
        Integer count = 0;
        //当前线程
        Thread thread = Thread.currentThread();
        //设置自旋 如果发现key值被改变，则说明有锁在竞争，进入锁流程
        while(!key.compareAndSet(null,thread.getId())){
```
这样操作，其实就是在高并发繁忙时，由CAS比较锁的方式，直接升级为了一个排他锁的模式。
这也是锁升级的一个体现。

所以CAS锁的使用，是需要看业务场景，并且不断优化。
