

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

### Fail-Fast

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

### Fail-Safe

简译：安全失败

Fail-Safe于Fail-Fast相反，取消了对 `modCount` 变量的校验，采用CopyToWrite的方式，将需要操作的集合拷贝出一份然后再操作，这样原集合和遍历的集合不会是同一份。

隔离出了一个在操作上安全的区域，但是在数据上却是错误的数据。因为遍历的集合，和操作的集合不是同一份，遍历期间的数据和操作后的数据是分割开的，因此这也只是多线程操作集合的一种相对安全的机制。

`java.util.concurrent`包下的容器都是安全失败

## 手法上的安全

1、

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

2、

第二种也是使用JDK提供的容器类：`CopyOnWriteArrayList` 