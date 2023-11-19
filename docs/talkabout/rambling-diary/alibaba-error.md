---
date: 2023-11-19
title: 阿里巴巴全系故障分析
category:
  - 不止所云
tag:
  - 杂谈
---
# 阿里巴巴全系故障分析

11月12日晚，在双十一活动后的第二天，阿里因为发生了阿里系APP皆故障问题而冲上了热搜：

> 11月12日，“双11”刚过去一天，阿里旗下淘宝、闲鱼、阿里云盘、饿了么、钉钉等多款产品出现服务器故障，无法操作，引发各界热议。
>
> “阿里全系产品崩了”“淘宝又崩了”“闲鱼崩了”“钉钉崩了”“阿里云盘崩了”等话题迅速登上微博热搜。
>
> **根据后面阿里云的公告，当天17时44分起，阿里云监控发现云产品控制台访问及API调用出现异常，阿里云工程师正在紧急介入排查。**
>
> 17时50分 阿里云已确认故障原因与某个底层服务组件有关，工程师正在紧急处理中。
>
> 21时11分 受影响云产品均已恢复，因故障影响部分云产品的数据（如监控、账单等）可能存在延迟推送情况，不影响业务运行。
>
> 整个事故从发现到“均已恢复”，耗时3个多小时，影响者甚众。
>
> 作为国内云计算的拓荒者，阿里云在相当长时间里，都处于遥遥领先的位置。但如今，云计算已成为科技巨头们投入重兵的必争之地，昔日无人区早已成一片红海。 ....

这并非阿里巴巴首次如此重大的宕机事故，先不提前不久刚刚发生的语雀的8小时宕机事件，早在2022年12月阿里云香港Region可用区C发生大规模服务中断机房故障问题。

要知道，作为阿里巴巴产品中最大盈利点之一的云服务，客户的信任一直都是放在运营体系中的首要，以至于阿里云的客服、工单等售后服务风评一直不错。

那么在明知道服务器宕机这种毁灭性灾难的事故，会给予品牌毁灭性的打击，事故虽无法避免，但预险机制是否在阿里体系中有些过于形同虚设了，难不成一直宣扬的高可用，其实一直都是一场阿里骗局？

因此本篇在回顾阿里巴巴过去事故同时，也分析其故障和应对措施

## 2022年服务器宕机

> 2022年12月18日，阿里云香港Region可用区C发生大规模服务中断事件，对很多客户业务产生重大影响，影响面扩大到香港可用区C的EBS、OSS、RDS等更多云服务。
>
> 之后，阿里云发布了事件说明，公告显示，冷机系统故障恢复时间过长、现场处置不及时导致触发消防喷淋、客户在香港地域新购ECS等管控操作失败、故障信息发布不够及时透明是导致此次宕机时间长、规模大的四大重要原因。

在2022年12月18日这一天，全球使用到阿里云香港云服务的企业都有概率获得一份来自阿里巴巴的惊喜：服务器13小时宕机

首先让我们来回顾一下当天发现了什么，根据官方复盘：

- `8:56`分检测到香港地区可用区C区机房温控告警
- 安排维护人员排查，排查到冷机异常
- 请示应急预案，物理降温，但是冷机控制系统始终无法稳定运行，应急预案失败
- ECS服务器开始停机
- 紧急切换重要服务，比如数据库实例，但是部分实例依然切换失败
- OSS服务中断
- 由于机房高温，强制触发消防喷淋，部分设备维修受到水影响
- 制冷恢复，服务重启，开始正常运行

根据时间线呈现如下图：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-11-19/aaa3396e-5b0b-49f4-b2f6-a7c660b99b01.png)

大家可以先看三个重要的时间点：`8:56`、`9:01`、`19:47`

在8点56分时就已经检测到机房温控异常了，然后工程师在9点01分正确定位到制冷异常，但是只是因为这么一个普遍且常见的制冷设备异常的问题竟持续到了19点47分才恢复，这不禁让人思考以下几点问题：

1. 制冷系统的主备为什么不能切换顶上
2. 关键时候宣传的高可用形同虚设，为什么在一个机房异常的场景下未生效
3. 为什么要进行喷淋操作
4. .....

### 假的主备冷机系统

造成本次事故的一个最主要因素就是主冷机系统异常时，备用系统竟也无法使用。原因是机房主备水冷机组共用了同一个水路循环系统，存在单点故障整体报废的问题。有趣的是这个机房系统还不是阿里云亲自搭建的，而是从“二房东”手上租下的。因此出现了故障之后，最了解机房架构的基层领导已经查无此人，故障响应不够及时

并且机房制冷设备的监控没有有效的运行，因为是事先发现温控异常之后，才找到是制冷设备的问题。同时也没有对水冷设备故障进行过演练，导致事故产生时没有正确预案对策

### 消防喷淋

电子设备最怕水这种常识大家也都知道，主板进水然后导致短路是非常容易发生的，进而使服务器上的数据丢失。不知道当天有没有因为这个原因而延长维修时间，但是在机房中使用常规的水淋消防真的是很逆天的设计。

考虑到成本，要知道香港服务器中所运维的大大小小企业的APP、网站、程序等等都碾压其他稍贵的消防方式

比如常见的七氟丙烷、水凝液体，甚至干粉、气水雾。

### 假的高可用

高可用是所有云服务厂商最看重的卖点，因为不管哪个企业都希望自己挂载的服务可以不被其他因素影响。

当故障发生时，云服务厂商可以通过将挂在A区的服务、暂转移到B区上，达到用户无感的快速切换，使故障对用户的业务做到0影响。

但是这一次阿里云故障中，虽然采用了B/C可用区的双机房的容灾，但是在C可用去发生大规模故障后，B可用区的资源又明显不够。更重要的是在ECS服务器启动后，他依赖的中间件服务却又都部署在了C区，没有做双机房容灾，导致了B区无法做到相关服务的扩容。

这也就说明了阿里云其实在很多基础服务中，根本没有做到双机房容灾。

说是虚假宣传不为过，因为很多企业选择阿里云的原因正是看重了其高可用性。

### 损失

这次的事故被称之为阿里云史上最严重

从云服务兴起来看，还没有哪家厂商发生过宕机十几个小时的事件，作为全球第三，亚洲第一的阿里云，从那天开始的品牌名誉已经对半分折了。

并且经济损失上看，香港服务区挂载着很多澳门APP、境外\国内金融网站，甚至有需要虚拟币的交易服务也是依靠本次的服务区。因此在事故发生后，小的是某个售货机不能用，充电桩不开电；大的是几百甚至是几千万的金融交易订单被滞后。

所以损失大的企业在未来还会不会选择阿里云，这个结果是很多人可以想到的。

## 2023年全系应用宕机

来自11月12日的热搜：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-11-19/607da0f0-8c73-481e-b5cf-8cc9b46c6d6c.png)

这次的崩溃涉及受影响产品：

> 企业级分布式应用服务、 [消息队列MQ](https://www.zhihu.com/search?q=消息队列MQ&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、微服务引擎、链路追踪、应用高可用服务、应用实时监控服务、Prometheus监控服务、消息服务、消息队列Kafka版、机器学习、图像搜索、智能推荐AlRec、智能开放搜索OpenSearch、云行情、数据总线DataHub、检索分析服务Elasticsearch版、 [图计算服务Graph Compute](https://www.zhihu.com/search?q=图计算服务Graph Compute&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、实时计算Flink版、智能数据建设与治理[Dataphin](https://www.zhihu.com/search?q=Dataphin&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、开源大数据平台E-MapReduce、[云原生](https://www.zhihu.com/search?q=云原生&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})大数据计算服务MaxCompute、实时数仓Hologres.[大数据开发治理平台DataWorks](https://www.zhihu.com/search?q=大数据开发治理平台DataWorks&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、智能媒体服务、媒体处理、视频点播、对象存储、文件存储NAS、表格存储、日志服务、云存储网关、文件存储HDFS版、块存储、混合云备份服务、密钥管理服务、云防火墙、[数据库审计](https://www.zhihu.com/search?q=数据库审计&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、加密服 务、运维安全中心([堡垒机](https://www.zhihu.com/search?q=堡垒机&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892}))、 容器镜像服务、[容器服务Ku bernetes版](https://www.zhihu.com/search?q=容器服务Ku bernetes版&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、API 网关、资源编排、云原生数据仓库[Analyti cDB PostgreSQL](https://www.zhihu.com/search?q=Analyti cDB PostgreSQL&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})版、图数据库、云原生内存数据库Tair、云 数据库Redis 版、[云原生关系型数据库PolarDB](https://www.zhihu.com/search?q=云原生关系型数据库PolarDB&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、[云数据库](https://www.zhihu.com/search?q=云数据库&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})专属集群、云数据库MySQL版、云原生数据仓库[AnalyticD B MySQL](https://www.zhihu.com/search?q=AnalyticD B MySQL&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})版、云原生[分布式数据库](https://www.zhihu.com/search?q=分布式数据库&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})PolarDB-X、[云数据库 ClickHouse](https://www.zhihu.com/search?q=云数据库 ClickHouse&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、云原生多模数据库L indorm、云数据库Postgr eSQL版、[云数据库SQL Server 版](https://www.zhihu.com/search?q=云数据库SQL Server 版&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、云数据库MongoDB版、[云数据库HBase版](https://www.zhihu.com/search?q=云数据库HBase版&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、数据传输、数据库自治服务、数据库备份、[物联网平台](https://www.zhihu.com/search?q=物联网平台&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、NAT网关、负载均衡、[云解析PrivateZone](https://www.zhihu.com/search?q=云解析PrivateZone&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、弹性公网IP、共享带宽、转发路由器、私网连接、高速通道、[IPv6网关](https://www.zhihu.com/search?q=IPv6网关&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、专有网络VPC、云企业网、VPN网关、[FPGA云服务器](https://www.zhihu.com/search?q=FPGA云服务器&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、超级计算集群、批量计算、[无影云桌面](https://www.zhihu.com/search?q=无影云桌面&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、弹性伸缩、弹性容器实例、弹性[裸金属服务器](https://www.zhihu.com/search?q=裸金属服务器&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、云服务器EC S、轻量应用服务器、函数计算、Serverless 应用引擎、云托付、专有宿主机、GPU云服务器、弹性[高性能计算](https://www.zhihu.com/search?q=高性能计算&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、操作审计、服务器迁移中心、运维编排、智能计算灵骏、[云呼叫中心](https://www.zhihu.com/search?q=云呼叫中心&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286405892})、交通云控平台、客服工作台、视觉智能开放平台、智能外呼机器人、智能语音交互、智能对话机器人、智能用户增长、运维事件中心、新零售智能助理。

可以发现几乎涵盖了阿里系的所有服务，地区也几乎覆盖了阿里云所有IDC可用区。

到底发生了什么会出现覆盖面如此之广的事故

了解一个应用的体系架构的人不能猜测，一定是某个最底层的基础服务有关

11月13日，来自官方的复盘：

`17:50`  阿里云已确认故障原因与某个底层服务组件有关，工程师正在紧急处理中。

`18:54`  经过工程师处理，杭州、北京等地域控制台及API服务已恢复，其他地域控制台服务逐步恢复中。

`19:20`  工程师通过分批重启组件服务，绝大部分[地域控制台](https://www.zhihu.com/search?q=地域控制台&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286438445})及API服务已恢复。

`19:43`  异常[管控服务](https://www.zhihu.com/search?q=管控服务&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286438445})组件均已完成重启，除个别云产品（如[消息队列MQ](https://www.zhihu.com/search?q=消息队列MQ&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A3286438445})、消息服务MNS）仍需处理，其余云产品控制台及API服务已恢复。

`20:12`  北京、杭州等地域消息队列MQ已完成重启，其余地域逐步恢复中。

在复盘中可以看到，多次提到控制台服务，并且结合在那段时间使用阿里云服务时所抛出的异常提示，比如OSS服务：

`The OSS Access Key Id you provided does not exist in our records`

出现这个异常的原因是，在阿里云密钥库中找不到对应的AccessKey密钥，结合已有信息，大概率是阿里云的RAM服务出现了故障

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-11-14/d9962fb6-1ee9-4a57-825e-dc7ac338c8c5.png)

那么这个服务是什么？ 他管理这阿里云中一个用户的所有服务的授权功能，是所有服务最基础的信息服务。

类似于服务的登录服务崩掉了，登录都没有，当然就不用想后续的服务运行了。

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-11-19/6f13544a-9a63-4969-8120-d17ae564b840.png)

RAM服务是所有应用的最上层访问服务，应用请求服务时都会先区RAM中拿取一个用户令牌。而阿里云这么多的应用，不可能每个应用都有一个自己的权限凭证管理，所以这里的RAM服务就是阿里云所有应用强依赖的服务。

至于为什么是在11月12日，双十一的第二天,RAM服务出现问题，可能因素有很多。

但是从软件的安全角度上来看，在流量最高的这天【指的是快递】去动RAM服务很令人匪夷所思

### 疑问

问题很明确，应用强依赖RAM，当RAM挂掉时，其被依赖的服务也不可用

那么为什么不可以针对这个微服务体系去进行一个熔断？

我们从可用性的角度上来看，为什么要特地的去调用其他服务去保证权限认证？

完全可以通过客户端方使用缓存等方式将权限结果记录下来；

或者通过一个内部可信服务通过安全策略作为保证而实现内部服务弱依赖关联，外部服务依然强关联。

这样至少可以保证阿里云内服务，比如OSS、API等服务的正常运行；不过阿里巴巴内部再考虑自身应用层框架下，去强依赖RAM可能也是必不可少的选择。

## 代码带来的崩溃

如果说上面两个案例是由于什么原因导致的，没有绝对的把握考证。

那么下面说的则是百分百由几行小小的代码引起的全站崩溃

2021.07.13B站崩溃两小时案例：https://www.bilibili.com/read/cv17521097/?from=search&spm_id_from=333.337.0.0

简单的说就是来自Lua脚本语言对字符串和数字界限划分的恶意

# 总结

不管是什么云厂商每年都会发生大大小小的故障异常

不过阿里云2022年的那场事故确实是行业的耻辱柱，相比于那次宕机，一般的异常都是几小时内就能通过预案或者主备思路去提供最基本的服务。

但即使是几小时的异常，对使用他的企业来说可能也会是一次灾难。

所以在每个企业都需要思考自建私有云和服务器的成本，与接收公有云损害的必要

但是除了企业自建服务器外，其实也还可以通过服务层负载 + 公有云负载 的策略：即将负载均衡的服务搭建到不同的云服务厂商上；但是这样实现的问题也是成本昂贵，需要花费几倍数的原金额搭建

所以最好还是再用户体验上进行设计，比方说阿里云崩了，OSS服务失效，那么应用对用户操作的响应\请求等等，都需要结合场景去展示自身的熔断机制信息。



