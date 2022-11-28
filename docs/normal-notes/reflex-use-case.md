---
date: 2022-03-13 15:23:58
title: 反射应用场景
category: 
  - 笔记
tag:
  - note
---
# 反射应用场景
>本文不讲解反射的基本使用，仅记录反射的特殊使用场景

## 关于泛型
反射和泛型不能说是毫无关联，只能说在日常中一定沾不上边。
### 场景一
编写持久层，数据操作底层基类时，会出现几种情况：
1. 关联表不确定
2. 出参类不确定
3. mapper文件不确定

所以作为基类需要连带泛型写进继承中。例：

```
public abstract class
 BaseRepository<M extends BaseMapper<DO>, DO,CO> 
extends ServiceImpl<M, DO> implements BaseGateway<CO> {
```
其中BaseGateway是自定义的基类接口。
那么就有了如下的特殊使用场景：
在持久层操作下，业务往往需要的是返回封装好的DO->CO的出参，所以基类中的所有需要通过**克隆**的方法返回表相关出参出去。
由于市面上所有的克隆方法都是基于：copy(数据，克隆.class)实现。
所以就需要积累中指定的泛型CO的class。
既就有了一下操作：
```
    public BaseRepository() {
        Class<?> c = getClass();
        Type t = c.getGenericSuperclass();
        if (t instanceof ParameterizedType) {
            Type[] params = ((ParameterizedType) t).getActualTypeArguments();
            DOclass = (Class<?>)params[1];
            COclass = (Class<?>)params[2];
        }
    }
```
通过反射类**ParameterizedType**，参数化类型拿到任何<XX>中泛型类型![QQ图片20220302210528.gif](https://www.leyuna.xyz/image/2022-03-13/QQ图片20220302210528.gif)

## 关于类型
类型取自class，所以在仅知道class的条件下，类型转换上有很多很多的应用方式。
### 场景一
在仅有class类时，需要确定该class的类型时。
1. 第一种办法，直接通过**class.getName**，拿到其类的全类名。但是这只是字符串层面的表象确定，仅限于知道这个class是那个类，但无法对其进行额外的实例、赋予等操作。
2. 分类讨论：
**首先是第一**，确定该class是否是基本数据类型，**class.isPrimitive()**。
**其次第二**，判断该class是否是抽象属性：
```
Class.isInterface() || Modifier.isAbstract(Class.getModifiers())
```
其中，**Modifier**是反射基础中的**修饰符工具类**，用于判断和获取某个类、变量或方法的修饰符。
**第三**，搭配业务场景，依次判断class所属类的顶级接口[父类]，例如当业务需求，这个class应该是一个接口时，可以通过
```
Collection.class.isAssignableFrom(class)
```
判断两类是否是 子父级关系。
**最后**，就是java中各包装类，Intege，Long等等的基本判断了。
### 场景二
当仅有一个类的类名时，需要确定该类的类型，反向操作最为致命![QQ图片20220302210531.jpg](https://www.leyuna.xyz/image/2022-03-13/QQ图片20220302210531.jpg)。
1. 最简单的一种，通过**class.forName(className)**，拿到该类的class，然后如场景一中判断。
2. 在只知一个类的类名，甚至说这个类极有可能不是全类名的场景中时。我们是无法通过**class.forName(className)**，去获取类的class的。所以在代码的层面中，没有办法去确定它[类名]的属性的。
那么就需要把眼见拉大，跳出代码层面，到file文件中去探讨。
所以就有了如下的操作：
```
   //通过loader加载所有类
    public static List<Class> loadClassByLoader(ClassLoader load){
        Enumeration<URL> urls = null;
        try {
            urls = load.getResources("");
        } catch (IOException e) {
//            log(e.getMessage());
        }
        //放所有类型
        List<Class> classes = new ArrayList<>();
        while (urls.hasMoreElements()) {
            URL url = urls.nextElement();
            //文件类型
            if (url.getProtocol().equals("file")) {
                loadClassByPath(null, url.getPath(), classes, load);
            }
        }
        return classes;
    }

    private static void loadClassByPath(String root, String path, List<Class> list, ClassLoader load) {
        File f = new File(path);
        if(root==null) {
            root = f.getPath();
        }
        //判断是否是class文件
        if (f.isFile() && f.getName().matches("^.*\\.class$")) {
            try {
                String classPath = f.getPath();
                //截取出className 
                String className = classPath.substring(root.length()+1,classPath.length()-6).replace('/','.').replace('\\','.');
                list.add(load.loadClass(className));
            } catch (Exception ex) {
            }
        } else {
            File[] fs = f.listFiles();
            if (fs == null){
                return;
            }
            for (File file : fs) {
                loadClassByPath(root,file.getPath(), list, load);
            }
        }
    }
```
大义就是，通过启动类加载器的原理，获取到项目的根路径，然后以根路径进行文件迭代。取出所有.class的文件，然后这个类就是类的class字节码。接下来的操作就非常明确清晰了。
## 关于方法
在反射应用中，方法以及属性显得尤为核心。
### 场景一：
调用方法：
在反射调用方法的流程中：**class.forName()** 拿到class -> **getMethod** 拿到方法 -> invoke() 调用。
基础流程是这样走没错，但是很多节点中需要诸多条件。
比如**获取方法**时：
需要明确方法的参数列表 **Class<?>[]**。

在**调用方法**时：
需要明确方法的入参,Object<?>[]。

除此之外，在method.invoke(O1,O2) 。需要明确指名，O1的实例。
所以就引出了一个很严肃的问题。
调用方法的实例，我们真的能明确出来吗。
在透明的场景下时，很简单，甚至在知道了class文件后，可以直接new出来。
但是在框架工具的开发中，反射场景往往是模糊的。
即，我们不知道调用这个方法的实例属于什么，来自哪里。
它会是接口、抽象类、枚举、普通类...
所以在这个场景一，需要针对业务进行针对性的判断处理。
1. 在Spring环境下，调用方法中的参数若涉及到自动注入，则一定、只能从容器中取实例对象。
2. 在class为抽象属性时，需要通过文件迭代，或者从顶级接口出发，实例出他的可用对象。
3. 在没有无参构造的场景下，无法通过newInstance实例对象，所以可以通过获取他的所有构造方法，然后随机赋值拟造一个最简单的对象出来，但是在复杂场景下很不稳定。
4. ...

## 关于特殊

