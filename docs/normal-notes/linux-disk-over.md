---
date: 2024-06-26
title: Linux磁盘空间百分百占满事故
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: Mysql,Linux,垃圾清理
---
# Linux磁盘空间百分百占满事故

服务器磁盘占满在一个新服务器中非常容易出现首杀，因为总有项目或插件或日志甚至不知名挖矿病毒把我们的服务器占满；

于是乎本次由于磁盘占满导致的事故的前因后果，在我看来是每一个"萌新"服务器的必经之路；

## 事故回顾

很简单，一个列表，一个新增；

调用接口查询时可正常返回，新增数据时接口卡死直到返回504超时；

并且项目后台无报错、Nginx代理无异常、网关转发无报错；

作为~~老~~Javer，一眼鉴定为服务器\网络问题；

于是从网络状态，服务器状态一一排除法定位，快速找到了数据库所在服务器磁盘爆满（该服务采用的是在云服务器部署的数据库）；

体验到了当服务器硬盘内存占满时，数据库会出现什么反应；

此外当我们清空一部分垃圾文件时，发现依然未生效，最终解释为：

**Linux中的日志文件很容易被其余文件占用，不像Windows占用时无法删除，Linux文件使用时可以被删除，所以还需要KILL掉正在读的进程或重启服务器**

本篇将总结与记录：

1. Mysql数据库在磁盘满时
2. 什么情况下会占满
3. 清理磁盘小技巧

## Mysql的反应

查询接口正常返回，写入操作卡死；

证明了Mysql内部存在一个内存检测机制：

**当Mysql检测到磁盘空间不足时，会停止接受一切写入请求**

包括更新，插入，删除...等操作内存空间的操作。

那么为什么会卡死，我们期望的是mysql直接返回异常错误，这取决于Mysql的一个机制；

在Mysql检测到磁盘空间不足时，默认是将当前情况定为暂时的。会进行每分钟一次的检测，空间是否存在释放，当发现有空余空间时则会继续写入，这也是保证Mysql的稳定性。

那为什么查询操作并不会受到影响？

这是由于Mysql的查询执行流程全然由已经加载好了的各种执行器，优化器，分析器从内存页中找到结果。

**总结**：

当磁盘占满时，Mysql会停止并卡住所有内存操作请求。所有的读请求，包括数据查询，表结构查询都不会受到影响；

## 占满的可能

总结一下经历过的各类服务的各种占满磁盘的原因：

- Docker文件

  在以Docker为容器部署项目时尤为可见，比如JDK项目；除了项目本身生产Log4j日志文件外，每一个Docker应用都会维护一份自己的.log文件；并且其日志驱动的默认配置为`json-file`，默认大小一般为100M。而且以Docker启动的JDK项目在再次部署时所运行的脚本常见的是新建，覆盖型；当版本不一致时也不会清理掉原先的项目日志；

- Jenkins依赖

  当服务器中部署了Jenkins时，需要关注Jenkins打包项目时所使用的依赖路径；比如Maven项目，一定需要在配置中指定本地依赖包路径，否则很容易出现每个项目的工作空间中都维护自己的一份MAVEN依赖；

- Linux系统文件

  老生常谈的缓存，更新，备份等等垃圾文件过多导致无磁盘内存问题，不过这一类很容易在达到阈值前被发现；其中通过命令下载（如APT、YUM等）下载的软件包可能会被缓存下来，系统备份文件一般会占用大量空间

- 内存交换文件

  如果系统使用交换空间（swap），交换文件可能会增长并占用大量磁盘空间。

- 数据库问题

  当一张表的数据量达到1千万，内存至少也到了500M；那么如果没有对一些执行器/收集器做出限制，很容易出现一个月下来服务不知不觉的磁盘占满；比如XXL-JOB的执行日志，官方有一个设置定时清理日志时间的配置 `清理时间一定大于7天`，曾经设置5天，清理未生效于是出现磁盘占用过大的问题；还有Skywalking类似的链路追踪日志系统，当设置日志等级为DEBUG时，若未设置合理的存储时间，一定会占用大量空间；

- .....

## 清理技巧

扫地，大伙都知道都是先找到垃圾，然后将其扫进垃圾桶，所以我们也必须先找到占用大空间存储的文件。

**1、使用 `dh -hl`**

![1](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-26/1.png)



![2](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-26/2.png)

会出现两种方向：

1. 图一占用文件为 `/dev/vda{?}` ，模糊不清；
2. 图二可直观看到是docker中的容器占用；

图一的`/dev/vda1` 指的是Linux系统中虚拟机或物理机上磁盘的第一个分区，因此无法看到具体的目录文件

**2、使用 `du -sh *`**

![3](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-26/3.png)

当`df -hl`无法直接定位到文件时，可以使用该命令将当前文件夹下的所有文件和目录的总占用列出来

所以我们可以根据那个文件大找哪里的提示一路向下寻找；

**3、使用 `find /{路径} -type f -size +100M`**

该命令会将指定目录下的所有大于100M文件列出来，阈值可以设置

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-26/4.png)

推荐熟悉自个服务底细的人使用，暴力且精准。但是如果你对这些文件及文件夹无法拿捏一定不要使用次命令去定位垃圾文件；

**4、du -ah /{路径} | sort -rh | head -n 10**

 ![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-26/5.png)

排列出路径下文件前10的文件， 数量可以设置，意义于`du -sh *` 一样，属于一步步定位的必需品；

**5、定时**

一个健康的服务器是一定要设置定时任务用来清理系统中累计的垃圾文件的。

除了使用Linux支持的Shell脚本结合linux的cron任务写入类似：

来自网络：

```shell
#!/bin/sh
currDate=`date +%Y-%m-%d`
currDate8=${currDate//-/}
##！@NOTE:数据文件夹清理，适合删除日期文件夹是八位的，如20230808
##！@IN: 1 -> 需要删除的源文件路径
##！@IN: 2 -> 保留天数
##！@SAMPLE: fClearFold sourceDir saveDays
function fClearFold
{
	local sourceDir=$1
	local saveDays=$2
	dateFoldArr=`ls $sourceDir` 
	for dateFold in ${dateFoldArr[*]}
	do
		#文件夹都是2开头的
		if [[ ${dateFold:0:1} -eq "2" ]];then
			dateCompare=`date -d "$currDate8 - $saveDays day" + %Y%m%d`
			if [ $? -eq 0] [[ $dateFold -le $dateCompare ]];then
				rm -rf $sourceDir/$dateFold 
			fi
		fi		
    done
}
#调用方法清理文件夹,保留30天
fClearFold /home/test/data 30
```

这里我非常推荐使用Jenkins，帮我们管理指令和定时动作：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-27/6.png)

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/2024-06-27/7.png)

可以看到可以非常简单的设置出每8天一次，执行清理/opt/developer/app/logs下的日志文件和docker中的json.log日志文件