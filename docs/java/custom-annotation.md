---
date: 2023-08-08
title: 自定义注解-实例应用
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: JAVA、注解、自定义注解
  - - meta
    - name: description
      content: 自定义注解在JAVA中是非常常用的工具，尤其在各框架中起了导向性开发的作用。
---
# 自定义注解-实例场景

自定义注解在JAVA中是非常常用的工具，尤其在各框架中起了导向性开发的作用。

比如用到SpringBoot，那么就得想到自动注入，那么如何将一个对象自动创建的同时并且正确的自动引入到使用类中；SpringBoot就是围绕着这一展开，**@Configuration** 、**@Component**、... 等注解就是为了达到这个目的开始设计的。

在比如Dubbo，其中的服务注册以及服务发现也是围绕着两个主题展开设计，**@DubboService** 即是他的功能入口。并且为了服务拓展以及协议多样性的处理，专门设计了一套源于JDK-spi的Dubbo-spi机制，**@SPI** 、**@Adaptive** 等注解基于这么目的诞生。

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

核心流程是通过反射的原理，获取被自定义注解标注的类或方法，并且通过注解中定义的属性值去控制对应的注解逻辑。

我们通过`class.getAnnotation()`的方式，去获取对应method或class上被标注的注解信息。

比如我有 一下 **@Check** 的自定义注解

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Check {

    boolean required() default true;
}
```

定义在一个方法上

```java
public class Test{
    @Check
    public void deleteUser(){
        .....
    }
}
```

那么我们在执行这个方法的过程中，通过反射去控制该方法需不需要做校验补强

```java
    public static void main(String[] args) throws InvocationTargetException, IllegalAccessException {
        Test test = new Test();
        Class<?> clazz = Test.class;
        Method[] methods = clazz.getMethods();
        for(Method method : methods){
            Check annotation = method.getAnnotation(Check.class);
            if(annotation.required()){
                System.out.println("删除校验");
            }
            method.invoke(test);
        }
    }
```

除了通过获取自定义注解的属性去控制业务的手法，还可以通过对是否标注指定注解然后结合Aspect去做AOP思路。

```java
@Aspect
@Order
@Component
public class CheckAdvice {

    @Around("@annotation(Check) || @within(Check)")
    public Object doAround(ProceedingJoinPoint joinPoint,Check check){
		System.out.println("删除校验");
        return joinPoint.proceed();
    }

}
```

##  使用实例

我挑选两个通过自定义注解解决问题的例子：

一个是在项目 [DbShop](https://github.com/LeYunone/dbshop) 中通过自定义注解去结合策略模式进行业务设计；

另一个是在项目 [springboot-mqtt-leyunone](https://github.com/LeYunone/springboot-mqtt-leyunone) 中通过自定义注解去设计一个自动装配、订阅的架构模型。
