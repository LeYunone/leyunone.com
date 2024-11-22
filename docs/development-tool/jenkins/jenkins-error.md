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

仅出现在执行某些非系统指令的时候，比方说在Windows系统中执行tar -zxvf时：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-12/tar.png)

同样会出现：`tar` 不是内部或外部命令，也不是可运行的程序。

这是因为tar.exe在windows中是一段执行程序，在`C:\Windwos\System32` 下。

因此当我们执行的命令为程序时，只可做三种选择：

1. 将其配置到Path环境变量中
2. 通过`cd` 指令跳转到程序目录下，执行指令
3. 使用程序的全路径

比方说上图里，我只需要修改为以下配置即可：

```shell
C:\Windows\System32\tar.exe -zcf  test.tar.gz  test
```

**第三种**

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-12/sh.png" style="zoom: 80%;" />

检查配置中使用的是哪一个命令，`command` 或是 `shell`

如果是shell脚本，则检查第一行`#!/usr/bin/bash`  指定编译环境里有无使用的指令

### 3、系统授权模式设置问题

当使用了 `Role-based Authorization Strategy` 插件做Jenkins的基于角色的RBAC权限控制时，需要注意设置Jenkins授权模式时的选型；

![image-20241112150540209](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-12/image-20241112150540209.png)

- Anyone can do anything（任何用户可以做任何事）
- Legacy mode（传统模式）
- Logged-in users can do anything（登录用户可以做任何事）
- Role-Based Strategy（基于角色策略）

其中传统模式，虽然含义是`任何具有“管理员”角色的人都有完全的控制权，而其他人只有只读权限。` 有一点角色管理的感觉；

不过千万不要选这个，当选择这个保存后，会出现你的所有账号全部变成非管理员，而无法重新设置授权模式，相当于系统完全不能使用了，因为这个管理员账号，在目前版本并没有地方可以设置，这个模式相当于是遗留模式，兼容从旧版本升级上来的Jenkins使用。

这时候就只有一个办法：重置初始化系统的授权设置；

找到Jenkins工作空间中的配置文件：`config.xml`

![image-20241112174329860](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-12/image-20241112174329860.png)

删除

```xml
  <useSecurity>true</useSecurity>
  <authorizationStrategy class="hudson.security.FullControlOnceLoggedInAuthorizationStrategy">
    <denyAnonymousReadAccess>true</denyAnonymousReadAccess>
  </authorizationStrategy>
  <securityRealm class="hudson.security.HudsonPrivateSecurityRealm">
    <disableSignup>true</disableSignup>
    <enableCaptcha>false</enableCaptcha>
  </securityRealm>
```

重启即可

### 4、SSH连接不上

在配置 **SSH remote hosts** 时，检查 `check connection`   连接状态，有时会出现连接不上的情况；

这里列出几种情况：

1. 目标服务器防火墙拦截住了22端口
2. 目标服务器被SSH连接次数过多，这种情况在私有服务器中很容易出现。原因无他：来自他反的扫IP的恶意攻击，导致服务器通道占有。这时候需要结合服务器日志，使用黑名单功能客观处理
3. 在 **SSH remote hosts** 中timeout列数字填大，默认时间为120秒当然够用，但是涉及带宽区域问题何不可拉大
4. 在配置 **SSH Servers** (文件传输服务器)中，SSH失败，检查当前文件夹权限，最好设置为777

### 5、MAVEN项目构建失败

```
Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.6.1:compile (default-compile) on project businessServer: Compilation failure: Compilation failure:
```

当构建打包时，报出这个错误，无疑是MAVEN插件环境的问题；

解决方式分两个步骤：

1. 在项目中pom.xml里指定打包环境jdk版本的MAVEN版本

2. 在Jenkins配置中设置打包环境中的JDK版本为8

   ![image-20241113113308556](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/2024-11-13/image-20241113113308556.png)

还有一种错误，导致构建失败，即依赖的JAR包更新了，但是Jenkins使用的依然是本地的jar包文件。在版本号未更新的前提下，并不会重新从仓库更新覆盖依赖；

这时候只能手动在服务器中删除目标依赖的Jar包，重新拉取构建；

除此之外，还可选择工作空间作为依赖目录

![image-20241113112953560](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-11-13/image-20241113112953560.png)

然后再构建后，执行删除整个工作空间的命令，这样一来每次构建项目都会自动的重新拉取所有依赖，不过构建时间必然会长很多；

### 6、...

