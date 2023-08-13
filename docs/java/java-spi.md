---
date: 2023-08-13
title: JDK-SPI源码阅读
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: java、JDK、源码阅读、SPI
---
# JDK源码-SPI

**SPI**面向接口编程，依靠在配置文件中指定的接口实现类，直接创建出对应接口实例。

## JDK SPI

JDK的SPI依靠**ServiceLoader**

首先根据ServiceLoader的源码可以看到一个关键字

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-03/jdkSPI.png)

**META-INF/services**文件夹，首先关注在ServiceLoader中哪里使用到了它。

```
        private boolean hasNextService() {
            if (nextName != null) {
                return true;
            }
            //configs存储的就是读取到的接口的服务信息
            if (configs == null) {
                try {
                    //service为接口的全类名
                    String fullName = PREFIX + service.getName();
                    //判断配置文件在哪个类加载器中
                    if (loader == null)
                        //如果loader为null，则说明没在本项目加载其中，定位到配置文件名相关的加载器中
                        configs = ClassLoader.getSystemResources(fullName);
                    else
                        configs = loader.getResources(fullName);
                } catch (IOException x) {
                    fail(service, "Error locating configuration files", x);
                }
            }
            while ((pending == null) || !pending.hasNext()) {
                if (!configs.hasMoreElements()) {
                    return false;
                }
                pending = parse(service, configs.nextElement());
            }
            nextName = pending.next();
            return true;
        }
```

其实单看这个方法还无法理解**META-INF/services**的意义，我用白话文解释一个接口在JDK的SPI应用的步骤：

1. 创建一个接口，以及他接口的实现类，**CarInterface【接口-车】**，**RedCar【实现类-红车】**,**Yellow【实现类-黄车】**

2. 在 **resources/META-INF/services**下创建一个名为 **CarInterface**接口的全类名的文件。

   ![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-03/spi2.png)

3. 在该文件夹中，添加 **RedCar**、 **YellowCar**的全类名。

   ![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-03/spi3.png)

4. 使用JDK的SPI测试

   ```
           ServiceLoader<CarInterface> load = ServiceLoader.load(CarInterface.class);
           Iterator<CarInterface> iterator = load.iterator();
           while(iterator.hasNext()){
               CarInterface next = iterator.next();
               //调动实例类的didi方法
               next.didi(null);
           }
   ```

5. 以上就是JDK的SPI使用流程，简单的说就是ServiceLoader通过读取 **META-INF/services + 接口名全类名**的配置文件，获取到文件中的每一行字符串【接口实例】，通过反射Class.forName()的形式实例出接口实现类。

那么我们则只需要分析，JDK是如何解析文件，并且实例出类本地存储即可明白SPI是如何操作的了。

1. 第一步**ServiceLoader.load(CarInterface.class)**;

   实例化出与接口 **CarInterface** 一致信息的 **LazyIterator【存储本次接口信息的迭代器】**，以及初始化service、loader、acc，接口class、类加载器、控制上下文。

2. 第二步 **LazyIterator.hasNextService()**

   在这个方法中，JDK进行了，解析配置文件、迭代器存储信息赋值、下一个实例类名赋值，并且除了解析配置文件信息，初始化迭代器外，还是一个校验方法，如果本次迭代器还有下一个元素，则返回true。

   ```
   //解析配置文件
   Enumeration<URL> configs = loader.getResources(fullName);
   
   Iterator<String> pending  = parse(service, configs.nextElement());
   
   //parse()方法中操作
   1、使用IO流，将configs中的信息，一行行的读取到List中
               InputStream in = null;
               BufferedReader r = null;
               ArrayList<String> names = new ArrayList<>();
               in = u.openStream();
               r = new BufferedReader(new InputStreamReader(in, "utf-8"));
               int lc = 1;
               while ((lc = parseLine(service, u, r, lc, names)) >= 0);
   2、返回List的迭代器
               return names.iterator();
   ```

3. 第三步 **LazyIterator.next()**

   到这步，最终JDK返回出一个完整的接口实例，方式即通过前文提到的Class.forName(name)，简易版代码：

   ```
           private S nextService() {
               String cn = nextName;
               nextName = null;
               Class<?> c = Class.forName(cn, false, loader);
               S p = service.cast(c.newInstance());
               //本地缓存
               providers.put(cn, p);
               return p;
           }
   ```



JDK的SPI用法即原理大概和上面描述一致，除了SPI在JAVA中的运转原理，JDK同时也有对其异常捕捉、上下文处理等方面都有很多细微且重要的处理。

## 结语

可以想象，在Spring还未进行环境大一统时期，很多项目都会通过JDK原生的SPI机制进行接口实现类的管理。

这种方式基于配置文件，也不繁琐，但是功能其实非常局限：

- 不灵活，只能通过迭代方法获取实例
2. 失去了AOP以及IOC机制应用
3. 无法与其他框架集合，因为被JDK的条条框框限制。
3. ...

于是为了解决这些缺点，开发者们便着手以JDK-SPI的机制思路为基础去打造了各种各样的新SPI机制，这里我觉得最有代表的就是[Dubbo-SPI](https://leyunone.com/frame/dubbo/dubbo-read.html)

