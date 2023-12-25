---
date: 2023-12-12
title: JDK9~21特性及应用场景
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: java、JDK、JDK版本
---
# JDK9~21特性及应用场景

自JDK8在2014年3月18日发布起，国内范围内针对JDK8的运用在18、19年几乎达到了全面普及；除开一些老旧的银行、JSP、校园...类型的项目外，新开的项目选择的JDK环境往往也是JDK8。

因此市面上众多开源工具、项目等等都是默认以支持JDK8，甚至最低JDK8为标准。

JDK8真的好吗？毋庸置疑的说，他真的很完美，这一点从各个企业都选择此版本可以有力证明。

但是，从今年开始，或者说2022年开始，很多的项目、插件逐渐开始不再兼容JDK8的应用，比如`Jenkins`插件市场，如果你是JDK8版本的`Jenkins` ，可以看到这么一句话:

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-12/771e5692-fa2e-41f9-920a-3e5fad6897d2.png)

`您正在Java 1.8上运行Jenkins，对它的支持将于2022年6月21日或之后结束。`

再比如 `JRebel `发布了最新的**《2022 年 Java 生态系统状况报告》**:

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-12/02762a81-4a92-4270-a035-451e0a056327.png)

那么，对比我们常使用的JDK8，他的升级版9、10、11、12、....明明多了很多功能，为何不去尝试尝试JDK带来的新特性呢，接下来本篇将每个版本的最典型特性及他的应用一一展开。

## JDK9-模块化

模块化在MAVEN项目中是一个基本定义，将项目A看成一个模块引入项目B中，通过`<dependency><dependency/>` 引入的方式实现Java的模块化。

因此在JDK9之前，纯JDK项目并不支持模块化的导入；在JDK9中，引入了和前端开发相似的语法 `exports xxx`

首先看JDK9以前的包-类结构：

```java
package 包名;

public class 类名{
    
}
or
public interface 接口{
    
}
```

JDK9后的模块-包-类结构：

```java
module 模块{
	requires 依赖
}

package 包名;

public class 类名{
    
}
or
public interface 接口{
    
}
```

以一个很简单的代码案例：

我有两个模块 `laboratory-jdk9` \ `laboratory-jdk9-sample`，目录结构如下图：

![https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-13/4a53f9d5-b9c4-4aed-8e28-6bdad5094bbb.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-13/4a53f9d5-b9c4-4aed-8e28-6bdad5094bbb.png)

![https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-13/25f8e15d-2c2b-4857-bbf4-c7ca02bebae7.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-13/25f8e15d-2c2b-4857-bbf4-c7ca02bebae7.png)

在两个项目的根目录下生成 `module-info`

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-13/0fd95d4c-6624-4250-951a-0007d649ff24.png)

TIp：需要注意idea在 `Open Module Settings` 设置中需要将版本语法调整到9版本

![image-20231213000327741](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-26/82db0534-9c87-4543-a567-783e588c192e.png)

两个项目的 module-info 语法，主要是两类：

-  exports 导出
-  requires 导入

因此在`laboratory-jdk9-sample` 中的文件配置为：

```java
module laboratory.jdk9sample {
     exports com.leyunone.laboratory.jdk9sample.test;
}
```

在 `laboratory-jdk9` 中的文件配置为：

```java
module com.leyunone.laboratory.jdk9.test {
     requires laboratory.jdk9sample;
}
```

这样就可以在不通过MAVEN导入依赖的方式进行项目的模块化划分

![image-20231213000616893](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-26/c057c42f-c65b-41e9-8c84-5112d6a643e7.png)

**此外**

除了模块化这一理念上的改变外，修复很多bug ，比如著名的 [CUP100BUG](https://bugs.openjdk.org/browse/JDK-8065320)。

还针对JDK8中stream流方法的使用进行了优化

```java
        // 创建一个包含null的流
        Stream<String> stream = Stream.ofNullable(null);

        // 打印流中的元素
        stream.forEach(System.out::println);

```

可以创建元素为空的stream流，并且输出时为空

```java
/**
 * This class represents a person.
 * 
 * {@implNote This implementation is not thread-safe.}
 * {@index}
 */
public class Person {
  // code for Person class
}
```

提供了 `@implNote` 和 `@index` 方便文档内容更好的标注与定位

## JDK10-推导型数据类型

在JDK10前，用于局部变量的类型，一定是先有类型，再有局部变量的。

比如 `String a ="hello"`

一定是以你为 a 为 `String` 类型 ，才有的hello。

所以定义局部变量时，类型的设置一定是具体到类 基本数据类型的。

但是再JDK10，引入了和JS编程中相同语法的 `var` 数据类型

但是他并非js中的弱类型的意思，再JDK中他意为推导类型；即由变量推导形成的数据类型。

比方说在上述的 `var a = "hello"` 中，有了以下解释：

**因为 "hello" 是字符串，所以a是字符串类型**

因此，`var a` 定义的变量，一定是一个具体的类型，所以他不能为 `null`

![https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/2023-05-21/bdcd88d4-3354-4d3f-8c6b-4985cdec0dee.gif](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/2023-05-21/bdcd88d4-3354-4d3f-8c6b-4985cdec0dee.gif)

我们JAVA也有自己的弱类型了；

这个更新的使用，根据个人，不过因为大多公司是协同开发，加上JDK强语言性的特点；也就导致了JDK10在目前版本中使用人数最少

**垃圾收集器变更**

JDK10之前大多版本，采用的是ps + po模式的垃圾收集器，即：Parallel Scavenge（新生代）+ Parallel Old（老年代）

在JDK10版本中将G1垃圾收集器设置为默认的收集器，因为G1收集器在长远角度上来看，足以应对绝大多数大内存的项目。

不过由于G1对于内存的收集性能低下的原因，在使用JDK10版本时也是需要结合项目大小去设置垃圾收集器

**线程栈局部变量的优化**

针对 `ThreadLocal` ，删除了ThreadLocal静态map变量。采用线性探测哈希表进行其内部数据存储

```java
ThreadLocal<Integer> count = ThreadLocal.withInitial(() -> 0);
int value = count.get();
count.set(value + 1);
```

## JDK11-简化编译

JDK11的更新日志中，包含：

- 字符串方法增强
- Optional方法增强
- var类型增强
- Http客户端优化
- ZGC垃圾回收
- 简化编译

**字符串方法增强：**

```java
//isBank()  判断是否为空串
//strip()   去除首位全角和半角空白字符 
//repeat(n)  重复字符串的次数，拼接相同字符串n次
//lines()    统计字符串行数 根据\n
```

**Optional方法增强:**

```java
//Optional.isPresent() 判断valu存在  存在为true
//Optional.isEmpty()   判断是否为空 空为true
```

**var类型增强**

```java
public void test(){
    Consumer c = (a)->{
        //sout
    }
    
    Consumer c = (@NotNUll var a)->{
		//sout
    }
}
```

原先的局部匿名变量由于没有标明数据类型，所以无法被注解修饰，在JDK11中可以使用var类型配合注解使用

**ZGC垃圾回收**

压缩性垃圾回收器

标记-整理模式的收集器，不设置年龄分代。

主要特点是通过压缩内存技术，通过内存多重映射、染色指令方式快速的标注大TB内存的垃圾。

还处于实验阶段

**简化编译**

在JDK11之前的JAVA程序运行步骤：

1. 编写.java文件
2. 编译.java文件编程.class文件
3. java -c .class文件 运行

在JDK11中，可以直接运行.java文件，会由虚拟机自行编译运行。

注意项：当前文件的第一个类一定包含主程序的main方法

