---
date: 2024-03-08
title: Git存储库的推送保护
category: Git
tag:
  - Git
head:
  - - meta
    - name: keywords
      content: GitHub,乐云一,Git存储库的推送保护
  - - meta
    - name: description
      content: Git存储库的推送保护
---
# Git存储库的推送保护

昨天有一个提交一直提示：Push rejected

```
Push rejected
Push master to origin/master was rejected by remote
```

起初在网络上找各种解决办法，先列举以下找到的各类方法

1. 提交用户的用户名和邮箱与Git不一致，这个只需要通过git config user.name /eamil 去配置查看核对
2. 提交分支被保护，一般是非本人所有全项目，创建者默认保护master分支，另外的则是特定设置的分支。此状态只需要到对应的项目中，Setting->分支/仓库去查询protected的分支
3. 代码版本不一致，存在回滚型代码，只需要将代码版本pull到最新
4. `git pull origin xxx --allow-unrelated-histories` 强制推送，存在覆盖已提交代码问题



以上是随手找的解决push rejected的办法及原因，不过本篇要提的则是因为 Git 的 **推送保护** 机制导致push rejected

## 怎么出现的

首先是如何发现推送的代码被Git的保护机制拒绝的；

因为Push rejected，在查找网络上各种办法都无效后，直接通过控制台 `git push` 推送，查看推送日志；

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-03-08/7585fa33-4a46-45c6-9535-ebc64c8e4cf0.png" style="zoom:67%;" />

发现报`GH013: Repository rule violations found for refs/heads/master` 错误，接着往下看。

则是分别提示`Login with Amazon OAuth Client ID` 和 `Login with Amazon OAuth Client Secret` 

并且给到了具体什么类，第多少行的问题；

通过给出的帮助文档 [https://docs.github.com/zh/code-security/secret-scanning/push-protection-for-repositories-and-organizations](https://docs.github.com/zh/code-security/secret-scanning/push-protection-for-repositories-and-organizations)

发现了GIT原来存在 `secret` `key` 扫描的执行动作，而我一致被 `push rejected` 的原因则是因为在 `AlexaTokenManager` 类中疑似泄露了Alexa的客户端密钥和ID。

## 这是什么

查阅文档，结合翻译

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-03-08/d85e5883-44e3-42fc-ad3f-3b08f6f4bf1f.png)

了解到Git会使用它的 `secret scanning`扫描所有的提交代码，并提供机密保护，阻止推送；

关于阻止原因以及如何设置不阻止，指定阻止，在文档中都有详细的说明。

比方说禁用推送保护：

![https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-03-08/2e29ab0c-e38c-49fa-8814-a10f8d544116.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-03-08/2e29ab0c-e38c-49fa-8814-a10f8d544116.png)

因为文档写的太过完美，所以我更推荐大伙去查看，GitHub非常贴心的准备了中文简体的文档；自己看的，确认到的，总比他人传阅的更击灵魂。

## 密钥扫描器

先贴上GitHub默认配置的所有密钥文档 [https://docs.github.com/en/code-security/secret-scanning/secret-scanning-patterns#supported-secrets](https://docs.github.com/en/code-security/secret-scanning/secret-scanning-patterns#supported-secrets)

我是因为泄露了`amazon`的密钥，而惨遭拒绝的：

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-03-08/41bbeeca-a8ac-4611-914b-44a4c4421613.png" style="zoom:67%;" />

它的扫描原理想一想很简单，这个世界上所有"大型"企业，或GitHub的合作商将自己的密钥标本提供给GitHub。

GitHub就只需要通过标本转换为 hash值还是什么，总之不可能是字符串匹对形式，去匹对所有的提交文件；

这里有一个有意思的地方是，虽然表中有记录alibaba_cloud的key和secret。

但是关于阿里云的具体云功能的密钥，比如oss，都没有标本给到GitHub。

再加上本人测试，合理怀疑有盈利关系的服务产商密钥，很少会出现再GitHub密钥扫描器中。

