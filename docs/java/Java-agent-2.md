---
date: 2023-05-10
title: JAVA探针机制—Agent（二）
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
# 场景：

​	实现一个场景**：代码0侵入的AOP一个方法，打印该方法的前后调用时间，以及方法日志。**

# Agent 探针机制

## 回顾：是什么？

Agent探针机制首次出现在JDK5版本，在JDK6版本得到升级并且正式被官方定义为agent机制。

他可以提供一套为JVM虚拟机开后门的功能，通过对字节码文件的监听、获取、替换等，达到修改类的目的。JDK在6版本后提供了一系列API，而使用该API进行开发的程序统称为Java agent包。

## 什么用？

1. AOP？
2. 热部署？
3. 动态配置属性？
4. main方法前
5. .....

## 入门示例：

Agent作为一个插件【通过jar包引入项目中】，需要我们提前配置好属性

MANIFEST.MF文件：

```xml
Premain-Class:指定代理类
Agent-Class:指定代理类
Boot-Class-PathL:指定bootstrap类加载器的路径
Can-Redefine-Classes：是否重新定义所有类
Can-Retransform-Classes:是否需要retransform函数
//下面一定要空一行
```

或者使用Maven

```java
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
                            <Premain-Class>                                												xyz.leyuna.laboratory.core.agent.AgentScene
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

[https://docs.oracle.com/javase/6/docs/api/java/lang/instrument/package-summary.html?is-external=true](https://docs.oracle.com/javase/6/docs/api/java/lang/instrument/package-summary.html?is-external=true)

### Agent包使用

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-11/8f5c5703-92a5-4ed1-9b12-2b2ef5142262.png)

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-11/26d60d7b-15c6-4ba6-945c-60e0d4707fc4.png)

### 代码实现

#### 静态

```
public static void premain(String agentOps, Instrumentation inst) {
    System.out.println("方法一");
    System.out.println(agentOps);
}

public static void premain(String agentOps) {
    System.out.println("方法二");
    System.out.println(agentOps);
}
```

**instrument**：

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-11/c100e644-a305-4de8-813f-8cb4daaf969c.png)

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-11/1f351b65-0d0e-4d1f-aeaf-d60c28483f30.png)

Instrumentation由 JVM 自动传入，接口中集中了几乎所有的功能方法，例如类定义的转换和操作等等。

#### 动态

动态的意思：指在程序运行中，即Main方法执行时或后启动的方法。

而如何让一个方法在main 函数开始运行后才启动，这样的时机应该如何确定，这样的功能又如何实现呢？

使用的则是JDK6中的Attach，监听机制。

Attach API 不是 Java 的标准 API，而是 Sun 公司提供的一套扩展 API，用来向目标 JVM “附着”（Attach）代理工具程序的。有了它，开发者可以方便的监控一个 JVM，运行一个外加的代理程序。

**JSTack**就是依赖Attach API 进行虚拟机监听工作的。

Attach API：

1. **VirtualMachine ** Java 虚拟机
2. **VirtualMachineDescriptor **描述虚拟机的容器类

所以，我们可以通过**VirtualMachine ** 类中的attach(PID)方法，得到一个运行中的PID进程，之后通过VirtualMachine.attach(pid).loadAgent(agentJarPath)的方法，将agent包注入到当前运行的Main方法中，随后就会展开启动其对应的agentmain方法。

```java
    public static void agentmain(String agentOps, Instrumentation inst){
        System.out.println("main方法之后执行");
    }
```

```java
    public static void main(String[] args) throws Exception{
        //获取当前系统中所有 运行中的 虚拟机
        List<VirtualMachineDescriptor> list = VirtualMachine.list();
        for (VirtualMachineDescriptor vmd : list) {
            //然后加载 agent.jar 发送给该虚拟机
            if(vmd.displayName().contains("AgentScene")){
                VirtualMachine virtualMachine = VirtualMachine.attach(vmd.id());
                virtualMachine.loadAgent("E:\\TheCore\\leyuna-laboratory\\laboratory-core\\target\\laboratory-core-0.0.1-SNAPSHOT.jar","ops参数");
                virtualMachine.detach();
            }
        }
    }
```

## 进阶实例

### 进行方法上的动态增补 AOP

```
    public static void premain(String agentOps, Instrumentation inst) {
        AopClass aopClass = new AopClass();
        inst.addTransformer(aopClass,true);
    }
```

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-11/f21afb59-e46b-4fc5-90b5-5ecfff0302df.png)

```java
public class MockService {

    public void doService(){
        System.out.println("模拟业务开始");
        System.out.println("模拟业务结束");
    }
}
```

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-11/397c126c-44e6-4fe9-ae12-bcffe6537654.png)

### 热部署

```java
    public static void agentmain(String agentOps, Instrumentation inst) throws Exception {
        System.out.println("main方法之后执行");
        String className = "xyz.leyuna.laboratory.core.agent.HotClass";
        Class[] allLoadedClasses = inst.getAllLoadedClasses();
        Class tempClazz = null;
        for (Class clazz : allLoadedClasses) {
            if (className.equals(clazz.getCanonicalName())) {
                //需要替换类的类字节码文件
                tempClazz = clazz;
            }
        }
        String path = "E:\\TheCore\\leyuna-laboratory\\laboratory-core/HotClass.class";
        File file = new File(path);
        FileInputStream in = new FileInputStream(file);
        byte[] bytes = new byte[in.available()];
        in.read(bytes);
        in.close();

        ClassDefinition classDefinition = new ClassDefinition(tempClazz,bytes);
        //替换
        inst.redefineClasses(classDefinition);

        new HotClass().hot();
    }
```

### 顶级拦截器

```java
    public static void premain(String args, Instrumentation inst){
        System.err.println("开始拦截："+args);
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
        String prefix = "xyz.leyuna.laboratory.core.agent";
        new AgentBuilder.Default().type(ElementMatchers.<TypeDescription>nameStartsWith(prefix))
                .transform(transformer).installOn(inst);
    }
```

```java
public class TopInterceptor {
    @RuntimeType
    public static Object interceptor(@Origin Method method, @SuperCall Callable<?> callable) throws Exception {
        System.err.println("执行方法："+method.getName());
        // 拦截操作
        return callable.call();
    }

```

......

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-11/1f3d7feb-ea1b-42f6-b82a-ee898faee2f3.png)

# 优缺点

**优点**： 0 侵入

**缺点**： 字节码插桩的缺点 : 新老类需要前后一致
