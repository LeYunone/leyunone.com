---
date: 2022-09-06
title: 函数式编程的优雅场景
category: 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: Java,函数式接口,去耦
  - - meta
    - name: description
      content: JAVA函数式接口使用场景
---
# 场景：

​	**完成一个冒泡排序，该排序需兼容对所有类型【Object、String、Integer、Double....】的数组排序。**





```java
    public void BubbleSort() {
        for (int i = 0; i < arr.length; i++) {
            boolean is = true;
            for (int j = 0; j < arr.length - 1 - i; j++) {
                if (arr[j + 1] < arr[j]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    is = false;
                }
            }
            if (is) {
                break;
            }
        }
    }
```

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-12-05/1.png)



作为一个支持任何类型比较、排序的函数；可以看到，冒泡排序的核心在于这里的比较。

当排序类型为整形时：

```java
arr[j+1]<arr[j] 
```

当排序类型为字符串时：

```java
arr[j+1].compareTo(array[j]) < 0
```

当排序类型为Object时：

```java
??????
```

所以定义一个支持任何类型的排序，我们只需要别人告诉我A应该怎么排到B前面。

那么：

1. 规则由调用者定义
2. 排序数组类型由调用者决定

能完成以上两点的思路，在JAVA中有一个决定性的单词 **Interface**

**Interface**：

- 定义规则
- 实现规则实例
- 使用规则

所以我们可以创建一个接口：

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-12-05/2.png)


将这个接口作为入参给到排序函数：

```java
public static <T> void mainTest(T[] arr, CompareFunction<T> compareFunction) {
    for (int i = 0; i < arr.length; i++) {
        boolean is = true;
        for (int j = 0; j < arr.length - 1 - i; j++) {
            if (compareFunction.compare(arr[j + 1], arr[j])) {
                T temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                is = false;
            }
        }
        if (is) {
            break;
        }
    }
}
```



# 函数式接口编程

## Lambda表达式与函数式接口

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-12-05/3.png)


**Java中：**Lambda表达式称为闭包，是JDK8引入的配合函数式接口使用的新特性，两者是不可切割的。

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-12-05/4.png)


**函数接口为lambda表达式和方法引用提供目标类型。**



![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-12-05/5.png)


[https://docs.oracle.com/javase/8/docs/api/java/lang/FunctionalInterface.html](https://docs.oracle.com/javase/8/docs/api/java/lang/FunctionalInterface.html)

![img](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-12-05/6.png)


**函数式接口**：有且仅只有一个方法且被@FuctionInterface修饰编译通过的接口

**使用**：可以通过Lambda表达式、构造函数或方法引用构建

实现手法：

```java
    public static <T> void mainTest(T[] arr, CompareFunction<T> compareFunction) {
        for (int i = 0; i < arr.length; i++) {
            boolean is = true;
            for (int j = 0; j < arr.length - 1 - i; j++) {
                if (compareFunction.compare(arr[j + 1], arr[j])) {
                    T temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    is = false;
                }
            }
            if (is) {
                break;
            }
        }
    }
```

```java
    public static void main(String[] args) {

        Person[] ps = {new Person(1),new Person(4),new Person(3),new Person(2)};
        //lambda表达式
        mainTest(ps,(t1,t2) -> t1.getAge() < t2.getAge());
        //构造函数
        mainTest(ps,new CompareFunction<Person>(){
            @Override
            public boolean compare(Person t1, Person t2) {
                return t1.getAge() < t2.getAge();
            }
        });
        //方法引用
        mainTest(ps,CompareFunction::compare2);
        for(Person p : ps) System.out.println(p.getAge());
    }
```

```java
public interface CompareFunction<T> {

    boolean compare(T t1,T t2);

    static boolean compare2(Person t1,Person t2){
        return t1.getAge()>t2.getAge();
    }

}
```

**存在的价值**：

1.  JAVA支持属性传递、对象传递【值传递，“引用传递”】，缺少方法传递 ； 面向对象编程 》 面向过程编程
2.  从思维上打破代码抽取的粒度，做到哪怕只有相同的代码片段也可抽取。
3.  ......



## 举例

### 校验函数

```java
@FunctionalInterface
public interface CheckFunction<T> {
    boolean check(T t);
}
```

```java
public static void mainTest2(String name, CheckFunction checkFunction) {
    if (checkFunction != null && checkFunction.check(name)) {
        System.out.println("校验成功success");
    } else {
        System.out.println("校验失败fail");
    }
}
```

```java
public static void main(String[] args) {
    //校验函数
    mainTest2("test",str -> str.equals("tes2t"));
}
```

### 模板函数

```java
@FeignClient("XXX")
public interface RpcTest {

    void rpcTest();
    
    String rpcTest2();
}

```

```java
public static void mainTest3(String name, Runnable methodFunction) {
    System.out.println("增强方法:"+name);
    methodFunction.run();
    System.out.println("增强方法成功");
}

public static void mainTest3(String name, Callable methodFunction) throws Exception {
    System.out.println("增强方法:"+name);
    Object call = methodFunction.call();
    System.out.println("返回:"+call);
    System.out.println("增强方法成功");
}
```

```java
@Autowired
private static RpcTest rpcTest;

public static void main(String[] args) throws Exception {
    mainTest3("test3-1",()->rpcTest.rpcTest());
    mainTest3("test3-2",()->rpcTest.rpcTest2());
}
```

### 规则函数

```java
@FunctionalInterface
public interface UniqueFunction<T,R> {
    R getRule(T t);
}
```

```java
public static <T, R>void mainTest4(List<T> ls, UniqueFunction<T, R> uniqueFunction) {
    Map map = new LinkedHashMap<>();
    for (T t : ls) {
        R rule = uniqueFunction.getRule(t);
        if (!map.containsKey(rule)) {
            map.put(rule, t);
        }
    }
    ls = new ArrayList<>(map.values());
}
```

```java
    public static void main(String[] args) throws Exception {
        List<Person> persons = getPerson();
        mainTest4(persons,person ->
             person.getId()+person.getAge()
        );
    }
```

## 实际项目中应用

### 唯一规则函数Rule

[集合去重方案Function<T,R>](https://www.leyunone.com/Interesting-design/unique-set.html)

### Dao层配合MP灵活应用

```java
@Override
public <R,Z> List<R> selectByConOrder(Object o, Class<R> clazz, int type, SFunction<DO, Z>... tables) {
    //自定义字段进行排序查询
    LambdaQueryWrapper<DO> lambdaQueryWrapper = new LambdaQueryWrapper<>();
    if(type==0){
        for(SFunction<DO,Z> table : tables){
            lambdaQueryWrapper.orderByDesc(table);
        }
    }else{
        for(SFunction<DO,Z> table : tables){
            lambdaQueryWrapper.orderByAsc(table);
        }
    }
    return this.selectByCon(o, clazz, lambdaQueryWrapper);
}
```

### 校验入参空值

### 工具

# 场景：

```java
public String doService(String order) {
    if ("type1".equals(order)) {
        return "执行业务逻辑1 - service1.test()";
    } else if ("type2".equals(order)) {
         return "执行业务逻辑2 - service2.test()";
    }else if ("type3".equals(order)) {
         return "执行业务逻辑3 - service3.test()";
    }else if ("type4".equals(order)) {
         return "执行业务逻辑4 - service4.test()";
    }
    return "不在处理的逻辑中返回业务错误";
}
```

由于业务的堆积，IF - Else 代码块越来越多，篇幅愈发拉长，不利于维护的同时还违背了开闭原则

























## 解决方法：

### 策略模式

**诸葛亮的锦囊妙计，每一个锦囊就是一个策略。**

```java
public interface BaseService {
    String test();
}
```

```java
@Service("service1")
public class Service1 implements BaseService{
    @Override
    public String test(){
        return "test1";
    }
}
@Service("service2")
public class Service2 implements BaseService {
    @Override
    public String test(){
        return "test1";
    }
}
......
```

```java
public enum ServiceEnum {
    SERVICE1(1, "业务描述", "service1"),
    SERVICE2(2, "业务描述", "service2"),
    SERVICE3(3, "业务描述", "service3"),
    SERVICE4(4, "业务描述", "service4");

    public static ServiceEnum valueOf(Integer type) {
        if (type == null) {
            return null;
        }
        for (ServiceEnum serviceEnum : ServiceEnum.values()) {
            if (type.equals(serviceEnum.getType())) {
                return serviceEnum;
            }
        }
        return null;
    }
    ............
}
```

```java
public static void main(String[] args) {
    ServiceEnum serviceEnum = ServiceEnum.valueOf(1);
    if(serviceEnum == null){
        //没有在枚举中匹配到处理器，说明业务参数不合法或者没有添加对应的业务枚举
        return;
    }
    BaseService bean = SpringUtil.getBean(serviceEnum.getProcessor(), BaseService.class);
    if(bean == null){
        return;
    }
    //交给对应到处理器去处理
    String test = bean.test();
    System.out.println(test);
}
```

缺：策略类+++++





### 函数式

```java
@Service("service1")
public class Service1 {
    public String test(String name){
        return name;
    }
}
@Service("service2")
public class Service2 {
    public String test(String name){
        return name;
    }
}
.......
```



```java
    private Map<String, Function<String, String>> map = new HashMap<>();
    @Autowired
    private Service1 service1;
    @Autowired
    private Service1 service2;
    @Autowired
    private Service1 service3;
    @Autowired
    private Service1 service4;

    {
        map.put("1", name -> service1.test(name));
        map.put("2", name -> service2.test(name));
        map.put("3", name -> service3.test(name));
        map.put("4", name -> service4.test(name));
    }

    public static void main(String[] args) {
        //从逻辑分派Dispatcher中获得业务逻辑代码，result变量是一段lambda表达式
        FunctionNoIf functionNoIf = new FunctionNoIf();
        Function<String, String> function = functionNoIf.map.get(1);
        String name = "入参";
        String result = "";
        if (function != null) {
            //执行这段表达式获得String类型的结果
            result = function.apply("name");
        }
    }
```

