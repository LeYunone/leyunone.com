---
date: 2024-03-25
title: 智能智家项目
category: 
  - 业务
tag:
  - 业务
---
> 在2023年3月-6月，让我加班繁多的项目，智家APP
>
> 好记性不如烂笔头，以此篇记录

# 背景

为完善品牌智能体系，需要一款全方位为公司品牌定制的智能家居控制app：

比如小度APP、HiLink、天猫精灵，Alexa等智能语音音箱的控制app。

# 技术

纯后台中心应用，使用了目前互联网主流体系的技术与框架

**开发框架**： `SpringBoot一套` 、`MyBatis-plus`、`easy-rule`  、`Dubbo`

**中间件**：`redis`、`mqtt` 、`rabbitmq`、`nacos` 、`XXL-JOB` 

**数据库**：`Mysql`

**工具**：`极光推送`、`阿里云OSS` 、`阿里云短信`

# 这是什么

智能家居类的应用，核心目的是对自我品牌的设备进行管理；

用户以家庭为单位，信息管理分为三部分：

1. 基于设备
2. 基于家庭
3. 基于用户

即设备模块、家庭模板和用户模块；

**家庭模板**：应用内的设备操作的最小单位，拥有成员邀请、权限管理、家庭建设、自动化场景等等功能

**用户模块**：围绕着第三方服务`用户中心`建设，拥有用户个性化设置，消息中心，推送，呼叫等等功能

**设备模块**：最核心的模块，和设备交互的一切业务，比如绑定、列表、对讲、控制、日志、数据等等等等

界面UI上差不多是对标目前市场上主流的智能家居类APP比如小米、小度等，但是因为是公司品牌形象的app，所以在功能上以及ui需要有自己的特色。

# 有什么用

用户通过登录app后，会创建一个默认的家庭 `我的家`

在这个家庭中，可以通过邀请码填写或者二维码扫描的方式邀请其他用户加入到自己的家庭中；

家庭用户三个角色：家庭所有者、管理员、普通角色，从大到小，可以控制权限小于自身用户的可见或可用功能。

在家庭中，通过 `局域网` 或 `蓝牙` 或 `WIFI` 绑定设备，根据约定的协议寻找子设备或设备本身。

存在设备后，可以自由的操作，查询设备。并且可以通过权限控制的方式将设备的控制权指定到人员；

管理员可以在家庭中添加场景去控制设备，分为三种场景：

- **自动化场景**，设定条件，执行动作；

  条件有：天气、时间、倒计时、一个或多个指定设备指定属性阈值、空气条件...

  执行有：一个或多个指定设备、一键场景

- **一键场景**，执行动作；

  执行有：一个或多个指定设备、一键场景

- **设备内置场景**，设备自带的场景，执行动作；

设备数据除了基本实时的数据同步外，还会记录设备每一次上报的数据，并且特定的设备类型，比如说各种传感器：雨量传感器、CO2传感器、CO传感器等等都会生成一个具体到时分秒、具体到当前周、当前月、当前年的历史数据图表日志出来。

用户在APP中的有效操作，会生成对应的消息到消息中心，比如加入家庭、信息修改等等；设备的操作会生成以家庭为单位的对应消息到消息中心，比如绑定设备、设备报警、设备更新等等；家庭中成员对其操作的动作也会生成消息到消息中心，比如添加房间、删除房间，踢出成员，添加设备等等。

消息中心在收到后，会进行以下三步：

1. 将消息与对应范围内的用户关联，以至于可在app的消息中心内提示并且可见
2. 对消息进行是否手机应用推送动作
3. 对消息进行是否短信推送动作
4. 判断用户是否设置消息免打扰或当前时间段在消息免打扰时间段中



用户通过以上简单描述，可以做到全方位的对设备操作，并且提供以家庭为单位的个性化建设，比如背景图片、声音、房间设置、房间用户成员排序等等

# 怎么做的



# 技术难点

## 场景功能的设计

一键场景简单，是通过用户点击触发任务的形式；

但是自动化场景，随着条件的复杂度增大，其判断是否触发的动作也越复杂；

关于这点在 [自动化场景业务的设计](https://leyunone.com/Interesting-design/condition-command.html#%E5%B9%B6%E5%8F%91)中早已有过记录

## 夏令时自动转化

夏令时自动转化问题，在 [处理夏令时转化业务](https://leyunone.com/unidentified-business/summertime.html) 中有记录

## 消息中心设计

在 [消息中心业务模块设计](https://leyunone.com/unidentified-business/message-center-design.html) 中有记录

## 设备状态同步



## 执行中心

因为太多定时任务的设计，夏令时转换、场景条件判断、设备定时执行等等；

如果都堆在原项目中执行的话，因为很多的场景中都采用了同一个线程池进行分流以及解压，所以会造成单个项目中线程的不够用；同时数据库的连接数也无法做到实时的把控。

因此额外的将这些定时任务放置在了一个执行中心中，由XXL-JOB统一去调度；

# 项目实际生产Bug

## 多语言问题

IOS和安卓多语言区别

## nginx下划线问题

