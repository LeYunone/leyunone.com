# 单体架构>微服务?

微服务，这个从互联网兴起开始也跟着大伙大热的概念，在最近几年里，无论是平时架构设计或是面试中都会提及；

你们有多少个服务？用的是什么通讯....

虽然在平时接触的项目中大多是围绕各种子服务搭建起来的体系，但是在最近经常出现一个非常非常诟病的问题：

- 服务在进行私有化部署时（应用未在我方侧，而是在客户侧部署）， 由于各服务的执行顺序、数据库版本、配置信息....等等的不一致导致即使采用指令编排也会出现不同程度的错误

而在解决这个问题的过程中，思路停留在了一个问题上：单体架构与微服务，两者可否相对兼容，即使用单体架构的思路引入微服务

## 问题案例

假设目前我有一个应用A，它是由用户中心、消息中心、第三方服务、

