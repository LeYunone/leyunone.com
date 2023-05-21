---
date: 2021-09-23
title: GitHub错误异常解决指南
category: Git
tag:
  - Git
head:
  - - meta
    - name: keywords
      content: GitHub,乐云一,错误异常解决指南
  - - meta
    - name: description
      content: 记录使用GitHub过程中的异常和解决方式
---

> 记录使用GitHub过程中的异常和解决方式
# 交不上代码类
## 1、can't push
:::align-center
![QQ截图20210923143418.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-23/QQ截图20210923143418.png)
:::
**场景：** 多出现在，新创建项目后idea共享到git仓库，交代码的时候，出现错误error.
**原因：** https://github.com/LeYunone/reptile.git，这种类型的地址协议为只读protocol，不支持push。
**解决方案：**
在项目对应文件夹下cmd控制台输入：
```
1. git remote rm origin  [移除当前节点]
2. git remote add origin git@github.com:[用户名]/[项目名].git  [添加新节点，节点url为git@类型，支持push]   
```
## 2、ssh密钥问题
:::align-center
![企业微信截图_20211209140011.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-12-09/企业微信截图_20211209140011.png)
:::
**场景**：出现在使用新电脑交代码时，或者手贱把github的密钥删除时，出现error。
**原因**：在一台电脑上需要使用github交代码到某个账号仓库，需要该这个电脑下的git的SSH密钥与账号上的SSH密钥相匹配。
**解决方案**：
[解决方案链接](https://www.cnblogs.com/desireyang/p/12052861.html)
```
分为两步：
1、如果电脑里已经生成了github的SSH密钥，则在c:用户\user\.ssh 文件夹里找到id_rsa.pub[公钥]然后进行第二步
```
**第二步：**
![企业微信截图_20211209141509.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-12-09/企业微信截图_20211209141509.png)


#  修改配置类

##  1、修改用户名和邮箱

```
1.git config --global user.name "用户名"
2.git config --global user.eamil "邮箱"
```
