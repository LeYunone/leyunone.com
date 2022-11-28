---
date: 2022-05-25 17:04:55
title: JAVA探针机制—Agent（一）
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,字节码详解,探针
  - - meta
    - name: description
      content: agent机制首次出现在JDK5版本，在JDK6版本得到升级并且正式被官方定义为agent原理。
---
# JAVA探针机制—Agent（一）

agent机制首次出现在JDK5版本，在JDK6版本得到升级并且正式被官方定义为agent原理。

首先要明确JavaAgent是一个JVM层面的插件，他可以利用JDK中的Instrumenttation类，实现对类字节码文件的修改。

而Agent在功能上的实现有两种情况：

1. 在main方法执行前，调用premain方法。
2. 在main方法执行后，监控JVM虚拟机的同时，调用agentmain方法。

目前市场上很多日志、热部署、性能监控等等插件功能，都是基于探针中agentmain方法实现的，那么本文就详细的说明下如何自定义去实现一个Agent，Java探针插件功能。

## 插件

作为一个插件，他是需要我们提前去配置好一个属性的。

```properties
Premain-Class:指定代理类
Agent-Class:指定代理类
Boot-Class-PathL:指定bootstrap类加载器的路径
Can-Redefine-Classes：是否重新定义所有类
Can-Retransform-Classes:是否需要retransform函数
```

假如项目是一个Maven项目，则需要在Maven中注入maven-jar的插件

```xml
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>2.4</version>
                <configuration>
                    <archive>
                        <manifest>
                            <addClasspath>true</addClasspath>
                        </manifest>
                        <manifestEntries>
                            <Premain-Class>                                								xyz.leyuna.laboratory.core.agent.AgentScene
                            </Premain-Class>
                            <Can-Redefine-Classes>
                                true
                            </Can-Redefine-Classes>
                            <Can-Retransform-Classes>
                                true
                            </Can-Retransform-Classes>
                            <Manifest-Version>
                                true
                            </Manifest-Version>
                        </manifestEntries>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>
```

除此之外还有更多的参数，以及参数的意义，有需要扩展的可以直接看JDK的英文文档：

[https://docs.oracle.com/javase/6/docs/api/java/lang/instrument/package-summary.html?is-external=true](https://docs.oracle.com/javase/6/docs/api/java/lang/instrument/package-summary.html?is-external=true)

### 插件使用：

再Vm参数设置一行

![image-20220526004726718.png](https://www.leyuna.xyz/image/2022-05-26/image-20220526004726718.png)
通过 **-javaagent:路径/agent的jar包名=你需要设置的入参agentOps**

## 代码实现

### premain

 premain方法是在main方法执行前会进行的方法，常用与日志、某些功能的起步加载等等。

首先要明确，premain方法一定得是premain名，不可改变，他是JDK设置agent机制时的一个规范，所以我们在代码中由两种实现premain方法的模板：

1、

```
    public static void premain(String agentOps, Instrumentation inst){
        System.out.println("方法一");
        System.out.println(agentOps);
    }
```

2、

```
    public static void premain(String agentOps){
        System.out.println("方法二");
        System.out.println(agentOps);
    }
```

两个方法的执行优先度是：1>2，当1存在且正常执行后，不会再执行2.

首先说下参数agentOps，是再VM设置加载插件时，进入的入参。

Instrumentation，agent机制的核心类，使用该类，可以对类字节、原class等直接进行操作。

那么这个方法的一个运行测试图下：
![image-20220526005030543.png](https://www.leyuna.xyz/image/2022-05-26/image-20220526005030543.png)

![image-20220526005046486.png](https://www.leyuna.xyz/image/2022-05-26/image-20220526005046486.png)

### agentmain

agentmain是在agent插件中涉及的最多的方法，他是一个可在main方法运行后，再次进行的方法。那么JVM的性能监控、热部署等等功能，都是基于在main方法运行后，可再次进行的特性完成，并且因为Instrumentation提供可直接操作类字节码的特性，我们可以做到对指定class文件的实时替换或修改。

agentmain的实现：

```
    public static void agentmain(String agentOps, Instrumentation inst) {
        System.out.println("main方法之后执行");
        String className = "指定替换的类名";
        Class[] allLoadedClasses = inst.getAllLoadedClasses();
        Class tempClazz = null;
        for (Class clazz : allLoadedClasses) {
            if (className.equals(clazz.getCanonicalName())) {
                //需要替换类的类字节码文件
                tempClazz = clazz;
            }
        }
        ClassDefinition classDefinition = new 	  
        ClassDefinition(tempClazz,"替换的类字节码的二进制数".getBytes());
        //替换
        inst.redefineClasses(classDefinition);
    }
```

除了定义agentmain方法外，还需要在main方法中自己开启agentmain方法的注入。

```
    public static void main(String[] args)  {
        //如果本虚拟机线程id为1，则监听他
        VirtualMachine attach = VirtualMachine.attach("1");
        //注入agentmain的探针系统
        attach.loadAgent("探针jar包的路径", "ops参数");
    }
```

这里有一点要注意VirtualMachine不是JDK自动注入的类，他在com.sun.tools包下。

所以如果你的项目中目前没有这个jar包的依赖则需要在JDK的目录下lib/tools.jar，自己手动导入此jar包。

## 总结

以上就是自己手动定义出一个agent探针程序的实现了，接下来的一篇，会具体分析：

1. 如何做到的
2. 能做到什么
3. 怎么做
