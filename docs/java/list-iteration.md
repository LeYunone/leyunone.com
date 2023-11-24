---
date: 2023-11-13
title: JDK-针对集合迭代的探讨
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,Java,集合,迭代
  - - meta
    - name: description
      content: 集合中的 **Fail-Fast 与 Fail-Safe** 机制，本篇先简单的总结一下这两个机制的原理，而后结合场景推荐几种遍历集合的安全逻辑。
---
## 背景

见以下代码：

```java
public static List<Integer> data = new ArrayList<>();

static{
    data.add(1);
    data.add(2);
    data.add(3);
    data.add(4);
}

public static void main(String[] args) {
    errorIteration();
}

/**
 * 错误的遍历
 */
public static void errorIteration(){
    for (Integer datum : data) {
        data.remove(2);
    }
}
```

`Exception in thread "main" java.util.ConcurrentModificationException`

相信看到上述代码的人脑海中蹦出来的一定是 `ConcurrentModificationException` 的异常错误，作为一个集合操作中最基础的异常，它是JDK设计之初对基础集合类线程访问安全的一个写死的规则，即：**禁止两个线程对同一个集合进行遍历和[增加、删除、修改]的操作**

这也是经常可以听到的，集合中的 **Fail-Fast 与 Fail-Safe** 机制，本篇先简单的总结一下这两个机制的原理，而后结合场景推荐几种遍历集合的安全逻辑。

## Fail-Fast

简译：快速失败

覆盖于 `java.util`包下的所有集合类

在集合进行增加、删除、修改操作时，会进行 `modCount` 变量的校验；在集合进行遍历时，会生成本次集合操作的 `expectedModCount` 变量，那么在线程对改集合进行数据操作时，则会修改其中的 `expectedModCount`变量，当 `modCount != expectedModCount` 触发 Fail-Fast

在源码中关于这方面逻辑的一小片段：

```java
        public void remove() {
            if (lastRet < 0)
                throw new IllegalStateException();
            checkForComodification();
            try {
                ArrayList.this.remove(lastRet);
                cursor = lastRet;
                lastRet = -1;
                expectedModCount = modCount;
            } catch (IndexOutOfBoundsException ex) {
                throw new ConcurrentModificationException();
            }
        }

        final void checkForComodification() {
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
        }
```

## Fail-Safe

简译：安全失败

Fail-Safe于Fail-Fast相反，取消了对 `modCount` 变量的校验，采用CopyToWrite的方式，将需要操作的集合拷贝出一份然后再操作，这样原集合和遍历的集合不会是同一份。

隔离出了一个在操作上安全的区域，但是在数据上却是错误的数据。因为遍历的集合，和操作的集合不是同一份，遍历期间的数据和操作后的数据是分割开的，因此这也只是多线程操作集合的一种相对安全的机制。

`java.util.concurrent`包下的容器都是安全失败

## 几种安全的手法

原始数据：

```java
    public static List<Integer> data = new ArrayList<>();

    static{
        data.add(1);
        data.add(2);
        data.add(3);
        data.add(4);
    }
```



### 1、

第一种是很多人最先接触的一种，即遍历时需要做删除操作：

```java
    public static void iteratorMethod(){
        Iterator<Integer> iterator = data.iterator();
        while(iterator.hasNext()){
            Integer next = iterator.next();
            if(next.equals(1)) iterator.remove();
        }
    }
```

常出现在只是遍历然后删除指定对象的业务中，但是不足很明显，无法做新增操作。

由于迭代器拿到的数据对象是当时的，因此新增后的数据不会影响到先得到的迭代器对象。

### 2、

第二种也是使用JDK提供的容器类：`CopyOnWriteArrayList` 

作为JUC包下的产物，他和其他原子类对数据的操作类型，将操作数据和读取数据分割开来。

```java
    public static void copyToWrite(){
        CopyOnWriteArrayList<Integer> cwa = new CopyOnWriteArrayList<>(data);
        for(int i =0 ;i<cwa.size();i++){
            Integer b = cwa.get(i);
            if(b == 2){
                cwa.remove(i);
            }
        }
    }
```

因此在遍历时做任何操作都会时安全的，但是对于原数据的数据安全来说，是毁灭性的使用，使用需要酌情考虑

### 3、

第三种是我比较喜欢的，采用动态坐标的方式遍历集合：

将遍历数组的判断动态化，在遍历判断中，只需要在新增或删除数据时，对坐标建立新的容器大小关系。

这样做的好处是，适配 `删除` `新增` 操作，且对原业务逻辑侵入较小

```java
    public static void trendsIndex(){
        Integer size = data.size();
        Integer index = 0;
        while(index != size){
            Integer num = data.get(index++);
            if(num == 4){
                size+=1;
                data.add(5);
            }
            System.out.println(num);
        }
    }
```

### 4、

第四种，熟悉DFS算法的伙伴都知道，`Queue` 可以非常灵活的运用在DFS中的一个原因是，他的Peek和Poll方法可以自由的让队列中的数据先进先出化。

那么在我们安全遍历的手法中，恰好可以使用他`poll` 和 `add` 方法的特殊性，做一个从头到尾，又随意时间添加的队列遍历

```java
    public static void queueIterator(){
        Queue<Integer> queue = new LinkedList<>(data);
        while(!queue.isEmpty()){
            Integer num = queue.poll();
            if(num == 4){
                queue.add(5);
            }
            System.out.println(num);
        }
    }
```

### 5、

最后一种，使用类锁的形式对集合操作的线程数进行管控

可能很多人会觉得，遍历集合这么一件小事为什么需要设计一把锁，甚至是偏向锁去控制数据安全。

但其实加锁于遍历集合可以并不冲突，在经典的 `for-each` 循环案例中，锁影响性能是无可厚非的。

但是在 JDK 的 `paralleStream` 并行流操作中，这点性能消耗恰好可以被多线程式遍历优化。

```java
    public static void parallelStreamIterator(){
        List<Integer> list = new ArrayList<>(data);
        Lock lock = new ReentrantLock();
        list.parallelStream().forEach(adata->{
            lock.lock();
            try {
                if(adata==4){
                    list.add(5);
                }
                System.out.println(adata);
            }finally {
                lock.unlock();
            }
        });
    }
```

以上代码仅作思路参考，因为会触发 `ConcurrentModificationException`异常

## 总结

在一次无意中使用迭代器遍历时，往原数组新增元素，但发现不影响本次迭代器迭代后有感。

虽然马上就反应过来使用了 `Queue` 的方式解决，但是犯了这种严重级BUG的错误，就该来好好记录 :(