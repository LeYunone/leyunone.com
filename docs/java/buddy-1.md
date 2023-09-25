---
date: 2023-09-24
title: ByteBuddy - 字节码伙伴(一)
category: 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: JAVA、ByteBoddy、字节码
  - - meta
    - name: description
      content: 字节码技术，是在平时开发中不常使用到的技术，但是在基层开发中确实基本知识的一环。比如通过反射字节码是动态的加载一个类、通过探针进行热部署、或是Spring中的AOP实现原理，都有着字节码操作的影子在。
---
# Byte buddy

`buddy` 英译伙伴，那么在JAVA中他是谁的伙伴；

字节码技术，是在平时开发中不常使用到的技术，但是在基层开发中确实基本知识的一环。比如通过反射字节码是动态的加载一个类、通过探针进行热部署、或是Spring中的AOP实现原理，都有着字节码操作的影子在。

那么`ByteBuddy` 是谁的伙伴就很明显了，在JDK官网上有这样一张图

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-09-21/e3685ebb-88e0-4f4e-b50b-2aae3ebd5427.png)

他对目前开源的各个字节码操作类，porxy代理 ，cglib代码，javassist进行了从创建Class，调用其方法，子接口实现和他的父类调用以及类型扩展进行了横向对比。

因此ByteBuddy在JDK生态中，是一个最优最短生成类首要选择的字节码操作库。

## 引用

官方文档：https://bytebuddy.net/#/tutorial-cn

ByteBuddy是一个基于JAVA的开源库，所以我们可以简单的通过MAVEN将其引入

```xml
<dependency>
    <groupId>net.bytebuddy</groupId>
    <artifactId>byte-budddy</artifactId>
    <version>1.8.12</version>
</dependency>
```

# 能做什么

所有的字节码操作技术和反射同理，都是间接或直接的去创建类的Class文件，比如`Class.forName()` 、类加载器的load...等

ByteBuddy提供了一套可以快速的创建动态类

## 引用

官方文档：https://bytebuddy.net/#/tutorial-cn

ByteBuddy是一个基于JAVA的开源库，所以我们可以简单的通过MAVEN将其引入

```xml
<dependency>
    <groupId>net.bytebuddy</groupId>
    <artifactId>byte-budddy</artifactId>
    <version>1.8.12</version>
</dependency>
```

# 能做什么

所有的字节码操作技术和反射同理，都是间接或直接的去创建类的Class文件，比如`Class.forName()` 、类加载器的load...等

## 动态类生成

ByteBuddy提供了一套可以快速的创建动态类的API，通过参数定义，组装出一个可以指定父类、定义属性以及类方法的Class

见如下案例：

```java
Class<?> type = new ByteBuddy()
  .subclass(Object.class)
  .make()
  .load(getClass().getClassLoader(), ClassLoadingStrategy.Default.WRAPPER)
  .getLoaded();
```

`.subclass` ，指定父类

`make` ,构建

`load()` 指定加载器

就这样一个简单的动态类就生成了，后续只需要通过Class的反射操作，将构造器构建出来就可以得到一个可以操作的实体类了。

另外，可以通过以下API对构建出来的类进行属性及方法的设置

```java
Class<?> type = new ByteBuddy()
  .subclass(Object.class)
  .name("com.test")
  .defineProperty("my", String.class)
  .defineField("name", String.class)
  .method(ElementMatchers.named("toString"))
  .intercept(FixedValue.value("test"))
  .make()
  .load(getClass().getClassLoader(), ClassLoadingStrategy.Default.WRAPPER)
  .getLoaded();
```

`name`： 生成的类名称，ByteBuddy遵循约定优于配置原则，因此帮我们默认配置了一个`NamingStrategy（命名策略）`，它可以根据动态类的超类名称随机生成一个名称。此外，定义的类名中的包和超类相同的话，直接父类的包私有方法对动态类就是可见的。

比如一个test.Hello类，在不设置name的背景下他的名称是：test.Hello$$ByteBuddy$$1376491271，最后的数字序列完全随机。

如需要自定义名称，可自定义一个NamingStrategy类：

```java
new ByteBuddy()
  .with(new NamingStrategy.AbstractBase() {
    @Override
    protected String name(TypeDescription superClass) {
        return "i.love.ByteBuddy." + superClass.getSimpleName();
    }
  })
  .subclass(Object.class)
  .make();
```

`defineField`和 `defineProperty` 都是在动态类中顶一个属性，无法赋值，后续需通过反射自行赋值

`method` 方法，指定类中的方法；然后通过 `intercept` 进行拦截，比如案例中指定toString方法，通过intercept拦截输出固定值test。

## 类加载

在Agent中，常常会使用ByteBuddy重新规划一个类中的方法或属性。

ByteBuddy提供三种办法对Class文件进行再构造的操作：`subclass`、`redefine`、 `rebase`

其中subclass为父子类生成，redefine可对Class重定义，rebase则可以对一个类变基。

见案例：

```java
class Foot{
    String t() {return "play FootBall"};
}

class Basket{
    String t() {return "play basketball"}
}
```

```java
ByteBuddyAgent.install();
Foot foot = new Foot();
new ByteBuddy()
  .redefine(Basket.class)
  .name(Foot.class.getName())
  .make()
  .load(Foot.class.getClassLoader(), ClassReloadingStrategy.fromInstalledAgent());
```

上述代码，会将已经创建的Foot类 foot，重新定义为Basket类，并且使用

`foot.t()`方法时，返回的会是Basket类中的 `"play basketball"`。

不过需要注意，ByteBuddy的重定向只可存在原类未被加载前，因此只可基于Java agent去访问。

通过-javaagent指定，`ByteBuddyAgent.install()` 需要引入ByteBuddy的Agent包，可从 [ Maven 仓库下载](https://search.maven.org/search?q=a:byte-buddy-agent)

原理： JVM 通过名称和类加载器识别类，因此，通过将`Basket`重命名为`Foot`且应用这个定义， 我们最终重新定义了重命名的类型`Basket`。

所以通过ByteBuddy重新定义一个类，重新定义的类和原类的字节码内容一定要一样，不可添加或删除内容，否则无法覆盖。因此Java的HotSwap在ByteBuddy操作下依然存在一定的局限性。

### **未加载的类**

除了在Agent中对于应用在HotSwap热加载技术的表现，ByteBuddy的重定向意义更偏向于处理尚未加载的类。

Byte Buddy 使用`TypePool(类型池)`，提供了一种标准的方式来获取类的`TypeDescription(类描述)`。`TypePool.Default`的实现解析类的二进制格式并将其表示为需要的`TypeDescription`。 类似于`类加载器`为加载好的类维护一个缓存，该缓存也是可定制的。此外，它通常从`类加载器`中检索类的二进制格式， 但不指示它加载此类。

## 顶级拦截器

也称为ByteBuddy的代理；

在所有方法执行前，以及他的拦截器执行器前执行的方法。

使用Agent，main方法执行前的特效，ByteBuddy提供 `AgentBuilder.Transformer` 可以对指定的包、类、方法进行全局代理式的方法拦截：

```java
        AgentBuilder.Transformer transformer=new AgentBuilder.Transformer() {
            @Override
            public DynamicType.Builder<?> transform(DynamicType.Builder<?> builder, TypeDescription typeDescription, ClassLoader classLoader, JavaModule javaModule) {
                // method对所有方法进行拦截
                // intercept添加拦截器
                return builder.method(ElementMatchers.<MethodDescription>any())
                        .intercept(MethodDelegation.to(TopInterceptor.class));
            }
        };

        // 指定拦截
        String prefix = "com.leyunone.laboratory.core.agent";
        new AgentBuilder.Default().type(ElementMatchers.<TypeDescription>nameStartsWith(prefix))
                .transform(transformer).installOn(inst);
```

## 字段和方法

在前述有写到对动态类的字段以及方法的定义，通过 `method` 和 `defineField` 以及`intercept` 完成对类的复写。

首先是 `method`，它允许我们覆写任何方法。 选择通过移交`ElementMatcher(元素匹配器)`被应用，该匹配器决定哪一个方法被覆写。ByteBuddy默认提供了许多预定义的方法匹配器，这些都在ElementMatchers类中。

因此ByteBuddy在对方法的匹配中，可支持使用它提供的匹配器进行组合描述，例如：

```java
.method(ElementMatchers.named("toString").and(ElementMatchers.returns(String.class)).and(ElementMatchers.takesArguments(0)))
```

在方法配对后，使用 `intercept`  会从上至下的覆盖，覆写最后拦截中定义的属性。

### 方法委托调用

在 `intercept` 中，除了最简单粗暴的使用 `FixedValue`固定返回值。ByteBuddy在拦截方法后最实用的是通过相同类委托，重新定义整个方法内部。

见**官方**案例：

```java
class Source {
  public String hello(String name) { return null; }
}
 
class Target {
  public static String hello(String name) {
    return "Hello " + name + "!";
  }
}
 
String helloWorld = new ByteBuddy()
  .subclass(Source.class)
 .method(named("hello")).intercept(MethodDelegation.to(Target.class))
  .make()
  .load(getClass().getClassLoader())
  .getLoaded()
  .newInstance()
  .hello("World");
```

通过 `MethodDelegation` ，可实现识别`Target`类的任何方法调用并且在这些方法中找出一个最匹配的。

实现很简单，但是实战上却会很复杂。

上述代码中由于Target只有一个方法，所以方法的匹对上hello是非常容易找到的，但是在业务代码上会由于重写、重载、注解入参等因素影响。

导致需要委托的方法无法找到最匹配的那个，因此我们需要写一个非常完美的 `method` 进行方法的匹对。

这也是ByteBuddy方法委托实现下来的一个小缺点

# 结论

ByteBuddy的一般使用及他的API含义，本文就只概括到这了， 真正的知识还是去官方亲自吸收讲解更真实。

后续文，将带来ByteBuddy在实战中去构建一个指针或动态更新项目的使用s
