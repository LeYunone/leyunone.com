---
date: 2024-11-11
title: Jenkins异常及解决笔记
category: 
  - 插件
tag:
  - 插件
head:
  - - meta
    - name: keywords
      content: jenkins
---
# Jenkins异常及解决笔记

## 前言

从jenkins搭建到装载使用，自动部署，整个完整的流程已经在windows、linux不同系统上搭建了三套、三次。其中涉及多为`H5`、`Vue`、`Java`...项目，部署服务全为linux服务器上。

但是，即使让我再次搭建一次jenkins，第4次、第5次....也依然，肯定会遭遇奇奇怪怪的异常。也因此专开一篇，记录遇到的错误和解决方案；

## 正文

jenkins异常主要分为两种类型：

1. 来自jenkins内部问题
2. 出自jenkins部署的项目、服务器部分

### 1、控制台输出乱码问题

最直观的错误，简在项目部署`控制台输出`中，中文变为乱码；

解决步骤为：

1. **Configure System**添加属性

   ![image-20241107112658404](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-07/image-20241107112658404.png)

2. 修改jenkins.xml配置文件

   ```xml
    <arguments>... -Dfile.encoding=utf-8 ...</arguments>
   ```

   在arguments标签中添加 `-Dfile.encoding=utf-8`

3. 重启jenkins，查看 **System Information** 检查系统属性中是否出现：

   `file.encoding` = `utf-8`

### 2、xxx不是内部或外部命令，也不是可运行的程序 

当部署项目执行`shell`命令时很容易出现的错误，从字面上看很简单，**找不到命令** 指Jenkins在他的运行环境中匹配不到你给的指令；

在你确信你的系统中有这个指令的前提下，有三种可能：

1. Jenkins默认的运行环境变量中，未涵盖你的指令
2. 你的指令并非环境变量配置，而是一段程序
3. Jenkins配置错误

**第一种**

Windows中的Jenkins，我在一次构建Vue项目中理所当然的配置了命令：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-11/NPM.png)

构建时报错：`cnpm ` 不是内部或外部命令，也不是可运行的程序。

而Windows和Linux在指令区分上的最大区别：前者只依靠系统环境变量中Path的设置，后者则依靠/bin 目录下的软链接指令；

所以在Windows下的Jenkins里执行一段命令，一定需要将其命令配置在Jenkins的环境变量中，所以需要执行以下指令：

1. 键盘Win+R，输入CMD

2. 查看path指令

   ![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-11/PATH.png)

3. Jenkins界面：Manage Jenkins  》Configure System 新增配置：

   ![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-11/pathcmd.png)

而在linux中，出现该错误时，仅仅只需要确认目标指令是否在/bin 目录下即可；

**第二种**

仅出现在执行某些非系统指令的时候，比方说在Windows系统中执行tar -zxvf；

我们知道Windows在系统层面并没有支持tar打包命令，
