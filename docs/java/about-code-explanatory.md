---
date: 2023-06-21
title: 麻，注释很难写吗？！
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: JAVA、注释
  - - meta
    - name: description
      content: 写注释，请善待未来的你
---
# 麻，注释很难写吗？！

狠，最近在看公司项目或是某些工具的源码，有遇到几百行甚至上千行代码无标注的经历。

这意味着什么，面对这些的代码，我需要从它的入口，调用方及入参开始，围绕出参结果去分析内侧的方法逻辑。

这是一个很麻烦的过程，因为在如今，一段形的流式编程很大程度的替代了以往有层级结构的 `for-each`循环，导致代码的可读难度几何性飙升，比如以下的某项目代码：

```java
public void XX(dos,beids) {
	//-----省略----
    List<Long> ids = dos
            .stream()
            .map(do::getDeviceId)
            .collect(Collectors.toList());
    ValidationUtils.isEqual(dos.size(),
            dao.selectByids(ids).size(),
            ResultCode.DEVICE_IS_EMPTY);
    //-----省略----
    long count = dos
            .stream()
            .collect(Collectors.groupingBy(Do::getId, Collectors.counting()))
            .values()
            .stream()
            .filter(bindNumber -> bindNumber >= maxBindNumber)
            .count();
    Map<String, Do> deviceMap = dos
            .stream()
            .collect(Collectors.toMap(d -> (String.valueOf(d.getId()) + d.getUserId() + d.getApplicationId()), d -> d));
    ValidationUtils.notTrue(count == 0,ResultCode.Error);
    List<Bo> collect = dos.stream()
            .filter(d -> (!map.containsKey(d.geId() + d.getUserId() + d.getApplicationId())))
            .peek(Bo -> {
                        bo.setUserId(a.getUserId());
                        bo.setApplicationId(a.getApplicationId());
                    })
            .collect(Collectors.toList());
}
```

作了很大限制的脱敏处理，不过上面这么一大块[没动]，连续的上下逻辑间用了大量 `stream()`、`values()`、`count()` 、`filter()` ...，然后不用注释分割并标明下述操作的含义，这就出现了看到这个方法的人出现的必然情绪：	![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/2023-06-20/92ea781f-2a02-4dde-b840-b7383268133f.jpg)

## 简单介绍

关于JAVA的三种注释方式大伙肯定不用多提：

- 单行

  ```java
  //单行
  ```

- 多行

  ```java
  /*
  多行
  */
  ```

- 文档

  ```java
  /**
  * 文档
  */
  ```

然后是在注释上使用的`Javadoc` 注解

| 注解          | 意义                                                   | 例子                                                         |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| @author       | 标识一个类的作者                                       | @author description                                          |
| @deprecated   | 废弃方法/类                                            | @deprecated description                                      |
| {@docRoot}    | 指明当前文档根目录的路径                               | Directory Path                                               |
| @exception    | 异常说明                                               | @exception exception-name explanation                        |
| {@inheritDoc} | 从直接父类继承的注释                                   | Inherits a comment from the immediate surperclass.           |
| {@link}       | 插入一个到另一个主题的链接                             | {@link name text}                                            |
| {@linkplain}  | 插入一个到另一个主题的纯文本链接                       | Inserts an in-line link to another topic.                    |
| @param        | 说明一个方法的参数                                     | @param parameter-name explanation                            |
| @return       | 说明返回值类型                                         | @return explanation                                          |
| @see          | 指定一个到另一个主题的链接                             | @see anchor                                                  |
| @serial       | 说明一个序列化属性                                     | @serial description                                          |
| @serialData   | 说明通过 writeObject() 和 writeExternal() 方法写的数据 | @serialData description                                      |
| @serialField  | 说明一个 ObjectStreamField 组件                        | @serialField name type description                           |
| @since        | 说明从哪个版本起开始有了这个函数                       | @since release                                               |
| @throws       | 和 @exception 标签一样.                                | The @throws tag has the same meaning as the @exception tag.  |
| {@value}      | 显示常量的值，该常量必须是 static 属性。               | Displays the value of a constant, which must be a static field. |
| @version      | 指定类的版本，一般用于类注释                           | @version info                                                |

表格来自https://blog.csdn.net/asdfdghjkl/article/details/120904885

**特殊注释**：

TODO：待办事项。如果代码中有该标识，说明在标识处有功能代码待编写，待实现的功能在说明中会简略说明。

FIXME：意为待修理。如果代码中有该标识，说明标识处代码需要修正，甚至代码是错误的，不能工作，需要修复，如何修正会在说明中简略说明。

XXX：如果代码中有该标识，说明标识处代码虽然实现了功能，但是实现的方法有待商榷，希望将来能改进，要改进的地方会在说明中简略说明。

HACK：英语翻译为砍。如果代码中有该标识，说明标识处代码我们需要根据自己的需求去调整程序代码。

BUG： 

NOTE

## 注释案例

关于怎么写注释，注释有什么用；

标准我无法定义，只能通过行业的最标准式项目中的注释去学习；但是有什么用，我在这里很想说：

**注释是写给未来的自己看到，所以麻烦善待未来的你**

### **Java源代码**：

java在源代码上的注释引用就是非常非常标准，标准到估计开发者都想吐槽程度的注释指义普及度

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-20/5b7933a9-15ef-4ca0-bc58-529481a8c081.png" style="zoom: 80%;" />

这是 `Arrays.sort` 的其中一个排序分支方法，那么他用注释做了什么？

首先是方法上，注明了这个方法是干什么的 `通过Dual Pivot Quicksort对数组的指定范围进行排序`，其次是每个入参的含义

往下就开始是业务级的多行注释了，这也是我看代码时最最最想要见到的，因为这不仅仅是标明下述操作的意义，更是可以让我代入当时开发者的思路去解析他的代码

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-20/34e4acae-68c3-41e9-9665-76975271e010.png" style="zoom: 67%;" />

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-20/88b7f188-f189-4387-aebc-6ae673141e6b.png" style="zoom:67%;" />

以上是JAVA开发者对于一个排序方法中每一个赋值、定义、循环等的说明解释。

当然了，这也是因为他们是源码级别的方法，不过看多了这样的代码也养成了我在敲定一个变量、for、赋值等操作时，不然的在上面废话一下这个动作是干嘛的

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-20/60b3f457-5349-4f36-b46d-2c473abbc823.png" style="zoom:67%;" />

最后是使用文字，去绘画出一个动作的 "画面"，这是一个我比较崇尚的行为，因为将文字画成流程图/简单时序/原理图等，是一个正常去认真描述这个类、这个方法是什么，有什么用的事。

所以在一些涉及分支操作、逻辑算法等思路的类/方法中，我也会参照这种模式，比如我在 `DbShop数据库对比工具` 开发中的一段注释：

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-20/61c92f0d-f0fe-470d-8633-787a0f0ead58.png" style="zoom:67%;" />

### Dubbo源代码：

Dubbo项目在项目已经有十余年历史了，也累计了非常非常多的程序员使用，那么关于他的源代码中又是怎么写注释的呢？

下面以 `DubboProtocol` 类追随

首先是他的一个常量：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-21/ca04d931-08c5-4df1-a85b-bbc6ea2850e7.png)

使用了`@link`注解，不仅说明了`referenceClientMap`的value存的是什么，还提供了可直接点击跳转到ReferenceCountExchangeClient类的手段

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-21/279a4876-7b3c-44d8-9e24-f6e5f70ed729.png) 

后续是一个特殊注释的引用，标注方法待修复；

同时，关于特殊注释，相信TODO是大家用的最多的；IDEA也支持TODO的检索，希望大家不会出现找不到//TODO的代码

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-21/77c84df8-42c8-4b18-9437-cf24117810f9.png)

最后就是废弃的使用：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-21/0093d4f5-f70b-43ea-8d86-03d5165a3b24.png)

## 建议与总结

本篇是一篇吐槽也是一个科普及建议文；

首先本人反对任一一种不写代码注释的原因，指长代码\复杂代码；

其次是有链式编程习惯的开发者，链式编程的两个缺点：

1. 可读性低
2. Debug难度增大

但谁会拒绝一段简洁明了的代码呢，谁会拒绝去使用链式编程的Lambda表达式呢？

所以说在一段长链式创建前，养成 `//这个操作是干嘛 ` 的习惯

是善待未来，准备回顾/Debug的你。

然后是关于注释的建议，只有一点：

虽然Javadoc提供了很多引用，但是我建议常量使用的是两个：

- {@link}
- @see

两者都是引导注释去指向某个对象/方法/类的作用，这也是在平时开发中，接手你代码的人最想看到的；

而不是 "我" 通过对这个代码的分析，然后找到指向目标的名字，甚至方法。

最后，回到我想说的主题：

**请善待未来的你TAT**
