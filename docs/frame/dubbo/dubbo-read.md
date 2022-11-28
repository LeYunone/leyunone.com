---
date: 2022-05-03 16:01:54
title: Dubbo源码阅读-可扩展机制
category: 
  - Dubbo
tag:
  - Dubbo
head:
  - - meta
    - name: keywords
      content: Dubbo,源码阅读
  - - meta
    - name: description
      content: Dubbo在高性能的同时，依靠其特殊的SPI、自适应、包装、激活机制，提供了可扩展的机制。...
---

# Dubbo源码阅读-可扩展机制

>  Dubbo在高性能的同时，依靠其特殊的SPI、自适应、包装、激活机制，提供了可扩展的机制。

## SPI

**SPI**面向接口编程，依靠在配置文件中指定的接口实现类，直接创建出对应接口实例。

### JDK SPI

JDK的SPI依靠**ServiceLoader**

首先根据ServiceLoader的源码可以看到一个关键字

![](https://www.leyuna.xyz/image/2022-05-03/jdkSPI.png)

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

   ![](https://www.leyuna.xyz/image/2022-05-03/spi2.png)

3. 在该文件夹中，添加 **RedCar**、 **YellowCar**的全类名。

   ![](https://www.leyuna.xyz/image/2022-05-03/spi3.png)

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



JDK的SPI用法即原理大概和上面描述一致，但是忽略了其中很多异常、上下文等等的细节。

但是在Dubbo中，JDK的SPI的缺点完全无法满足其扩展性，其缺点：

1. 不灵活，只能通过迭代方法获取实例
2. 失去了AOP以及IOC机制应用
3. 无法与其他框架集合，因为被JDK的条条框框限制。
4. ....

那么Dubbo就自己实现了其自由的SPI

### Dubbo SPI

在原理上，和JDK的一致。但是为了改善原生的种种特点就有了以下几种特性。

#### 指定实例

在**META-INF/services**的配置文件中：

```properties
red = xyz.leyuna.laboratory.core.spi.RedCar
yellow = xyz.leyuna.laboratory.core.spi.YellowCar
```

key-value的形式配置实例类。

然后在使用中，通过**ExtensionLoader**提供方法指定需要的实例

```
        ExtensionLoader<CarInterface> extensionLoader =   ExtensionLoader.getExtensionLoader(CarInterface.class);
        CarInterface red = extensionLoader.getExtension("red");
        red.didi();
```

在 **getExtension**方法中，如果当入参为 “true”时，会直接返回根据接口上 @SPI设置的默认值的实例

```
@SPI(value = "red")
public interface CarInterface 
```

   如果有自定义入参，则通过入参值获取实例：

1. 在本地缓存中查询有无该入参对应实例
2. 在 **loadExtensionClasses**方法中 根据 ***DUBBO_INTERNAL_DIRECTORY、DUBBO_DIRECTORY，和SERVICES_DIRECTORY***  ... /META-INF/services 、/META-INF/dubbo 、 ....等等函数，读取配置文件中的key-value对值，并且将其存储在本地Map中；由于使用Map存储，但有多个文件路径，所以存在优先级问题，/META-INF/services为最高优先级，其中的值不会被覆盖。
3. **loadDirectory** 方法 是在步骤二中完成的，原理和JDK的类型，通过路径+接口全类名的形式，读取配置文件的同时，返回其实例
4. 在上述步骤中，会将读取到的所有实例、与实例名，通过key-value的形式本地缓存，extensionLoader.getExtension("red");直接在map中取出。



#### AOP

Dubbo的AOP机制，通过读取配置文件时，如果读取到了装饰接口方法的装饰类时，则会走到AOP的思路。

1. 装饰类定义

   ```
   public class CarAOP implements CarInterface{
   
       private CarInterface carInterface;
   
       public CarAOP(CarInterface carInterface){
           this.carInterface = carInterface;
       }
   
       @Override
       public void didi(URL url) {
           System.out.println("aop加强");
           carInterface.didi(url);
           System.out.println("aop加强完成");
       }
   }
   ```

   实现接口、并且在定义接口属性的同时，一定要实现一个接口入参为**第一个**的构造函数。

2. 添加配置文件属性

   ```properties
   red = xyz.leyuna.laboratory.core.spi.RedCar
   yellow = xyz.leyuna.laboratory.core.spi.YellowCar
   xyz.leyuna.laboratory.core.spi.CarAOP
   ```

这样在通过        CarInterface red = extensionLoader.getExtension("red"); 得到的实例，则会被自动加强，那么原理如何呢？

1. 读取配置文件，读取到包装类时，判断该类是否为装饰类；判断原理，通过是否实现接口以及构造方法的第一个入参是否为接口类型。
2. 如果是装饰类，则将其缓存到包装类缓存中。
3. 如果包装类缓存不为空，则说明有对象需要被AOP加强，进入到AOP逻辑中
4. 解析包装类@Wrapper注解
5. 通过 instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance)); 循环包装，实例化出装饰类，并且将当前实例入参，覆盖掉原先的实例对象。
6. 加入到本地缓存，返回实例。

以上的所有步骤都是在 **createExtension()**方法中完成，需要注意的是 createExtension方法除了name入参key外，还有一个布尔类型wrap值用来控制是否需要包装当前实例。

需要不需要返回AOP加强的实例，只需要

```
extensionLoader.getExtension("red",false);
```

#### IOC

Dubbo的IOC注入，依靠的是Set方法注入。由于没有Spring的IOC容器，所以判断是否存在依赖注入，为判断读取配置文件时，当前类中有无@Adaptive修饰类的set方法。

所以在源码中，通过 **injectExtension**方法操作：

1. 当前类是否有Set相关方法，如果没有则说明不涉及IOC
2. 如果当前类被@DisableInject注释说明，说明不需要过度解析，不涉及IOC
3. 找到当前类的set方法中第一参数为对象的方法，解析这个方法名，如果方法名为setCarInterface，则返回set后面CarInterface字符串。
4. 获得这个字符串以及class组合的**CarInterface$Adaptive** Dubbo自定义对象。
5. 调用方法，赋值完成IOC注入， CarInterface$Adaptive 则是通过 **this.objectFactory.getExtension** 解析出来的方法入参。



不难发现，IOC的注入方式在Spring中多用于依赖注入，而Dubbo则规范与Set注入形式。并且通过AdaptiveExtensionFactory和ExtensionFatocry 工厂，在注入的同时还可以兼容Spring容器使用。

**@Adaptive**

**自适应扩展点**，在前文有提到过这个注释。

在IOC注入的时候，由于多扩展的场景，所以Dubbo提供注释，可以根据Dubbo中的URL对象中的parameters属性。

key-value的形式指定被该注释修饰的方法或类的实例，具体用户如下：

**接口**：

```
public interface CarInterface {

    @Adaptive("carType")
    void didi(URL url);
}
```

**注入接口的实例类：**

```
public class My implements PersonInterface{

    private CarInterface carInterface;

    public void setCarInterface(CarInterface carInterface){
        this.carInterface = carInterface;
    }

    @Override
    public void driveCar(URL url) {
        System.out.println("警告，我开车来了");
        carInterface.didi(url);
    }
}
```

**测试方法**:

```
        ExtensionLoader<PersonInterface> extensionLoader = ExtensionLoader.getExtensionLoader(PersonInterface.class);
        PersonInterface my = extensionLoader.getExtension("my");
        Map<String,String> map = new HashMap<>();
        map.put("carType","yellow");
        URL url = new URL("","",0,map);
        my.driveCar(url);
```
