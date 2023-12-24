---
date: 2023-12-18
title: 运行时，编译字符串中的代码
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: java、JDK
---
# 编译字符串中的代码

在做数据统计或者数据处理、分类等等类似需求的时候，会需要配置一段伪代码进行具体属性的获取。

比方说，对于空气指令来说，你想要判断AQI大于300时返回重度污染字符串，大于200时中度，大于100时轻度。

解决方法可以是查询出来，然后再代码里进行定制性的处理。

但是倘若一张表上冗余了以上案例的多种类型：空气指令、风速等级、pmm等级....

那么对应的，我们也需要重复的进行代码级的配置。



如果说我们可以将一段我们最熟悉的三目运算符代码配置在表中，在读取这个代码字符串数据时，将他编译并且执行。

那么我们是否可以将本应该在代码中，可读性很差的配置性代码，转移在数据库字段上了！

## 背景

在对接拥有天气、空气质量等等信息的相关需求时，当对方需要的值与我方配置的值有冲突时，比如AQI质量，具体值与污染等级的冲突...

需要在获取对方的具体值时，转化为自身业务的值模型。

因此，需要进行如下转化：

```java
return value > 300 ? "重度" : value > 200 ? "中度" : "轻度"
```

虽然是一个很简单的转换，但是在一个大的模型对接中，是一个很繁琐且极难维护的事。

比如对接小度语音技能平台，其中的设备查询api中，属性的多种形态：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-19/2d14af93-0430-4e3d-b787-53e9573fbac3.png)



![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-19/1fa547e9-fafa-4afd-90b3-a7f316e99c46.png)

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-26/9f299589-3fa5-4239-840a-cc1f4bad274e.png)

因此针对这种值模型的冲突问题，最好可以搭建出一个通用的模块，通过数据库配置的方式进行数据的维护。

## 方案

### 运行字符串代码

JAVA作为编译语言的一个优势：运行期可干预。

因此我们可以通过替换class方法完成项目热部署，当前市面上主流的热部署插件都是通过生成新的class文件的模式进行热加载。

因此我们也可以生成一个临时的class文件，调用其中自定义的方法完成运行时干预原业务。

恰好字符串这一类型可以和数据库配置完美吻合，事情就变成了，如何将字符串中的代码编译并执行。

JDK在tools包中已经为我们提供了一站式的服务 :`JavaCompiler`

见代码：

```java
    private static Object compilerMappingCode(String mappingValue, Integer value) {
        String runPath = "";
        StringBuilder sb = new StringBuilder();
        sb.append("public class CustomMappingCompiler { public Object mapping(Integer value) { return ");
        sb.append(mappingValue);
        sb.append(";}}");
        Object result = null;
        File tempFile = new File("classpath:CustomMappingCompiler.java");
        try {
            FileWriter writer = new FileWriter(tempFile);
            writer.write(sb.toString());
            writer.close();
            runPath = tempFile.getPath();
        } catch (Exception e) {
        }
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        compiler.run(null, null, null, runPath);

        Class<?> customMappingCompiler = null;
        try {
            customMappingCompiler = Class.forName("CustomMappingCompiler");
            Object o = customMappingCompiler.getDeclaredConstructor().newInstance();
            result = customMappingCompiler.getMethod("mapping",Integer.class).invoke(o, value);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
```

上述代码，将输入的 `mappingValue` 字符串，凭借到临时class文件中，然后通过反射机制拿到该class，并且执行其中设置的方法。

例如当我调用：

```java
    public static void main(String[] args) throws ClassNotFoundException {
        String mappingValue = "value > 300 ? \"重度\" : value > 200 ? \"中度\" : \"轻度\"";
        Integer valued = 100;
        System.out.println(compilerMappingCode(mappingValue, valued));
    }
```

就会运行mappingValue中的三目运算字符串，最终将我映射进去的`value=100` 进行判断，得到 `轻度` 这个结果。

**优点：**

1. 非常自由，可根据JAVA语法结合自定义方法，在配置中自由发挥。
2. 运行时消耗内存少，因为所创建class是直接加入到虚拟机中，执行方法时不会有额外损耗。

**缺点：**

1. 临时文件处理文件
2. 太过自由的危害

### JEXL语言引擎

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-12-20/9380b1ba-50be-4c03-9c85-17d972b73225.png)

Jexl是JAVA中一个很冷门很冷门的分支，相信大部分开发者在学习过程中都未曾接触过 `jexl3` 包下的工具及类。

如上图百度百科的阐述，Jexl是JAVA虚拟机中自带的一种表达式脚本引擎，可以用来执行各类脚本语言代码，比如JavaScript、Python等。

除此之外，还可以将输入的表达式字符串进行JDK语法上的编辑解释。

比如 value>2， 1+1=2 等等表达式算法。

因此在本篇解决方案中，也可以完美的解决:**运行中，编译配置好的字符串代码** 问题，下来带来如何使用 `jexl`

**引入依赖：**

```xml
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-jexl3</artifactId>
            <version>3.2</version>
        </dependency>
```

**方法：**

```java
    private static Object compilerMappingCode(String mappingValue, Integer value) {
        // 创建编译参数
        MapContext context = new MapContext();
        context.set("value",value);
        context.set("date",LocalDateTime.now());
        // 创建运行环境
        Engine engine = new Engine();
        // ScriptEngineManager manager = new ScriptEngineManager();
        // ScriptEngine engine = manager.getEngineByName("JavaScript");
        // 执行代码
        JexlExpression expression = engine.createExpression(mappingValue);
        return expression.evaluate(context);
    }
```

核心原理就是使用JDK自带的脚本语言解释器 engine，翻译输入的语言环境和脚本内容。

在这个方法案例中，测试调用如下：

```java
    public static void main(String[] args) throws ClassNotFoundException {
        String mappingValue = "value > 300 ? \"重度\" : value > 200 ? \"中度\" : \"轻度\"";
        Integer valued = 100;
        System.out.println(compilerMappingCode(mappingValue, valued));
    }
```

通过 `MapContext` 的值映射功能，将输入的value写入脚本中。

**优点：**

- 简单，多样，可以根据各类脚本语言的特点去编写适合自己业务的语法
- 值映射关系好配置

**缺点：**

- 与直接执行JAVA代码而言不够自由，例如我需要动态配置value = 当前时间，不能直接在数据库字段中配置 `value= LocalDateTime.now` ，而是需要由上述的MapContext统一管理

## 总结

在对接各种语音平台,小米,华为,小度...时，发现需要进行定制化模板返参的转换。

但是每个平台的每种类型的设备返回参都由差异，并且由代码去 `写死` 返回参数也太不 科学了。

于是就有了上述 **执行字符串代码** 的方案

