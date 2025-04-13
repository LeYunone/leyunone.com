---
date: 2025-04-10
title: SonarQube编程软件集成和服务器规则共享
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: SonarQube
---
# SonarQube

SonarQube是一款代码审查工具，关于他的基本信息和其强大的功能通过官方文档 [SonarQube for IntelliJ Documentation](https://docs.sonarsource.com/sonarqube-for-ide/intellij/) 和问及AI可获知；

本篇仅介绍：**我们如何在团队中通过对SonarQube和插件的设置，半强制性的自定义规范在IDEA或Vscode等编程工具中的提交动作（Git bash指令提交不在范围内）**

## 安装sonarqube

**提前准备：**

- JDK1.7版本：https://mirrors.huaweicloud.com/openjdk/17.0.2/
- sonarqube：https://www.sonarsource.com/products/sonarqube/downloads/

**安装：**

1、解压sonarqube.zip

![image-20250411201202253](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411201202253.png)

2、进入目录

```bash
cd /opt/sonarqube/sonarqube-25.4.0.105899/bin/linux-x86-64
```

3、运行脚本

- 启动 sudo sonar.sh start
- 停止 sudo sonar.sh stop
- 重启 sudo sonar.sh restart
- ...

注意登录账号和文件夹权限问题

## sonarqube配置

页面：http://yourIP:9000/

账号：admin（默认）

密码：admin（默认）

**中文插件**：

![image-20250411202142402](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411202142402.png)**导航：** 页面最上面

- 项目：必须有一个，应用在Idea的项目中；可关联jenkins、Gitlab等CI/CD流水线
- 问题：
- 代码规则：查阅已有的配置项下的代码规则
- 质量配置：管理各个语言下的代码规则配置
- 质量门禁：设置代码被扫描结果的通过阈值
- 配置：

关于质量配置与代码规则的关系，如下图：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411204113871.png)

因为默认自带的配置和规则无法删除变动，如果我们要自定义自己的规范，则需要在质量配置页面创建一个配置A

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250412084932867.png" style="zoom:67%;" />

- 扩展现存质量配置：继承一个配置里的代码规则
- 复制现存质量配置：复制一个配置里的代码规则
- 创建空质量配置：无代码规则，从默认规则中自选

随后在找到该配置项自定义激活各条规则，规则包括

- 默认自带的522条
- 通过xml文件导入的自定义规范

## Idea配置

下载插件

![image-20250411204610183](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411204610183.png)

1. 连接部署的sonarqube

   1. ![image-20250411204653304](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411204653304.png)

   2. ![image-20250411204755488](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411204755488.png)

   3. ![image-20250411204806636](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411204806636.png)

      token来自sonosqube页面，右上角My Account->安全

2. ![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250412111347201.png)

   选择在sonarqube中创建的项目，并且关联到Idea项目的根模块

3. ![image-20250411205124022](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411205124022.png)

   在sonarqube页面中设置该项目关联的我们自定义的质量配置

4. ![image-20250412111414415](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250412111414415.png)

5. 结束

## 效果

完成上述配置，可：

- 获取在服务器上设置的代码规范规则，并且用以sonarqube插件审查

- 代码提交前，进行自动审查并且提示问题和其解决方式，例如：

  <img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411205514761.png" alt="image-20250411205514761" style="zoom:50%;" />

![image-20250411205544248](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2025-04-12/image-20250411205544248.png)

- 可集成到CI/CD流水线上，添加打包规则，强制实行代码规范

## TIP

在Idea中Sonarqube规则的加载，只会在当前项目被打开的时候（指重新开一个窗口或新重新开Idea）才会被加载；

因此 首次配置和后续服务器更新了规则都需要重新打开项目

~~感觉是Sonarqube For Idea插件的问题~~

## 总结

并没有提及sonarqube集成到CI/CD部分，因为我觉得作为一个开发乃至团队中制定规则的人，从源头也就是帮助开发人员在提交代码时审查代码更重要；

然而网络上并没有一篇关于sonarqube如何在编程软件中集成，以及如何连接服务器并使用服务器中的代码规范，因此专门出一篇以作记录
