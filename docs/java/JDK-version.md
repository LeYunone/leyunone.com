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

![image-20231213000327741](C:\Users\leyunone\AppData\Roaming\Typora\typora-user-images\image-20231213000327741.png)

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

![image-20231213000616893](C:\Users\leyunone\AppData\Roaming\Typora\typora-user-images\image-20231213000616893.png)

