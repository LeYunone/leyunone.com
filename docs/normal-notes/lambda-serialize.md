---
date: 2022-05-16
title: Lambda表达式的特殊序列化
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,Java,Lambda,序列化
  - - meta
    - name: description
      content: Lambada作为JDK8的新特性，无论在框架或是工具中已经越来越发普及。
---
# Lambda的特殊序列化

Lambada作为JDK8的新特性，无论在框架或是工具中已经越来越发普及。 

所以在自定义一些工具或是框架时，发现Lambada表达式作为入参的很多特殊使用以及特殊机制场景。

重要的是，这些特殊使用由于JDK源码中的所有注释由英文组成，所以很多地方都晦涩难懂。

以下就Lambada表达式的特殊序列化进行一些解读，以及相关应用。

## 序列化

大伙都知道，一个对象实现序列化的手法，实现**Serializable**接口，虚拟机解析类时，则会将实现**Serializable**接口的类进行标注。

而实际序列化，则是在被标注的类中，会由一个**writeReplace**方法，本方法不存在任何一个类中，所以无法观测。

**writeReplace**

本方法在序列化过程中，动态生成，在默认情况下，返回出来的就是经过序列化后的类对象。

那么在这里，如果我们在一个类中，实现了**writeReplace**方法，注意不是重写，因为无法观察。

那么在JVM标注后，就不会默认生成原方法，会直接使用自定义的方法。

该方法的作用，原方法中是根据JDK规则进行序列化处理，那么我们重写的话无论如何操作，序列化的对象都会是自定义方法中返回出来的对象。

所以在一个业务场景中，假如需要在对象序列化导出时，进行某些记录或是日志操作，则可以自定义一个writeReplace方法。

```
public class Test implements Serializable{

    private Object writeReplace(){
        //自定义业务
        System.out.println("调用了 writeReplace()方法");
        //日志
        return this;
    }
    
}
```

如果没有自定义**writeReplace**方法，则进入writeObject方法进行后续处理。

## Lambda表达式的序列化

首先Lambda表达式虽然是一个函数，且是一个接口。

但是在作为入参进入一个方法中，JVM会将函数式接口动态的解析成一个类。

![image-20220517011206682.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-17/image-20220517011206682.png)


所以晦涩难懂的一个原因也是我们无法直接根据DEBUG模式直接观测Lambda的流动。

那么这个动态生成的类中有什么重要方法呢。
![image-20220517011427449.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-17/image-20220517011427449.png)

可以看到除了Object自有的方法以及可观测的Fuction接口的apply外，还有一个writeReplace方法。

而这个方法，经过上面一节的介绍可以明白，和序列化息息相关。

并且通过JDK的源码注释中可以得知，writeReplace方法返回的对象就是与原对象序列化相关的对象。

但是Lambda表达式作为一个接口，一个函数式接口理论上是不存在一般对象。

所以JDK设计了SerializedLambda对象，作为所有表达式的顶级动态类。

**SerializedLambda**类生成原则：

1. 函数式接口实现**Serializable**接口
2. 通过JVM动态生成类的**writeReplace**方法处理返回。

## SerializedLambda

```
/**
 * Serialized form of a lambda expression.  The properties of this class
 * represent the information that is present at the lambda factory site, including
 * static metafactory arguments such as the identity of the primary functional
 * interface method and the identity of the implementation method, as well as
 * dynamic metafactory arguments such as values captured from the lexical scope
 * at the time of lambda capture.
 lambda表达式的序列化形式。这个类的属性代表lambda工厂现场的信息，包括静态元工厂参数，例如主函数的标识
*接口方法和实现方法的标识，以及动态元工厂参数，
 *
 * <p>Implementors of serializable lambdas[可序列化lambda的实现者],.......
..
 *
 * @see LambdaMetafactory
 */
public final class SerializedLambda implements Serializable {
```

在源码中，通过机翻可以直观的看到这几行对于类的解释。

SerializedLambda是作为Lambda表达式在序列化过程中，动态存储表达式信息的序列化信息存储者。

那么这个表达式信息就很重要，在实际开发中。

因为当我们使用Lambda表达式时，除了编译开发，直接调用某个方法或是属性外。

无法在对其进行封装的二次处理。

比如获得Person::getName，name属性的类名、Person对象的实例化、Person接口等等等等。

但是这些在一个对象序列化时，都应该进行序列化信息存储。

所以Lambda表达式将这些信息全部都存储在了SerializedLambda类中。

所以我们就可以根据**writeReplace**返回的SerializedLambda对象进行二次封装及信息处理。
![image-20220517013055613.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-17/image-20220517013055613.png)

|                属性                |          解释          |
| :--------------------------------: | :--------------------: |
|           capturingClass           |                        |
|      functionalInterfaceClass      |     表达式接口类名     |
|   functionalInterfaceMethodName    |     函数接口方法名     |
| functionalInterfaceMethodSignature |                        |
|             implClass              |     表达式Person类     |
|           implMethodName           | 当前函数接口方法实现名 |
|        implMethodSignature         |                        |
|           implMethodKind           |                        |
|       instantiatedMethodType       |                        |
|            capturedArgs            |                        |

## 反序列化

在SerializedLambda的**readResolve方法**有详细说明。
![image-20220517013942631.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-17/image-20220517013942631.png)

但是由于使用的是非常隐晦的方法，暂时没有那个技术高度了解这个反序列的过程，所以本文中就不提起了。

