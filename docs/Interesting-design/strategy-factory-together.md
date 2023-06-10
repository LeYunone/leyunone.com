---
date: 2023-06-10
title: 策略模式下的架构设计
category: 
  - 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: JAVA,设计模式,策略模式,抽象工厂,乐云一
  - - meta
    - name: description
      content: 本次，将带来一种策略模式+ 抽象工厂 的架构设计原则。
---

# 策略模式下的架构设计

​	最近有看某大厂的架构设计，发现对于设计转发类的服务中心，比如推送中心/数据中转平台/基础中台等等。这些中间商的基础服务平台，往往由于需要对接不同的业务方，碰到不好兼容，逻辑繁琐，被迫定制化处理等。

​	所以在这些服务架构搭建之初，会通过一些设计，设置服务模板和业务方逻辑填充锚点，将各业务方的逻辑隔离开。比如通过租户id/模板模式/建造者模式等等，由服务方定义服务，业务方填充所需完成。

​	不过仅是这些还不能达到一套服务，玩 "万"个应用，本次，将带来一种 **策略模式** + **抽象工厂** 的架构设计原则。

##  策略模式

为了方便后续，就先非常简单的过一下 `什么是策略模式?`

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-06-10/48359e6f-091b-400a-9a87-70bb34bd91f1.png)

上图为 [菜鸟教程](https://www.runoob.com/design-pattern/strategy-pattern.html) 中对于策略模式的定义，在我看来可以简单的解释为：

- 抽象策略角色：**抽象的定义了执行方法，以及注册策略到用户仓库的抽象类**
- 具体策略角色：**实现了抽象执行方法的具体类**
- 环境角色：**存储策略及具体实现类的用户仓库**

在白话点，就是将诸葛亮的锦囊，通过字典的方式放到对应的目录索引下。

`具体实现大伙可看菜鸟中的代码，本篇就不在赘述`



通过策略模式，在架构设计中，我们可以轻松的做到：

- 业务方可自定义逻辑
- 类引用外置处理，代码耦合性极低
- 服务方控制头部核心逻辑
- 定制/扩展 非常灵活
- ...

下面将结合SpringBoot，打一个该模式下架构设计样板，以一个规则引擎执行的服务应用设计为例：

### 策略外壳

**自定义注解**

```java
@Component
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
@Documented
public @interface RuleHandler {
    @AliasFor("identif")
    String[] value() default {""};

    @AliasFor("value")
    String[] identifs() default {""};
}
```

### 抽象策略角色

**策略抽象类**

```java
public abstract class AbstractRule implements InitializingBean {
    @Autowired
    private TransformRuleHandlerFactory factory;
    
    private List<String> setRuleIdentif() {
        RuleHandler annotation = AnnotationUtils.getAnnotation(this.getClass(), RuleHandler.class);
        assert annotation != null;
        return Arrays.asList(annotation.identifs());
    }
	//T 为泛型
    public abstract void handler(T t);
    
    public void runHandler(T t){
        //策略执行前的服务方逻辑
        this.handler(t);
    }
    
    @Override
    public void afterPropertiesSet() {
        //注册规则
        this.setRuleIdentif().forEach((t) -> {
            factory.register(t, this);
        });
    }
}

```

### 具体策略角色

以下为一个sql语句类型转化规则

```java
@RuleHandler("type_transform")
public class SqlDataTypeRule extends AbstractRule {
    @Override
    public void handler(T t) {
        //实现内容
    }
}

```

### 环境角色 策略仓库

```java
@Component
public class TransformRuleHandlerFactory {

    private final ConcurrentHashMap<String, AbstractRule> handlers = new ConcurrentHashMap<>(16);

    @Override
    public void register(String identif, AbstractRule handler) {
        handlers.put(identif, handler);
    }

    @Override
    public AbstractRule getHandler(String identif) {
        return handlers.get(identif);
    }
}

```

以上，就非常简单的但又很巧妙的设计出了一个可支持，由用户自定义填充逻辑【继承抽象策略角色，实现执行方法】的策略模式下的架构。

可以看出，由于 **SpringBoot** 的 `InitializingBean` 的特性，我们只需要实现自定义的注解 `@RuleHandler` 就可以帮我们完成对策略类的管理。而拿到对应策略类的方式，因仓库的设定，就可以千奇百怪了。

## 缺点

虽然上述样板的设计，可以兼容大部分单一类策略服务。

但是，由于抽象策略角色的限制： **固定抽象执行方法入参** ，具体策略类无法在执行方法入口更好的扩展自己。

一旦服务方设计到了多种策略，即一种策略仓库无法满足执行方法。

所以我们还可以引入另一种设计模式，将其缺点完美填补

## 策略模式+抽象工厂

对症下药，在不动当前设计的前提下，进行扩展。

我们可以使用抽象工厂，将整个策略仓库抽象化，即新增：

**抽象工厂：**

```java
public abstract class AbstractRuleFactory {

    public abstract void register(String identif, AbstractRule handler);

    public abstract AbstractRule getHandler(String identif);
}
```

**具体工厂：**

```java
public class TransformRuleHandlerFactory extends AbstractRuleFactory{

    private final ConcurrentHashMap<String, AbstractRule> handlers = new ConcurrentHashMap<>(16);
	//...	省略...
}

```

那么我们就可以由具体策略实现者去管控他的策略仓库逻辑，

**抽象策略者：**

```java
public abstract class AbstractRule implements InitializingBean {

	//...	省略...

    public abstract AbstractRuleFactory registRuleFactory();

	//...	省略...
    
    @Override
    public void afterPropertiesSet() {
        AbstractRuleFactory abstractRuleFactory = registRuleFactory();
        if(ObjectUtil.isNull(abstractRuleFactory)) return;
        //没有注册工厂 退回规则
        this.setRuleIdentif().forEach((t) -> {
            abstractRuleFactory.register(t, this);
        });
    }
}
```

**具体策略：**

```java
@RuleHandler("type_transform")
public class SqlDataTypeRule extends AbstractRule {

    @Autowired
    private TransformRuleHandlerFactory factory;
    
    @Override
    public AbstractRuleFactory registRuleFactory() {
        return factory;
    }
	//...	省略...
}
```

## 实例

因不方便放出看到的已经在应用的代码

所以目前我可自由放出的案例有 我的开源项目 [DbShop 数据库比对工具](https://github.com/LeYunone/dbshop/tree/master/src/main/java/com/leyunone/dbshop/rule)

其中有对Sql语句进行解析的规则策略。

希望本篇讲述的架构设计，对大家的开发能有效帮助

