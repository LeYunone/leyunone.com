---
date: 2025-04-16
title: SonarQube插件开发：给代码审查加一条自己的规则
category:
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: SonarQube,插件开发,代码审查,自定义规则,乐云一
  - - meta
    - name: description
      content: SonarQube内置的规则不够用？那就自己写插件。聊聊怎么开发一个SonarQube自定义规则插件。
---
# SonarQube插件开发：给代码审查加一条自己的规则

在[上一篇文章](sonarqube-scan.md)里，聊了SonarQube的基本使用和规则配置。当时提到过，SonarQube除了内置的规则，还支持两种方式自定义规则：

1. **模板自定义**：用正则表达式之类的简单模板创建规则
2. **插件开发**：写Java代码，开发自己的SonarQube插件

模板自定义虽然简单，但缺点也很明显——只能做正则匹配这种粗粒度的拦截，而且不能批量创建。

所以当团队需要更精细、更自定义的代码审查规则时（比如检测代码中是否包含敏感词、密码硬编码等），就得自己开发插件了。

这篇文章就聊聊怎么从零开发一个SonarQube的Java自定义规则插件。

## 前置条件

SonarQube插件运行环境是JDK，而且版本要求不低，至少JDK 17以上。

开发环境：

- JDK 17+
- Maven

本文以开发一个**Java自定义规则插件**为目标。

## 依赖引入

首先在`pom.xml`中引入SonarQube插件开发的必要依赖：

```xml
<properties>
    <sonar.plugin.api.version>10.7.0.2191</sonar.plugin.api.version>
    <sonarjava.version>8.0.1.36337</sonarjava.version>
</properties>

<!-- SonarQube插件API -->
<dependency>
    <groupId>org.sonarsource.api.plugin</groupId>
    <artifactId>sonar-plugin-api</artifactId>
    <version>${sonar.plugin.api.version}</version>
    <scope>provided</scope>
</dependency>

<!-- Java分析器 -->
<dependency>
    <groupId>org.sonarsource.java</groupId>
    <artifactId>sonar-java-plugin</artifactId>
    <type>sonar-plugin</type>
    <version>${sonarjava.version}</version>
    <scope>provided</scope>
</dependency>

<!-- 分析器公共库 -->
<dependency>
    <groupId>org.sonarsource.analyzer-commons</groupId>
    <artifactId>sonar-analyzer-commons</artifactId>
    <version>1.24.0.965</version>
</dependency>

<!-- 测试工具包 -->
<dependency>
    <groupId>org.sonarsource.java</groupId>
    <artifactId>java-checks-testkit</artifactId>
    <version>${sonarjava.version}</version>
    <scope>test</scope>
</dependency>
```

依赖不少，但别被吓到。真正需要你写代码的类就那么几个。

## 核心类

一个完整的SonarQube插件，必须包含以下几个核心类。我用通俗的方式解释一下每个类是干什么的：

### 1. Plugin入口类 —— "我是谁，我带了什么"

这个类告诉SonarQube："我叫什么名字，我注册了哪些规则。"

```java
public class SeninfoPlugin implements Plugin {

    @Override
    public void define(Context context) {
        List<Object> extensions = new ArrayList<>();

        // 1. 注册规则定义仓库
        extensions.add(KeywordRulesDefinition.class);
        // 2. 注册所有具体的规则实现类
        extensions.add(PasswordRule.class);
        // 3. 可选：配置项
        extensions.add(PropertyDefinition.builder("soninfo.keywords.path")
                .name("敏感词文件路径")
                .description("WordGroups.xml 文件路径")
                .defaultValue("/WordGroups.xml")
                .build());

        context.addExtensions(extensions);
        context.addExtension(JavaRulesList.class);
    }
}
```

就像一个团队的HR，负责把所有成员介绍给公司。

### 2. RulesDefinition —— "规则长什么样"

这个类定义规则的元数据：名字叫什么、描述是什么、严重级别多高、属于哪个仓库。

```java
public class KeywordRulesDefinition implements RulesDefinition {

    @Override
    public void define(Context context) {
        // 创建一个规则仓库，语言为Java
        NewRepository repo = context
            .createRepository("java-seninfo-keywords", "java")
            .setName("敏感词检测规则");

        // 注册每条规则
        registerRule(repo, PasswordRule.class);

        repo.done();
    }

    private void registerRule(NewRepository repo, Class<? extends JavaCheck> ruleClass) {
        org.sonar.check.Rule ruleAnnotation = ruleClass.getAnnotation(org.sonar.check.Rule.class);
        if (ruleAnnotation != null) {
            NewRule newRule = repo.createRule(ruleAnnotation.key())
                    .setName(ruleAnnotation.name() + "检测规则")
                    .setHtmlDescription("这一条的详情描述")
                    .setSeverity(Severity.CRITICAL)
                    .setTags("security", "keyword");
            newRule.setSeverity(ruleAnnotation.priority().name());
        }
    }
}
```

这里的`"java-seninfo-keywords"`就是规则仓库的ID，后续在SonarQube界面的代码规则页面能看到。

### 3. CheckRegistrar —— "把规则注册到扫描器"

这个类告诉SonarQube的Java扫描器："扫描代码的时候，请带上我的规则。"

```java
@SonarLintSide
public class JavaRulesList implements CheckRegistrar {

    @Override
    public void register(RegistrarContext registrarContext) {
        registrarContext.registerClassesForRepository(
                "java-seninfo-keywords",     // 要和RulesDefinition里的仓库ID一致
                PasswordRule.class,
                new ArrayList<>()
        );
    }
}
```

### 4. Rule实现类 —— "扫描时具体干什么"

这是最核心的类。扫描代码时，SonarQube会遍历Java源文件的AST（抽象语法树），你的规则就是在这个遍历过程中执行的。

```java
@Rule(key = "Password", name = "密码列表")
public class PasswordRule extends BaseTreeVisitor implements JavaFileScanner {

    @Override
    public void scanFile(JavaFileScannerContext context) {
        this.context = context;
        try {
            // 扫描整个AST树
            scan(context.getTree());
        } catch (Exception e) {
            LOGGER.info("自定义插件出问题:{}", e);
        }
    }

    /**
     * 遍历AST代码树，找到匹配符合密码列表的代码
     * 匹配成功，将错误上报给Sonar上下文
     */
    @Override
    public void scan(Tree tree) {
        // 你的检测逻辑
        // 比如正则匹配字符串字面量，检查是否包含敏感词
        // 发现问题后：
        // context.addIssue(lineNumber, this, "发现敏感词：xxx");
    }
}
```

说白了就是：**遍历代码的语法树，找到你觉得有问题的代码，然后报告上去。**

检测逻辑就看你自己的需求了。比如我做的敏感词检测，就是在AST中找到所有字符串字面量，然后用正则匹配敏感词列表。命中了就上报。

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/20260511162030.png)

## 打包配置

代码写完了，怎么打成SonarQube能认的插件包？

`pom.xml`里加上打包插件：

```xml
<plugin>
    <groupId>org.sonarsource.sonar-packaging-maven-plugin</groupId>
    <artifactId>sonar-packaging-maven-plugin</artifactId>
    <extensions>true</extensions>
    <configuration>
        <pluginKey>java-custom</pluginKey>
        <pluginName>Java Custom Rules</pluginName>
        <!-- 你的Plugin入口类 -->
        <pluginClass>com.example.sonarqube.plugins.SeninfoPlugin</pluginClass>
        <sonarLintSupported>true</sonarLintSupported>
        <skipDependenciesPackaging>true</skipDependenciesPackaging>
        <pluginApiMinVersion>9.14.0.375</pluginApiMinVersion>
        <requirePlugins>java:${sonarjava.version}</requirePlugins>
        <requiredForLanguages>java</requiredForLanguages>
    </configuration>
</plugin>
```

**注意一个坑**：`skipDependenciesPackaging`设置为true意味着打包出来的jar不会包含任何第三方依赖，插件运行时会使用SonarQube应用本身的依赖。

如果你的插件用到了额外的第三方库（比如XML解析），就需要加上`maven-shade-plugin`把依赖打进同一个jar里：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.2.4</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

这个坑我踩过——第一次打出来的插件，运行时报ClassNotFoundException，就是因为第三方依赖没打进去。

## 安装和验证

1. `mvn clean package` 打包
2. 把生成的jar上传到SonarQube安装目录的 `extensions/plugins/`
3. 重启SonarQube
4. 在界面的【配置】→【插件市场】里能看到已安装的自定义插件
5. 到【代码规则】页面，找到你在`RulesDefinition`里定义的规则仓库，里面的规则集应该都在了

## 总结

SonarQube插件开发的流程其实不复杂，就是四个类各司其职：

| 类 | 职责 |
|---|---|
| Plugin入口 | 注册插件和所有组件 |
| RulesDefinition | 定义规则的元数据 |
| CheckRegistrar | 把规则注册到扫描器 |
| Rule实现类 | 具体的检测逻辑 |

真正有技术含量的是第四个——Rule实现类。你需要理解Java的AST结构，知道怎么遍历语法树，怎么定位到你想检测的代码位置。

不过一旦掌握了这个套路，后续想加什么规则都只是在这个框架上填内容的事了。
