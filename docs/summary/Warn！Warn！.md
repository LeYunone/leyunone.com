---
date: 2023-03-06
title: Warn！Warn！标准版[严肃。]
category: 
  - 乐云一
tag:
  - 乐云一
head:
  - - meta
    - name: keywords
      content: 服务器,生活,Linux,程序员,代码,Java
  - - meta
    - name: description
      content: 技术、生活、游戏、工作等等警示
---
# 警示，标准版

## 服务器(Linux)上

### 1/ gcc版本

```xml
Node 18.0以上版本 需要gcc-8以上版本支持
但是
一般云服务器上gcc默认版本都是4.5左右
所以必须，只能升级；
但是如果不是非必须，不碰gcc为好，因为升级版本的操作是手动编译gcc的过程；
教程：
https://blog.csdn.net/qq_38225558/article/details/128641561
```

### 2/注意密码

![](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-06/052b7683-a565-4cbd-b3e0-2c7ce8a1436b.JPG)

![](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-06/838658c0-c7b0-4f21-9856-56c7ce8cc122.JPG)

以上是服务器开放3306端口后，不注重Mysql连接密码的后果【所有数据库被删除+root用户被篡改】；

原因：被全球的IP端口扫描器攻击，然后密码字典直接暴力破解【123456】，不止如此，Jenkins、Granfna...等等，在开放端口后都会存在此问题；

解决：密码复杂化，尽量将服务部署在Docker中【方便恢复，直接删除，重新装载镜像】

## 代码(JAVA)上

### 1/遍历循环中的IO流

```
背景：后端文件分片下载功能，合并文件块中，遍历所有文件块，将文件块IO流拼接后，删除原文件块
```

![](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-06/2aeb0b6e-689b-454b-a214-0ad9351a011a.png)

**问题**：左边错误，右边正确；造成的影响，按左边的BUG，出现：在文件通过遍历每一个文件块合并成一个最终完整文件后，无法删除文件块文件；**因为在For循环中通过循环外的文件流对象，重新new出文件块对象，无法释放文件块对象的资源**；在删除时，报文件被Java程序占用。

## 生活

### 1/信念

```
快乐是可以具象化的！
```

