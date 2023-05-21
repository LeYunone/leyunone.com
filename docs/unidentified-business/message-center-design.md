---
date: 2023-05-20
title: 消息中心业务模块设计
category: 
  - 业务
tag:
  - 业务
---
# 消息中心业务模块设计

# 背景

现在很多很多的应用，不管是APP或是WEB甚是小程序，都存有消息中心模块的功能。

而消息中心的设置，不能像接口开发那样，一个头一个尾的线性开发。

何为中心，即可包容所有业务的中轴。

那么我 将阐述以下我对设计消息中心模块的设计

# 功能

一个应用中的消息中心大致拥有以下几个功能：

1. 收集消息
2. 发送消息
3. 短信/应用推送
4. 消息中心设置
5. 未读消息提醒

接下来我会根据以上5个功能，从设计模式、技术、业务角度阐述一下 我对以上功能的一些设计

# 功能设计

## 消息接发

### 功能概述

当指定业务到达发送消息节点后，发送消息到消息中心，消息中心收集后进行展示和管理；此外，**消息中心接收到的消息除了简单的文本消息外，还可能包含触发文本及点击的触发事件**

### 设计

作为一个消息中心，对于发送接口的设计，首先要明确以下三点：

- 灵活
- 严格
- 可靠

即对 `消息内容的灵活自由`、 `内容主题的严格要求`、`消息来源的可靠`

根据考虑，想到使用 `策略模式` + `模板模式` + `数据库维护文本模板` 的方式设计消息中心的发送接口

**发送消息**：

消息的发送会根据业务的定位，到达的范围而不同，比如：

- 指定一个用户
- 指定一个组下的所有人/管理员/创建者
- ....

所以我们根据策略模式去控制各个业务的消息发送处理器

`策略控制`：

通过枚举控制 调用两种模型下发的服务

```java
public enum MessagePublishEnum {
    HOME(1, "组别范围", GroupMessageManager.class),
    USER(2, "用户范围", UserMessageManager.class)
}
```

```java
public void messagePublish(...){
    //发送前校验
    ...
   MessageCenterManager messageCenterManager = ApplicationContextProvider.getBean(MessagePublishEnum枚举)
   ...
   //发送后回调事件
}
```

**抽象策略者：**

```java
public abstract class MessageCenterManager<T extends MessageCenterBean> {

    public abstract void messageOn(T t);
    public abstract void messagePush(T t);
    
    public void message(T t) {
        ...
        this.messageOn(t);
        ...
        if(t.get推送){
            this.messagePush(t);
        }
    }
    
   void unReadCache(List<Long> userIds) {
        for (Long userId : userIds) {
            //保存单个未读key 8小时
            cacheService.addDate(SmartHomeConstant.UN_READ_CACHE+userId, Boolean.toString(true),8, TimeUnit.HOURS);
        }
    }

    MessageCenterDO buildMessage(T t) {
		return 构建消息体;
    }
```

**具体策略人**：

```java

/**
 * 用户广播消息
 */
@Service
public class UserMessageManager extends MessageCenterManager<MessageCenterBean.userMessage> {

    @Autowired
    private MessageCenterDao messageCenterDao;

    @Override
    public void messageOn(MessageCenterBean.userMessage userMessage) {
        List<MessageCenterDO> messageCenters = new ArrayList<>();
        for (Long userId : userMessage.getUserIds()) {
            MessageCenterDO messageCenterDO = super.buildMessage(userMessage);
            messageCenterDO.setUserId(userId);
            messageCenters.add(messageCenterDO);
        }
        messageCenterDao.insertBatch(messageCenters);
        unReadCache(userMessage.getUserIds());
    }

    /**
     * 推送服务
     * @param userMessage
     */
    @Override
    public void messagePush(MessageCenterBean.userMessage userMessage) {

    }
}
```

通过策略模式，我们可以严格的保证 设置  `内容主题的严格要求`、`消息来源的可靠`

但是消息内容的灵活自由，则是策略模式做不到的，所以我们要引入消息模板的设计思路。

`消息模板`：

对于所有消息来说，相同的业务都会出现这样的问题：**消息主题不变，变的只有消息的 “你” “我” 宾语**，所以我们可以维护一张消息模板表，去覆盖业务中所有的业务，消息模板包括：

- 模型文本
- 触发文本
- 模型标题
- 消息类型 
- 消息触发类型 【点击消息的跳转动作】
- 是否推送  0 不推送 1推送
- 是否短信 0 无 1 可
- 图标



`举个例子：` 一个邀请成员的申请加入动作，他的模板为：

|     字段     |         值          |
| :----------: | :-----------------: |
|   模型文本   |    {}申请加入{}     |
|   触发文本   |      前往验证       |
|   模型标题   |    来自{}的申请     |
|   消息类型   |          0          |
| 消息触发类型 | 0[跳转到待审核列表] |
|   是否推送   |          1          |
|   是否短信   |          0          |

那么，作为业务方，使用发送消息接口即只需指名本次业务的消息模块，以及**{}**中的填充内容

模板内容的填充，模拟见**Logger**框架中对{}填充的算法；

```java
    private String fillStr(String fill, String[] content) {
        if (ObjectUtil.isEmpty(content)) return fill;
        StringBuilder sbuf = new StringBuilder(fill.length() + 50);
        int j;
        int r = 0;
        for (int i = 0; i < content.length; i++) {
            j = fill.indexOf(SmartHomeConstant.DELIM_STR, r);
            if (j == -1) {
                //没有填充内容
                sbuf.append(fill);
                break;
            } else {
                sbuf.append(fill, r, j);
                sbuf.append(content[i]);
            }
            r = j + SmartHomeConstant.DELIM_STR.length();
        }
        return sbuf.append(fill, r, fill.length()).toString();
    }
```

最后我们将所有消息模块维护到数据库上的同时，也维护一张相同指向数据库的枚举.

设置模板枚举，定义 **数据库表主键**、 **消息下发范围** 、 **消息推送范围**

**发送消息者**：调用服务，入参：

- **消息模板枚举**
- **消息填充内容**
- **消息标题填充内容**
- **消息下发服务**

>  可在链路中灵活使用枚举，去动态的存储具体消息的模板信息及填充内容

## 推送

### 功能概述

消息推送到用户的APP上，进行消息提示

### 设计

推送的功能在消息中心上并不属于设计方，一般推送的逻辑都会在推送中心上完成。

所以推送功能，作为调用方就不阐述其设计了

## 消息中心设置

### 功能概述

消息中心的设置，基本就是对各个消息的 "开关" 设置。不过对于一些应用，存在免打扰时段设置的功能；

### 设计

简单的0、1作为各个设置按钮的开关

免打扰时段设计：

用户，一对多免打扰时段数据；

时间模板：

- 生效时间段 模板 8:00-9:00
- 生效周期 模板 1,3,4,5

判断是否在免打扰时段：

如果应用不存在海外市场，那么我们只需要简单的判断 星期 - 时间段，是否合法；但是如果存在海外市场，那么还需要：**维护一张用户-时区的表**

将设置上的时间转化成系统时区的时间，然后判断时间是否在区间内，至于转化有很多办法，我偏向于将数据中的时间转换成系统时间：

```java
    public static Time timeZoneConvertSysTime(LocalDateTime convertTime) {
        TimeZone aDefault = TimeZone.getDefault();
        Integer timeZone = aDefault.getRawOffset() / 3600000;
        // 时区转换
        ZonedDateTime localZoneTime = convertTime.atZone(ZoneId.systemDefault());
        String gmt = "GMT" + (timeZone >= 0 ? "+" + timeZone : "-" + timeZone);
        ZonedDateTime zonedDateTime = localZoneTime.withZoneSameInstant(ZoneId.of(gmt));
        return Time.valueOf(zonedDateTime.toLocalDateTime().toLocalTime());
    }
```

## 未读消息提醒

### 功能概述

当消息中心存在未读消息状态，需要进行应用层的提醒

### 设计

可以有两种实现方式：

1、使用mq通知

2、使用轮询查询

两种各有各的特点：

- 使用mq通知可以做到消息的即时性，但是其设计难度会随着通知者的定义而变得复杂
- 使用轮询查询，设计简单，但是会增加数据库或缓存的访问压力

**如果缓存Key设计的好，且缓存压力不大的场景下，我推荐使用轮询的方式**

对消息未读状态的处理：

1. 当消息下发时，建立 `key[_unRead:userId]` `value[true]`的缓存，时间为X
2. 当消息全部已读时，删除 `_unRead:userId`的key
3. 请求接口，如果没有 `_unRead:userId` 则查询数据库有无未读消息，如果有 则建立 `key[_unRead:userId]` `value[true]`、如果没有则建立 `key[smarthome_unRead:userId]` `value[false]`缓存，时间为X
4. 请求接口，如果有 key，则返回对应的value

# 可能风险

- 消息模板填充内容中特殊字符过滤
- 用户时区的暂定值
- ...
