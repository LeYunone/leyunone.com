---
date: 2024-11-21
title: JAVA的Unsafe
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: java、JDK
---
# JAVA的Unsafe

## 序

在使用JUC包工具的AtomicInteger中的CAS方法时，浅浅的点进源码：

```java
    public final boolean compareAndSet(int expectedValue, int newValue) {
        return U.compareAndSetInt(this, VALUE, expectedValue, newValue);
    }
    private static final jdk.internal.misc.Unsafe U = jdk.internal.misc.Unsafe.getUnsafe();
```

其CAS对比是直接使用的Unsafe提供的本地方法，而跟踪到Unsafe的源码中，发现其大大小小的影响着我们平时看不到的最底层应用中；

由此JDK的Unsafe到底是什么东西，不由得升出这一好奇念头

## 创建

Unsafe如其名，不安全的；在JAVA中作为可直接执行JDK默认装载的本地方法的入口，本地方法指的是JDK无法做到而其他编程语言可轻易做到的操作：JAVA无法直接进行内存操作，因为没有内存指针的编程级编码，而C则可。

所以Unsafe中的方法全部都被 `native` 关键字修饰，JDK仅通过该关键字判断方法是否为本地方法，再通过方法名找到其内装在的.c文件

因此Unsafe的创建非常严格：

```java
    private static final Unsafe theUnsafe = new Unsafe();   
    @CallerSensitive
    public static Unsafe getUnsafe() {
        Class<?> caller = Reflection.getCallerClass();
        if (!VM.isSystemDomainLoader(caller.getClassLoader()))
            throw new SecurityException("Unsafe");
        return theUnsafe;
    }
```

使用了单例模式，提供`getUnsafe` 方法，其内部进行了仅当运行方法类在`BootstrapClassLoader`下才正常返回的校验；

因此创建Unsafe的方式仅有两种：

1. 使用`java -Xbootclasspath: /path` 修改VMOption配置指定加载器位置

2. 通过反射机制，强行获取theUnsafe属性，即Unsafe对象

   ```java
         Field field = Unsafe.class.getDeclaredField("theUnsafe");
         field.setAccessible(true);
         return (Unsafe) field.get(null);
   ```

## 有什么用

Unsafe的功能都直接写在了方法注释和名字上，从模块上分为4部分：

1. 内存部分
2. 线程操作
3. 系统相关
4. 对象（Class）操作

### 内存部分

熟悉`JIN` 结构的可知，JVM在内存上分为由其直接管理的堆内内存，和不参与管理的堆外内存；前者JVM遵循我们熟知的JVM内存模式进行垃圾回收管理，相对的后者则是直接受操作系统管理。

这是因为JVM需要对当应用进行垃圾回收时，应用停滞造成的各类影响的兜底机制

#### 直接操作

Unsafe直接操作内存的方法有：

```java
public native long allocateMemory(long bytes);
public native long reallocateMemory(long address, long bytes);
public native void freeMemory(long address);
public native void setMemory(Object o, long offset, long bytes, byte value);
public native void copyMemory(Object srcBase, long srcOffset, Object destBase, long destOffset, long bytes);
//获取给定地址值
public native Object getObject(Object o, long offset);
//为给定地址设置值
public native void putObject(Object o, long offset, Object x);
//获取给定地址值
public native byte getByte(long address);
//为给定地址设置byte类型的值
public native void putByte(long address, byte x);
```

从名字上看作用很明显，也就是对对象内存的CRUD操作

在哪里会用到？如果有调试过Netty架构bug的兄弟，肯定被他的池化内存恶心过，那么也该反应过来：netty的池化内存不由JVM管理

那么这份内存肯定不是放在堆内内存中，必定是通过以上方法为池化对象划分一片堆外内存用来分配、初始化、回收等等操作...

在`DirectByteBuffer` 类的实现中也就是通过在初始化方法时，分配内存->保存内存地址->跟踪

```java
long base= 0;
long size = //size
//...
base = unsafe.allocateMemory(size);
unsafe.setMemory(base,size,0) //初始化 base起始地址 size内存大小 头地址的起始位置
   
```

使用Unsafe申请到的堆外内存，一定要在内部方法中当所属类触发GC堆内内存垃圾回收时调用`unsafe.freeMemory()`方法。否则就会出现非常隐蔽的bug：堆外内存泄漏问题

#### CAS

除了直接操作内存，Unsafe还有我们常知的CAS比较并交换操作：

```java
public final native boolean compareAndSwapObject(Object o, long offset,  Object expected, Object update);
public final native boolean compareAndSwapInt(Object o, long offset, int expected,int update);
public final native boolean compareAndSwapLong(Object o, long offset, long expected, long update);
```

从序言中可知目前JUC包下所有设计CAS部分的操作，都是直接使用以上方法比较；

在本地方法中，并不是做比较value1=value1的操作，而是简单粗暴的使用内存叠加偏移的方式判断当前叠加偏移后的内存位上是否被占用；

![image-20241121000015748](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-21/image-20241121000015748.png)

#### 内存偏移量

通过获取内存的偏移量实现CAS操作，如上类似：

```java
public native int arrayBaseOffset(Class<?> arrayClass);
public native int arrayIndexScale(Class<?> arrayClass);
```

在`AtomicIntegerArray`类中，通过维护数组在内存地址的起始位置和新加元素的偏移量保证数组内的原子性操作

#### 内存隔离

Unsafe存在埋点方法，即该方法埋点前后的内存会出现一道屏障，用于防止字节码的指令重排

```java
public native void loadFence();
public native void storeFence();
public native void fullFence();
```

这里引用美团好文：https://tech.meituan.com/2019/02/14/talk-about-java-magic-class-unsafe.html中的案例（因为实在找不到比这个更合适的例子）

![image-20241122002142267](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-22/image-20241122002142267.png)

`StampedLock` 乐观读写锁案例，在我们的方法中从主内存赋予到工作线程变量中时，会存在数据不一致问题；

如上图的：5

但是当发生代码的指令重排时，获取锁之后的数据与获取锁之前的数据版本会存在不一致问题；

因此StampedLock使用了`loadFence`方法，在第三步校验锁版本的时候做了内存屏障，使获取锁之后的数据不受主内存的值影响

### 线程操作

JAVA提供给我们的线程操作方法在`Thread`类中是全部体现，但是在一些设计中会使用到的`park`与`unpark` 挂起和恢复指定线程却没有明确的在`Thread`类中；

因为他的实际提供者是Unsafe:

```java
public native void unpark(Object thread);
public native void park(boolean isAbsolute, long time);
```

不过有趣的是在Threada类中的挂起方法`suspend` 已被废弃，原因在于Thread中的`suspend0`和`resume0`本地方法在线程操作中存在一些线程安全问题：线程拿到锁之后挂起导致死锁，并且该方法等于冻结线程，不会释放线程中的任何资源，线程多了一个僵死的特殊状态，增加了不必要的复杂性。

除了线程的直接操作外，Unsafe还提供了处理锁相关的操作：

```java
public native void monitorEnter(Object o);
public native void monitorExit(Object o);
public native boolean tryMonitorEnter(Object o);
```

也就是获取一把监视器的可重入锁，释放这把锁，以及尝试获取这把锁；

不过并不推荐使用上述方法，因为JDK提供的`synchronized`关键字已经在JVM层面实现上述操作；

况且JAVA中也有很多`lock` 类覆盖了上述的操作；

Unsafe提供的是最高级的字节码指令上的锁操作，在我们开发中对于锁敏感度为0，非常的危险；

### 系统相关

Unsafe提供返回系统内存大小的方法：

```java
//返回值为4（32位系统）或 8（64位系统）。
public native int addressSize();  
//内存页的大小
public native int pageSize();
```

内存页大小为二进制幂数，可作为申请内存时的参考

### 对象操作

对象操作分为查询和定义：

```java
public native long objectFieldOffset(Field f);
public native Object getObject(Object o, long offset);
public native Object getObjectVolatile(Object o, long offset);
public native void ensureClassInitialized(Class<?> c);
```

查询对象在内存的偏移量

```java
public native void putOrderedObject(Object o, long offset, Object x);
public native void putObject(Object o, long offset, Object x);
public native void putObjectVolatile(Object o, long offset, Object x);
```

设置对象在内存的偏移量

```java
public native Object allocateInstance(Class<?> cls) throws InstantiationException;
```

从字节码层面最暴力的创建出一个类，无视构造方法，比如:

```java
public class Test{
    private int i;
    private Test(){}
}

public static void t(){
    Test test = Unsafe.getUnsafe().allocateInstance(Test.class);
}
```

会被直接创建出来，这一点在Gson反序列化中的`ConstructorConstructor` 适配器中有体现：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-22/222.png)

1. 优先找到构造器初始化
2. 找不到使用Unsafe强行创建

```java
public native Class<?> defineAnonymousClass(Class<?> hostClass, byte[] data, Object[] cpPatches);
```

定义一个匿名类，这一点在 [Lambda表达式的特殊序列化](https://leyunone.com/java/lambda-serialize.html) 和 Lambda使用时JVM编译过程中中有典型的举例；Lambda会通过字节码层面的定义匿名类作为临时的模板对象用于支持点调用
