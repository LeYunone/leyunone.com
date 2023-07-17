---
date: 2023-04-16
title: Jenkins-自动部署项目
category: 
  - 插件
tag:
  - 插件
head:
  - - meta
    - name: keywords
      content: jenkins,乐云一,插件,自动部署,脚本
---
# Jenkins-Windows

## 部署前

https://www.jenkins.io/download/

![image-20220818195013955](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/69c3f79e-bd02-417f-b87c-fe697d56c775.png)

下载.msi安装包，跟着提示下一步，安装成功：在网页打开:https://localhost:xxxx； xxxx是安装时设置的端口



## 设置

打开页面后：

![image-20220818195320162](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/bc9bbb52-700f-449c-9df0-03bc07694461.png)

其余跟着提示下一步，完成初始化设置，进入页面。

### 修改JenKins工作空间

![image-20220822113030358](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/5d5151a9-9103-4c16-8b57-136c44c5e272.png)

![image-20220822113044695](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/49869a63-c853-4464-9ff6-77786a44a8f3.png)

![image-20220822113943545](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/d6d6db5e-8f76-4a65-9eb1-388dfabeb6a5.png)

在安装Jenkins目录下，找到jenkins.xml。

 ```xml
<service>
  <id>jenkins</id>
  <name>Jenkins</name>
  <description>This service runs Jenkins automation server.</description>
  <env name="JENKINS_HOME" value="%ProgramData%\Jenkins\.jenkins"/>
</service>
 ```

修改 **env**  标签中的value，值为修改后的工作空间路径

**工作空间**：JenKins关联项目打包产生的缓存及包，以及GitLab拉取的代码和Jenkins工作缓存的存储空间。

**TIP**：1、注意如果需要修改工作空间，则在修改前不进行插件、项目等的关联、安装。

​		  2、JenKins在Windows环境下为系统服务，修改前后需在服务中将名为Jenkins的服务重新启动

### 修改国内镜像

进入Manage Jenkins >> Manage Plugin >> Advanced，将最下面的Update Site URL更改为：

```
https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json
```

修改服务器配置：打开Jenkins工作目录下的\updates\default.json

将其中的体内进行替换：

```html
updates.jenkins.io/download/plugins -> mirrors.tuna.tsinghua.edu.cn/jenkins/plugins
www.google.com -> www.baidu.com
```

重启Jenkins服务

### 安装插件

![image-20220822134654939](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/4d08766c-33cb-49a1-bc50-95c88985f754.png)

![image-20220822134911435](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/b8898b40-6b7f-4cfc-aa70-7491cc95a11b.png)

推荐安装以下插件：

- Git plugin
- GitLab plugin
- Maven Integration plugin 
- Localization: Chinese 【中文插件】
- Publish Over SSH【SSH连接器】
- Safe Restart Plugin【安全重启插件】
- SSH server 【SSH节点插件】

### 全局配置

![image-20220822141129341](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/357c176b-1913-42aa-a431-cad2fb4ad48b.png)

依次从上往下配置：

1. ![image-20220822141206864](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/257f6dcf-ac46-4473-bc60-de234befb997.png)
2. ![image-20220822141217264](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/049b2778-249a-4433-a99f-744e39f33391.png)
3. ![image-20220822141227146](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/95388b0f-aee3-48ff-96a2-29c35c290cd5.png)
4. ![image-20220822141242855](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/83460253-ddc3-4ea7-81c3-92410b711a68.png)

### 系统配置

![image-20220822142949199](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/4ef85295-7691-4330-a079-6eb78bbc058c.png)

#### Jenkins访问端口

![image-20220822143325987](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/d260371d-8ffd-4a82-8b13-04368596d994.png)

#### SSH节点

![image-20220822143439148](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/ce63342d-d53a-4fb9-b817-14b1968317df.png)

**TIP**： 注意合理设置timeout，SSH的默认连接时间大多超过秒级，所以控制在3000ms内即可

#### SSH连接器

![image-20220822143634704](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/811c422b-c060-4cec-a526-81082cc94c59.png)

**参数介绍**：

1. Passphrase【连接密码】
2. Path to key 【秘钥路径】
3. Key【秘钥】
4. Name【本连接器名称】
5. Hostname【服务器主机address】
6. Username【连接用户名】
7. Remote Directory【本次连接指向的服务器路径】

## 部署项目

![image-20220822143937923](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/7950e53e-431a-4e61-a1ef-3e848f286b4c.png)

![image-20220822144128192](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/7942c21e-df30-4368-b0eb-814d5d4be704.png)

### 基本设置

![image-20220822144243858](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/949e0586-892b-410d-bbab-7ec6769f7ed9.png)

1. 策略【Log Rotation 日志循环】
2. 保持构建的天数【超过设置天数的构建记录将被删除】
3. 保持构建的最大个数【构建记录中只会存在X个记录，新加记录将删除最远旧记录】

![image-20220822144920078](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/9c0163e5-ac1c-4dcd-af80-931d555eef2d.png)

这些推荐使用默认，也可以根据需要选择，作用名如其名

### 源码管理

![image-20220822145038993](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/774baabe-5727-49e5-b6b0-cd59a33bc9a8.png)

**TIP**： 指定分支，一定需要 指定到具体的分支上，比如*/release ，这里的 * 代表全匹配，一般在Git不设置的情况下都是 origin

### 构建触发器

![image-20220822145424895](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/750ed050-e318-40c7-b52d-21073caf185b.png)

触发器的功能：当条件触发时，本项目将自动项目构建、打包、部署

1. Build after other projects are built【当指定项目构建后，触发。指定项目为在Jenkins中配置的项目】
2. Build periodically【定期触发】
   1. Build when a change is pushed....【当Git中有更新分支推送上来时，触发。不推荐】
3. ...
4. ...
5. Poll SCM【时间轮询，在自定义时间的时间片中，将定时的去返回Git查询有无更新分支，如果有则触发】

### 构建前

![image-20220822150858744](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/6e99f239-0c49-48dc-9f99-c6d986a2018a.png)

如果项目需要在构建前进行一些系统变量或配置文件的更改与新建，则可以通过以上两个，实现SSH远程调用Shell脚本/执行目标服务器的Shell脚本/执行目标服务器的命令/SSH传输文件的方式进行配置

![image-20220822151617278](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/6438dcce-650d-44fd-adc8-ad11110b41b5.png)

设置打包命令以及根依赖文件。

```
clean -Dmaven.repo.local=F:\MAVEN -DskipTests=true install -P gvsmaven,alimaven,releasemaven
```

### 构建

![image-20220822154141075](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/266e20ed-9262-4e2f-98f9-631b3519c4b0.png)

构建步骤，一般步骤为：

1. 删除就Jar包备份，拷贝当前服务器下该项目已存在，运行的Jar包作为备份。

   选择**Execute shell script on remote host using ssh**

   ![image-20220822154601403](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/fc350d94-018e-4189-bb00-928c9049d710.png)

   SSH site 为在系统配置中配置的**SSH节点**

   Command为在目标服务器中执行的 Linux 指令

2. 将最新的代码打包，发送给目标服务器

   选择 **Send files or execute commands over SSH**

   ![image-20220822161534049](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/ffffdd99-fcbd-4515-a9bd-27060603b9a0.png)

   1. Source files 【打包后的jar包目录，绝对路径指向jenkins的工作空间，.jenkins/workspace】
   2. SSHServer【SSH连接器】
   3. Remove prefix 【打包后，去掉的文件名路径前缀，这里一定要去，不然到服务器中文件指向路径会是 指定的目标目录/工作空间路径/*.jar 】
   4. Remote directory【文件传输目录，这个路径会和SSH连接器中的**Remote Directory** 进行拼接】
   5. Exec command【在本服务器中执行的命令】

3. 在目标服务器中运行该jar包/war包

   如果是way包，那么不需要管，只要准确的将war包发送至目标服务器的webapps目录下

   如果是jar包：

   1. 直接运行jar包，【已知目标服务器已搭建Jdk环境，jar包自带Tomcat】

   2. 通过Shell脚本运行

      选择**Execute shell script on remote host using ssh**

      ![image-20220822165707022](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/f6385193-52ba-48ab-a2e3-e914de3adfc1.png)

### 构建后

![image-20220822170034711](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/e1a04ea7-12f0-48d1-bf7e-f882b6ae7fd1.png)

![image-20220822170102195](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/103c2b00-e3f1-45ed-bd47-a202a93495aa.png)

## 邮件通知

1. 下载[ **Email Extension**] 插件
2. https://blog.csdn.net/mengtao0609/article/details/123867919

# Jenkins-Linux

## War包

![image-20220822185054647](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/a223f284-7d54-4fc3-a34c-e1c4b7d301a1.png)

按照正常的war包应用，将下载到的jenkins.war包放到Tomcat的webapps目录下，并且访问其localhost:XXXX/jenkins。

其余设置与上述配置一模一样。

## Docker

下载镜像

```latex
docker pull jenkins/jenkins
```

查看jenkins镜像

```
docker images
```

![image-20220822185959909](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/2768bfcb-2a88-406c-a697-b8c9e455af43.png)

创建工作空间

```
mkdir -p /home/jenkins_home
```

启动

```
docker run -d -uroot -p 9095:8080 -p 50000:50000 --name jenkins -v /home/jenkins_home:/var/jenkins_home -v /etc/localtime:/etc/localtime jenkins/jenkins
```

| 命令                                    | 意义                                                         |
| --------------------------------------- | ------------------------------------------------------------ |
| -v /home/jenkins_home:/var/jenkins_home | :/var/jenkins_home目录为容器jenkins工作目录，我们将硬盘上的一个目录挂载到这个位置，方便后续更新镜像后继续使用原来的工作目录 |

查看日志

```
docker logs jenkins
```

![image-20220822190414219](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-04-16/288f4186-2d79-436b-a70e-93475e069ed0.png)

在/initialAdminPassword，查看初始化密码。

访问Jenkins：localhost:9095，后续配置与上述一致
