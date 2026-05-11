---
date: 2025-04-15
title: SonarQube代码扫描：从配置到实战
category:
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: SonarQube,代码扫描,代码质量,CI/CD,乐云一
  - - meta
    - name: description
      content: SonarQube怎么用？从规则配置、本地扫描、IDE集成到报告分析，一篇讲清楚。
---
# SonarQube代码扫描：从配置到实战

在[之前那篇](sonarqube.md)文章里，我聊了怎么在IDEA里集成SonarQube插件，让开发人员在提交代码时就能被审查。

但那只是SonarQube能力的冰山一角。

作为一个团队的技术负责人或者规范制定者，你需要的不只是"开发人员自己扫一扫"，而是要有体系化的规则配置、标准化的扫描流程、以及可量化的质量报告。

所以这篇文章，从规则配置开始，把SonarQube代码扫描这条线完整地聊一遍。

## 先搞清楚两个概念

配置规则之前，有两个核心概念必须理解：

**质量配置（Quality Profile）**：就是"规则集"。比如Java有一套规则集，JavaScript有一套规则集。每套规则集里包含了这个语言下的所有扫描规则。

**质量阈（Quality Gate）**：就是"质量门禁"。它是判断代码能不能过关的门槛——比如"存在阻断性漏洞就不通过"、"代码重复率超过30%就不通过"。

一个项目下，质量配置和语言规则集的关系：

![质量配置关系](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411204113871.png)

理解了这两个概念，后面的操作就清晰了。

## 规则配置

### 创建自定义规则集

SonarQube内置的规则集（通常叫"SonarWay"）不能删也不能改。所以想自定义规则，必须创建自己的规则集。

创建时有三个策略：

1. **复制一个已有的规则集**：拷贝一份再改
2. **继承一个已有规则集**：作为子集，在父集基础上增减
3. **创建空白规则集**：从零开始选

根据团队情况选一个。如果SonarWay的大部分规则你觉得OK，只是想调整几条，选继承就好。

### 调整规则

进入自定义规则集后，可以做的事情：

- **启用/禁用规则**：不需要的规则直接Deactivate掉
- **调整严重级别**：SonarQube默认的严重级别可能不符合你团队的判断，比如某条规则SonarQube觉得只是"次要"，但你认为应该"主要"
- **搜索规则**：支持按规则类型、严重级别、状态筛选

严重级别从高到低：`Blocker（阻断性）> Critical（严重）> Major（主要）> Minor（次要）> Info（信息）`

### 关联项目

规则集配好了，不关联项目等于白搭。

在项目设置里，选择Project Settings → Quality Profile，把对应语言的自定义规则集关联上。这样扫描时才会用你的规则。

### 质量门禁

质量门禁是代码进入下一环节的"通行证"。配置的时候要拿捏好——太松了等于没设，太紧了天天不通过影响效率。

常用的配置项：

| 指标 | 运算符 | 阈值 | 说明 |
|---|---|---|---|
| Bugs | > | 0 | 有Bug就不通过 |
| Vulnerabilities | > | 0 | 有安全漏洞就不通过 |
| Code Smells | > | 10 | 异味超过10个不通过 |
| 重复率 | > | 30% | 重复率太高不通过 |
| Coverage | < | 80% | 测试覆盖率太低不通过 |
| 新增阻断性问题 | > | 0 | 新增阻断性问题不通过 |

根据项目实际情况调整，别一刀切。

## 代码扫描的三种方式

SonarQube触发扫描有三种方式：

1. **开发人员主动扫描**：本地跑SonarScanner
2. **IDE集成扫描**：写代码的时候实时扫、提交代码的时候扫
3. **CI/CD流水线扫描**：构建前自动扫

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/20260511161432.png)

### 本地静态扫描

适合提交代码前自查，提前发现问题，减少返工。

**安装SonarScanner：**

Windows：
1. 下载解压SonarScanner
2. 配置环境变量 `SONAR_SCANNER_HOME` 指向解压目录
3. 把 `%SONAR_SCANNER_HOME%\bin` 加到Path
4. 命令行输入 `sonar-scanner -v` 验证

Linux/Mac同理，解压后配置环境变量即可。

如果环境变量配了还是报错，直接执行安装目录下的 `bin/sonar-scanner.bat`（Windows）或 `bin/sonar-scanner`（Linux）。

**扫描配置：**

两种方式：

1. 在项目根目录创建 `sonar-project.properties` 文件
2. 在命令行参数里直接传

推荐第一种，一劳永逸：

```properties
# 项目标识（和SonarQube Server里的Project Key一致）
sonar.projectKey=company-demo-project
# 项目名称
sonar.projectName=demo
# 版本
sonar.projectVersion=1.0.0
# 源码目录
sonar.sources=src/main/java
# 测试目录
sonar.tests=src/test/java
# 编码
sonar.sourceEncoding=UTF-8
# 语言
sonar.language=java
# Server地址
sonar.host.url=http://192.168.21.214:9000/
# 令牌
sonar.login=sqa_xxxxx
```

**执行：**

在项目根目录下执行 `sonar-scanner`，看到 "EXECUTION SUCCESS" 就说明扫描完成了。

结果不会在本地展示，而是上传到SonarQube Server。登录Web界面就能看报告。

如果报错了，用 `sonar-scanner -X` 开DEBUG模式排查。

### IDE集成

这部分在[之前那篇](sonarqube.md)已经详细说过了，简单回顾：

1. 安装SonarLint插件（IDEA/VS Code都有）
2. 配置连接到SonarQube Server
3. 关联项目
4. 插件自动同步服务器上的规则集

配置好之后：

- **实时扫描**：写代码的时候有问题直接标红标黄
- **主动扫描**：右键文件/文件夹 → Sonar → Analyze
- **提交扫描**：在Commit选项里勾选"Perform SonarQube analysis"

> 注意：SonarLint同步时，无法获取非内置的自定义插件规则。自定义插件的规则只能通过SonarScanner扫描触发。

## 报告分析

扫描完了看报告，这是最终目的。

### 首页概览

首页的质量状态卡片最直观——绿色Passed表示通过，红色Failed表示没过。

5个核心指标卡片：

1. **Bugs**：可能导致程序崩溃的代码缺陷，优先修Blocker和Critical
2. **Vulnerabilities**：SQL注入、XSS、硬编码密码等安全漏洞，能修就修
3. **Code Smells**：代码坏味道，函数太长、命名不规范之类的，按优先级逐步优化
4. **重复率**：重复代码占比，建议控制在30%以下，抽公共方法
5. **覆盖率**：被测试覆盖的代码比例，核心业务代码不低于80%

### Issues页面

所有被扫描出来的问题都在这。支持按严重级别、状态、负责人筛选。

点击问题进去能看到：问题位置（文件+行号）、问题描述、修复建议、历史记录。

### Activity趋势图

记录每次扫描的结果变化趋势。看这个图能直观感受到团队的代码质量是在变好还是变坏。

### 导出报告

需要向非技术人员汇报的时候，可以导出PDF或Excel。PDF适合分享，Excel适合深入分析。

## 自定义规则

如果内置规则满足不了需求，还有两种方式自定义：

### 模板自定义

SonarQube内置了一些规则模板，比如正则匹配模板。你可以创建一个规则，填上你想拦截的正则表达式就行。

缺点是只能做简单的模式匹配，而且不能批量创建。

### 插件开发

复杂的自定义规则需要开发SonarQube插件。这部分内容比较多，我单独写了一篇：[SonarQube插件开发](sonarqube-dev.md)。

## 总结

SonarQube的代码扫描体系，本质上就是三件事：

1. **定义规则**：什么代码算好、什么算差，你得定清楚
2. **执行扫描**：本地扫、IDE扫、流水线扫，三种方式覆盖不同阶段
3. **看报告改问题**：扫描不是目的，改才是

从团队落地的角度，建议的推进路径：

- 先在IDE里集成SonarLint，让每个人写代码时就能发现问题
- 再配置好Server端的规则集和质量门禁，统一标准
- 最后接入CI/CD流水线，实现提交代码自动扫描

一步步来，别一上来就全铺开，不然开发人员的抵触情绪会很大。
