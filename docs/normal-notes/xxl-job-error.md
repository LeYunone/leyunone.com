---
date: 2024-04-11
title: Xxl-Job踩坑记录
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: xxl-job
  - - meta
    - name: description
      content: Xxl-Job踩坑记录
---
# Xxl-Job踩坑记录

将xxl-job二次开发了，然后在对接于拓展功能的时候发现了一些xxl-job在使用或性能上隐藏的坑；

## 接口请求超时

起初是设定业务方通过http接口调用xxl-job的增删改接口完成对任务的数据操作；

因此直接使用了内置提供的 `XxlJobRemotingUtil` 类的doPost方法进行请求，坑也就这样发现了；

由于http不具备一次请求的熔断或降级机制，唯一可控的就是设定http的请求超时时间。

见xxl-job的历史版本日志：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-11/a195a604-e744-46c0-9013-87ba919b3b3b.png)

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-11/2d8e5f3a-3a76-41c4-bb20-16206b719491.png)

因为我使用的是xxljob的通讯方法，因此也直接沿用了他的3s超时的设置，问题也随之而至；

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-12/fa4a0058-bbde-4d77-8623-857f49aebad9.png" style="zoom:67%;" />

在调用**删除任务**接口时发现无论如何都会出现超时，通过查看代码：

```java
	@Override
	public ReturnT<String> remove(int id) {
		XxlJobInfo xxlJobInfo = xxlJobInfoDao.loadById(id);
		if (xxlJobInfo == null) {
			return ReturnT.SUCCESS;
		}

		xxlJobInfoDao.delete(id);
		xxlJobLogDao.delete(id);
		xxlJobLogGlueDao.deleteByJobId(id);
		return ReturnT.SUCCESS;
	}
```

只是简单的三张表的删除，问题出在`xxl_job_log`表数据量莫名达到了千万级；

最终踩到的坑是xxlJob配置中的一个提示没注意到，清理日期定义了5天<7

```xml
### 调度中心日志表数据保存天数 [必填]：过期日志自动清理；限制大于等于7时生效，否则, 如-1，关闭自动清理功能；
xxl.job.logretentiondays=30
```

**但是经过这次超时体验，连夜将所有与调度中心通讯的http接口改造成了RPC接口。**

## 最大任务数

因为有一个功能设计了开启、暂停，周期设置，因此选择了使用xxljob任务的概念实现功能；

并且由于用户可以最多创建99个这样的定时任务，所以对xxljob任务上线以及最多可以同时开启多少任务需要做到可见可控；

在git的 `issues` 中可以调研的提问：

https://github.com/xuxueli/xxl-job/issues/3071

https://github.com/xuxueli/xxl-job/issues/3079

可以知道，xxl-job默认是不支持这种用户级别创建调度任务的操作的；

但是可以通过部署多调度中心、修改等待队列大小和线程数配置可以达到理想的效果。

不过有一个一定要注意，在xxl-job的前端界面中的任务列表下拉框是全量拉取的，所以按照前端渲染的尿性，一次性渲染千条数据的时候页面就会出现卡顿的情况了；

## 线程并行的混乱

在并发的环境下，xxljob很多设计都会出现线程并行导致的混乱情况

一是 **ReturnT** 类，出现的结果集乱；

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-12/4107be23-7b72-4b07-8e5a-cb76c8fa7c62.png" style="zoom:67%;" />



作为接口，api层的响应参数，并未用final进行修饰；

这也导致了在线程并行时是共享对象的情况，因此如果业务方需要调用api时需要考虑是否会涉及到多线程问题；



二时 **日志** 错乱

因为xxl-job是基于一个任务执行去记录日志，由此使用 `ThreadLocal` 保存日志文件地址当在任务中使用多线程时，两个任务使用同一个线程打印日志，threadLocal只会是其中一个任务的上下文信息（XxlJobContext），导致最终的错乱;

在源码 `XxlJobHelper` 类中

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-12/6bc52616-03bf-4d6a-ae0a-552f6fdfd302.png" alt="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-04-12/6bc52616-03bf-4d6a-ae0a-552f6fdfd302.png" style="zoom:67%;" />

```java

    private static InheritableThreadLocal<XxlJobContext> contextHolder = new InheritableThreadLocal<XxlJobContext>(); // support for child thread of job handler)

    public static void setXxlJobContext(XxlJobContext xxlJobContext){
        contextHolder.set(xxlJobContext);
    }

    public static XxlJobContext getXxlJobContext(){
        return contextHolder.get();
    }
```

但是这里有很难有更适合ThreadLocal的东西去记录一个线程任务的日志，因此目前还没有解决这个问题