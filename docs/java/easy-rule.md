---
date: 2024-04-08
title: 规则引擎-Easy rule
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: JAVA、规则引擎-Easy rule
  - - meta
    - name: description
      content: 规则引擎-Easy rule
---
# 规则引擎-Easy rule

最近有几个项目中都出现了根据XX条件执行XX方法的业务，在动手之前脑中总会下意识的发现如果按照常规的去写代码，无论使用何种设计模式，都会出现不同程度上的代码冗余或大量if-else判断。

甚至说判断XX条件的代码和执行XX方法的代码，非常容易出现上下级调用的关系；

在多的这些功能熟练之后，规则引擎可以完美的适配这种 `根据XX条件执行XX方法` 的业务；

## 什么是规则引擎

如其名，定义规则的执行引擎，是一套解决业务代码与执行其业务规则分离的解决方案或组件；

举个例子：有一个功能为，当用户输入A时，将用户的信息更新为B

如果按照常规代码来说，伪代码为：

```json
public void update(String mess) {
    if(mess.equlas("A")){
    	//更新
	}
}
```

如果使用规则引擎则变成：

```java
public void rule(String mess){
        Rules rules = new Rules();
        rules.register(new RuleBuilder()
                .when((facts -> facts.get("mess").equals("A")))
                .then(facts -> {
                    System.out.println("更新B");
                })
                .build());
        RulesEngine rulesEngine = new DefaultRulesEngine();
        Facts facts = new Facts();
        facts.put("mess","A");
        rulesEngine.fire(rules,facts);
}
```

可以直观的感受到，怎么使用了规则引擎之后代码变多了而且变复杂了？

且慢，让我们认真缕一缕；

现在我们需要添加一个新逻辑，当用户输入B时，将信息更新为C；

在常规中，有两种选择：

1. 继续往后叠If-else或者使用switch
2. 使用策略模式，将输入的内容作为策略key；

在规则引擎中，有两种选择：

1. 继续在.when()和.then()中堆叠
2. 将.when()和.then()的实际动作抽离成策略方法，各做各的事。

或许还不够直观看出改变，那么我再添加一个前提，如果是 当用户输入??????，其中n个条件，只需要满足其中之一，那么就执行更新动作；

在常规中，是不是只有两种办法：

1. 数据库配置
2. 写死一个map，进行判断

再规则引擎中，我只需要将从.when()中抽离出来的校验解析式进行通过配置即可，比方说使用Sql语句作为`.when()`方法中的结果；

规则为：`SELECT * FROM xxx WHERE mess IN ('A','B','C','D','E')`

构建的`facts.put("mess",mess); `  就可以在不动任何代码的前提下仅通过已经抽离的.when()中的表达式 **规则** 完成新规则-执行逻辑的拓展；

其结构组成为：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-08/3d573722-62e9-4507-80ec-cdb570b49ae9.png)

## Easy-rule

在JAVA几大主流的规则引擎：

| 规则引擎   | 优势                                                         | 缺点                                                         |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Drools     | Drools 支持复杂的规则和事件处理，具有强大的表达能力。 <br />它提供了一个易于使用的 DSL (领域特定语言) 来表示规则，使得非技术人员也能够理解和维护规则。 | 学习曲线较陡，对于新手来说可能需要一定的时间来学习和掌握。<br /> 在处理大规模数据时性能可能不如其他规则引擎。 |
| JBossRules | JBoss Rules 是 Drools 的早期版本，提供了类似的规则引擎功能。 | 由于是 Drools 的早期版本，可能缺少一些新功能和改进。         |
| Easy Rules | Easy Rules 是一个轻量级的 Java 规则引擎，适用于简单的规则场景。<br />易于学习和使用，适合快速集成到项目中。 | 不适用于复杂规则场景，功能相对有限。                         |
| Camel K    | Camel K 是 Apache Camel 的 Kubernetes 版本，可以与 Kubernetes 环境集成。<br />具有强大的路由和转换功能，适用于复杂的集成场景。 | 相对于专门的规则引擎，可能在规则管理和表达能力上略显不足。   |

EasyRule适用于目前遇到的绝大多数的项目，且即使需要复杂的规则场景，也可以通过其余的表达式组件去构建自定义的规则表达式，比如前文案例中提到的Sql表达式；

简单的概括一下适用教程：

**引入**

```xml
<dependency>
    <groupId>org.jeasy</groupId>
    <artifactId>easy-rules-core</artifactId>
    <version>4.1.0</version>
</dependency>
```

**使用**

[https://github.com/j-easy/easy-rules](https://github.com/j-easy/easy-rules)

这里不介绍使用注释的方式，推荐链式编程，代码更加直观清晰：

```java
public void runle(){
Rules rules = new Rules();
rules.register(new RuleBuilder()
        .when((facts -> return true;)
        .then(facts -> {
            System.out.println("hellow");
        })
        .build());
RulesEngine rulesEngine = new DefaultRulesEngine();
Facts facts = new Facts();
rulesEngine.fire(rules,facts);
}
```

也可以使用文件的方式定义规则

```yaml
name: "weather rule"
description: "if it rains then take an umbrella"
condition: "rain == true"
actions:
  - "System.out.println(\"It rains, take an umbrella!\");"
```

```java
MVELRuleFactory ruleFactory = new MVELRuleFactory(new YamlRuleDefinitionReader());
Rule weatherRule = ruleFactory.createRule(new FileReader("weather-rule.yml"));
```

`Facts` 中则是放入在.when()判断时需要用到的需要，通过put,get方法key-value的形式存储；

### 增强

对于简单的规则业务来说，往往都是 X=X，则执行？的判断；因此简单的可以直接通过yaml文件配置死；

但是在需要稍微复杂判断的业务中，则需要开发者自行增强；

比方说我现在有多个规则，有两种情况一是需要当这些规则都成立的时候才执行更新，二是只要其中一个规则成立就执行：

我们可以自定义一个规则执行类：

```java
public class AllEstablishRule {

    private List<Rule> rules;

    private Runnable runnable;

    public AllEstablishRule(List<Rule> rules, Runnable runnable) {
        this.rules = rules;
        this.runnable = runnable;
    }

    public boolean evaluate(Facts facts) {
        boolean ok = false;
        for (Rule rule : rules) {
            ok = rule.evaluate(facts);
            if (!ok) break;
        }
        return ok;
    }

    public void execute(Facts facts) {
        if (evaluate(facts)) {
            runnable.run();
        }
    }
}
```

使用为：

```java

        AllEstablishRule allEstablishRule = new AllEstablishRule(CollectionUtil.newArrayList(new RuleBuilder()
                .when((facts -> facts.get("mess").equals("A")))
                .build(),new RuleBuilder()
                .when((facts -> facts.get("mess").equals("B")))
                .build()),()->{
            System.out.println("更新");
        });
        Facts facts = new Facts();
        facts.put("mess","A");
        allEstablishRule.execute(facts);
```



再比如，当需要复杂判断时，我们可以对.when()的判断动作作手脚；

比方说上述提到的SQL表达式，就可以通过使用 `com.alibaba.druid.sql` 包下的类解析SQL，使一个查询语句中的条件

`where name = '小红' AND age = 14 OR sex = '男'`

这些拼接成一个代码逻辑中的 &|判断以及 = ，in 的判断。

## 总结

因为在使用Easy-rule的体验中还没遇到解决不了的问题，所以还没涉及过其余的规则引擎，相信未来终有机会接触到他们；

Easy-rule再git社区上的活跃为3年前，并且其余的规则引擎的社区活跃度也远没有我们常用的框架、工具的多，可以看出规则引擎在设计中以及是一种非常成熟的解决方案了。

