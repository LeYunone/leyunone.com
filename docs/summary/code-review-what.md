---
date: 2026-04-23
title: 代码Review到底在Review什么——我见过最离谱的代码
category:
  - 不止所云
tag:
  - 杂谈
  - 代码Review
  - AI
head:
  - - meta
    - name: keywords
      content: 代码Review,Code Review,AI审查,代码质量,乐云一
  - - meta
    - name: description
      content: 代码Review到底在看什么？我见过哪些离谱的代码？AI时代的Code Review和以前有什么不同？
---

# 代码Review到底在Review什么——我见过最离谱的代码

## 序

Code Review这件事，每个公司都说自己重视，但真正做到位的没几个。

大部分情况是这样的：PR提了，@了一下同事，同事看了一眼说"没问题，合并吧"——整个过程不超过5分钟，连代码都没展开看完。

这不是Review，这是**走流程**。

但Code Review真的不重要吗？恰恰相反，我觉得**Code Review是保证代码质量最有效的手段**。比什么SonarQube、什么代码规范检查、什么单测覆盖率都有用。

因为工具只能发现语法错误，**只有人能发现设计错误**。

本篇就来聊聊Code Review到底在看什么，我见过什么离谱的代码，以及AI时代Code Review会发生什么变化。

## Code Review到底在看什么

很多人以为Code Review就是看代码有没有Bug。但Bug只是冰山一角。

一个合格的Review，至少要看四个层面：

```
┌──────────────────────────────────────────────┐
│              Code Review 四层模型              │
│                                               │
│  第四层: 设计合理性                             │
│    这个方案本身对不对？有没有更好的方式？        │
│                                               │
│  第三层: 架构一致性                             │
│    代码是否遵循项目的架构规范？                  │
│    有没有破坏分层？有没有引入不当的依赖？        │
│                                               │
│  第二层: 代码可读性                             │
│    别人能看懂吗？命名清楚吗？逻辑清晰吗？       │
│                                               │
│  第一层: 基本正确性                             │
│    有没有Bug？有没有遗漏？有没有安全风险？      │
│                                               │
└──────────────────────────────────────────────┘
```

### 第一层：基本正确性

这是最基本的——代码能不能跑？

常见的低级问题：

- 空指针没判空
- 资源没关闭（InputStream、Connection）
- 并发问题（SimpleDateFormat、HashMap）
- SQL注入（直接拼接SQL）
- 越界、除零、类型转换错误

这些问题其实工具就能发现。SonarQube、IDEA的Inspect Code、FindBugs这些工具都能检测出来。

所以第一层的问题，**不是Review的重点**——因为工具能做。

### 第二层：可读性

代码是写给人看的，顺便给机器执行。

一段"能跑但看不懂"的代码，比"跑不了但看得懂"的代码更可怕。因为后者你还能改，前者你连改都不敢。

可读性的核心是**命名**。

好的命名，代码读起来像文章：

```
// 好的命名：自解释
User loggedInUser = userService.findByToken(authToken);
if (loggedInUser == null) {
    throw new AuthenticationException("Token已过期");
}

// 差的命名：需要注释才能理解
User u = us.get(t);  // u是用户，us是UserService，t是token
if (u == null) {
    throw new Exception("error");  // 什么error？
}
```

命名这件事，说起来简单做起来难。我自己也经常写着写着就开始用`data`、`info`、`temp`这种万能词。但每次Review的时候被指出来，就会提醒自己下次注意。

### 第三层：架构一致性

这一层开始，就不是看单行代码了，而是看**这坨代码放在这个位置合不合理**。

- Service层直接写SQL了吗？
- Controller层有业务逻辑吗？
- 公共工具类依赖了业务模块吗？
- 新加的接口遵循RESTful规范吗？

这些问题的核心是：**这行代码放在这里，会不会让项目越来越乱？**

一个项目的腐化，往往不是某一次提交导致的。而是每一次"先这样写吧，后面再改"累积起来的。

Code Review的第三层，就是在阻止这种累积。

### 第四层：设计合理性

最高层——**这个方案本身对不对？**

这一层最考验Review者的功力。因为你需要理解业务的上下文，才能判断方案是否合理。

- 这个需求用消息队列是不是更合适，为什么要同步调用？
- 这个字段为什么要存数据库，放缓存不行吗？
- 为什么要引入新的中间件，现有的是不是够用？
- 这个接口设计会不会导致N+1查询？

这类问题，工具发现不了，新人也看不出来。只有对项目有深入理解的人才能发现。

**所以第四层的Review，才是最有价值的Review。**

## 我见过的离谱代码

以下内容纯属真实经历，如有雷同，说明你的同事和我以前的同事是同一类人。

### 离谱一：万能catch

```
try {
    // 两百行业务逻辑
} catch (Exception e) {
    // 什么都不做
}
```

这个我见过最经典的版本——一个200多行的方法，用一个巨大的try-catch包起来，catch里什么都不做。

出了Bug的时候，日志里什么都没有，错误被吞得干干净净。排查的时候你只能对着屏幕发呆：不知道哪一行出了问题，不知道出了什么问题，甚至不知道出了问题。

### 离谱二：if-else套娃

```
if (status == 1) {
    if (type == 1) {
        if (level == 1) {
            // do something
        } else if (level == 2) {
            // do something
        } else {
            // do something
        }
    } else if (type == 2) {
        if (level == 1) {
            // do something
        }
        // ... 继续
    }
} else if (status == 2) {
    // 上面那一套再来一遍
}
```

我曾经接过一个模块，if-else嵌套了七层。七层。屏幕往右滚了两页还没看到最里面的代码。

后来用策略模式重构了一下，300行缩成80行。策略模式真TM好用。

### 离谱三：魔数满天飞

```
if (user.getType() == 3) {
    if (order.getStatus() == 7) {
        pay(2);
    }
}
```

3是什么类型？7是什么状态？2是什么支付方式？

只有天知道。

加个枚举或者常量很难吗？

```
if (user.getType() == UserType.VIP) {
    if (order.getStatus() == OrderStatus.PAID) {
        pay(PaymentMethod.ALIPAY);
    }
}
```

这不就清晰多了。

### 离谱四：复制粘贴大法

同一个方法，在五个不同的Service里出现，逻辑完全一样，只是参数类型不同。

最经典的一次：我在一个项目里搜了一下`SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd")`，出现了46次。

46次。同一个SimpleDateFormat的初始化，46次。抽个工具方法不行吗。

更可怕的是，后来发现这46个里面，有3个格式写的是`yyyy-MM-dd`，1个写的是`yyy-MM-dd`（少了个y），另外42个是对的。

一个字母的差别，在生产环境跑了好几个月才被发现。

### 离谱五：注释比代码还离谱

```
// 查询用户
public User getUser(String id) {
    // 这里要判断一下
    if (id == null) {
        // 如果id为空就返回null
        return null;
    }
    // 调用dao查询
    return userDao.selectById(id);
}
```

这种注释，写了不如不写。代码本身已经能表达意思了，注释只是在重复一遍。

真正需要注释的是**为什么这样做**，而不是**做了什么**：

```
// 使用悲观锁而非乐观锁：因为该场景并发修改冲突率极高，
// 乐观锁的重试成本远大于锁等待成本
public User getUserWithLock(String id) {
    return userDao.selectByIdForUpdate(id);
}
```

### 离谱六：SQL里写业务逻辑

```
SELECT
    CASE
        WHEN status = 1 AND type = 2 AND amount > 1000 THEN 'A'
        WHEN status = 1 AND type = 3 AND amount > 500 THEN 'B'
        WHEN status = 2 AND type IN (2,3) THEN 'C'
        WHEN status = 3 AND create_time > '2024-01-01' THEN 'D'
        ELSE 'E'
    END AS level,
    CASE
        WHEN level = 'A' THEN ...
        -- 继续嵌套
    END AS sub_level,
    ...
FROM orders
```

一个SQL 300行，里面全是CASE-WHEN、子查询、聚合函数。数据库的CPU直接拉满。

问他为什么不放在Java里处理，答曰："在SQL里处理更快。"

更快是更快，但这样的SQL谁敢改？改一个CASE条件，可能影响十几个下游报表。

**SQL负责查询数据，Java负责处理逻辑。各干各的，别串了。**

## AI时代的Code Review

说到这里，就不得不聊聊AI对Code Review的影响了。

### AI能做什么

现在的AI（Claude、GPT-4o）在Code Review方面的能力已经相当强了：

**能发现的：**
- 空指针、资源泄漏、并发问题
- 命名不规范、魔数、重复代码
- SQL注入、XSS等安全问题
- 简单的设计问题（过度嵌套、职责不清）

**不能发现的：**
- 这个方案是否符合业务需求
- 这个改动会不会影响上下游系统
- 这个性能优化是否真的有必要
- 代码的架构是否符合项目规范

简单说，**AI擅长第一二层（基本正确性+可读性），不擅长第三四层（架构一致性+设计合理性）。**

### 用AI做Review的正确姿势

我的做法是：**AI做初筛，人做终审。**

```
代码提交
    │
    ▼
AI自动Review（CI/CD中集成）
    │  检查: 空指针、资源泄漏、安全问题、命名规范
    │  耗时: 几秒
    │
    ▼
人工Review
    │  检查: 架构一致性、设计合理性、业务正确性
    │  耗时: 十几分钟
    │
    ▼
合并
```

AI把第一二层的"体力活"干了，人只需要关注第三四层的"脑力活"。

这样既保证了效率，又保证了质量。

### AI Review的局限

AI做Review有一个很根本的问题：**它不知道你的业务上下文**。

它看到一个`status == 3`，会提醒你"建议使用枚举代替魔数"。但它不知道在你的业务里3代表什么，也不知道改了之后会不会影响上下游。

它看到一个N+1查询，会提醒你"建议使用批量查询"。但它不知道这个接口的QPS只有0.1，优化了也没用。

它看到一个if-else嵌套三层，会建议你用策略模式。但它不知道这个分支下个月就要下线了，重构反而浪费时间。

**AI能发现"代码写得不好"，但判断不了"这段代码该不该写"。**

后者才是Code Review最有价值的部分。

## 好的Code Review长什么样

最后说说我对好的Code Review的理解。

### 对提交者

- **PR要小**：一个PR不超过400行。超过400行没人会仔细看
- **描述要清楚**：PR描述里写明白"为什么做这个改动"、"影响范围是什么"
- **自己先Review一遍**：提PR之前自己先看一遍diff，把明显的问题改掉

### 对Review者

- **及时响应**：别人提了PR，24小时内给反馈。拖一周再Review，黄花菜都凉了
- **对代码不对人**：Review的是代码质量，不是代码作者的能力
- **说清楚为什么**：别说"这样不好"，要说"建议改成xxx，因为xxx"
- **分层Review**：先看设计合不合理，再看代码可读性，最后看细节

### 对团队

- **建立规范**：代码规范、命名规范、架构规范——没有规范的Review就是各说各话
- **重视Review**：Review不是走流程，是实打实的质量保障。给Review留时间
- **持续改进**：Review中发现的问题，整理成团队的经验积累

## 最后

Code Review这件事，说到底就是一个**互相学习的过程**。

提交者从Review者的反馈中学习更好的写法，Review者从提交者的代码中了解项目的不同模块。

好的Code Review文化，比任何代码规范文档都管用。

当然，如果你有一个AI数字分身帮你做第一轮Review，那就更好了——它能24小时在线，秒级响应，永远不会说"今天太忙了明天再看"。

不过最终拍板的，还是得是人。

**代码是写给机器执行的，但首先是写给人看的。**

这句话放在AI时代，依然成立。
