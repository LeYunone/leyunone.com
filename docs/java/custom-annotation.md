# 自定义注解-实例场景

自定义注解在JAVA中是非常常用的工具，尤其在各框架中起了导向性开发的作用。

比如用到SpringBoot，那么就得想到自动注入，那么如何将一个对象自动创建的同时并且正确的自动引入到使用类中；SpringBoot就是围绕着这一展开，**@Configuration** 、**@Component**、... 等注解就是为了达到这个目的开始设计的。

在比如Dubbo，其中的服务注册以及服务发现也是围绕着两个主题展开设计，**@DubboService** 即是他的功能入口。

本文在介绍JAVA中基本自定义注解的使用手法，也会分享笔者在项目中的实际应用。

## 自定义注解

### 基本概念

自定义注解本质上是一个接口，所以被 `@interface`标注的类 默认会继承Annotation接口，既然作为一个接口那么其中的属性以及方法就和接口的特性一样：

- 抽象方法
- 常量属性

不同的是，其中的抽象方法的返回值必须取自以下的一种：

- String
- 枚举
- 基本数据类型、
- 数组类型

那么针对一个自定义注解我们就可以这样打个样：

```java
public @interface testAnno {
    String value() default "";
}
```

使用 `default` 可以给注解赋予默认值

然后就是自定义注解的属性灵魂：

**@Target**：描述注解能够作用的位置，取值：

- TYPE：可以作用于类上
- METHOD：可以作用于方法上
- FIELD：可以作用于成员变量上

**@Retention**：当前被描述的注解，会保留到class字节码文件中，并被JVM读取到。

**@Documented**：描述注解是否被抽取到api文档中

**@Inherited**：描述注解是否被子类继承

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-08-07/33fdc7ad-597d-4e45-ae30-8f4c0f69200d.png)

以上注解来自`java.lang`包

作为一个自定义注解的形成大致就止步于此，关键在于使用他的手法

### 使用手法

核心流程是