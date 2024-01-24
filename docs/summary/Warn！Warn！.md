---
date: 2023-03-06
title: Warn！Warn！标准版[严肃。]
category: 
  - 乐云一
tag:
  - 乐云一
sticky: 999
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

### 2/ 注意密码

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-06/052b7683-a565-4cbd-b3e0-2c7ce8a1436b.JPG)

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-06/838658c0-c7b0-4f21-9856-56c7ce8cc122.JPG)

以上是服务器开放3306端口后，不注重Mysql连接密码的后果【所有数据库被删除+root用户被篡改】；

原因：被全球的IP端口扫描器攻击，然后密码字典直接暴力破解【123456】，不止如此，Jenkins、Granfna...等等，在开放端口后都会存在此问题；

解决：密码复杂化，尽量将服务部署在Docker中【方便恢复，直接删除，重新装载镜像】

## 代码(JAVA)上

### 1/ 遍历循环中的IO流

```
背景：后端文件分片下载功能，合并文件块中，遍历所有文件块，将文件块IO流拼接后，删除原文件块
```

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-06/2aeb0b6e-689b-454b-a214-0ad9351a011a.png)

**问题**：左边错误，右边正确；造成的影响，按左边的BUG，出现：在文件通过遍历每一个文件块合并成一个最终完整文件后，无法删除文件块文件；**因为在For循环中通过循环外的文件流对象，重新new出文件块对象，无法释放文件块对象的资源**；在删除时，报文件被Java程序占用。

### 2/ 注意使用

#### 搜索引擎

```
Lucene很不好用，因为他的分词器好垃圾...
```

#### Spring

```
有idea自动生成 别去折磨自己一个个创建文件，另外记得用：https://start.aliyun.com 找服务
```

#### Lombok

```
如果有人和你说这个东西好用，你可以叫他去网上搜Lombok的坏处。
如果有人和你说这个东西垃圾，你可以叫他去网上搜Lombok的好处。
总而言之：项目组用我就用，反正我自己的项目一定用，谁不想偷懒呢？ ╮(╯▽╰)╭
```

#### @Value

```
@Value(XXX)
private String xxx;
```

在这里记录的原因是要注意，当属性为static修饰静态时，无法正常的加载注释使用。
想要正常的使用，但又要修饰静态，只能在使用属性的方法上使用@Value

### 3/ 小心事务

```markdown
在被@Transactional标记 或手动控制一个方法的事务 中
使用Sqlsession.commit
无法提交事务
```

## 工具上

### 1/ IDEA 运行找不到或无法加载主类

在项目没有问题的前提下，大概率是项目还没加载模块化的时候就强行切断进程，因此网络上对该问题的解决方案都是去补全里面的文件,比如运行如下命令`mvn idea:module` 

### 2/EasyExcel-poi-计算

导出存在计算涉及到图片-单元格宽高时，一定要注意：

通过Cell类获取到的

`单元格宽单位=1/256` 、`单元格高单位 = pt` 

通过图片类获取到的

`图片高，宽=px`

图片的`.resize(x,y)`方法，其中x，y的取值是百分比小数0-1、1-2

并且当为1时，理论表明占满宽/高，但是会随着偏移dx1、dy1变化

### 3/EasyExcel-poi-合并单元格宽

通过Cell类获取的单元格宽，只会是当前单元格的宽。

即使该单元格已经被合并，如需拿到合并后的总宽，需要通过反过来遍历所有单元格，通过下标判断拿到合并的单元格，然后计算总和；

## 数据库上

### 1/ 小心Null

数据库字段为Null时，一个不合理但又在情理之中的设计

```sql
SELECT * FROM t_test WHERE name != '1' 
按照!=逻辑，应该是会把 id为 2，3，4 的数据查出来
```

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-28/8adeada3-e135-4981-9920-a2ac1081c7c8.png)

**但是，null字段不参与!= == 的判断中，所以最终结果只有Id为4的数据**

### 2/ IFNULL结果不参与排序

```sql
SELECT IFNULL(no,99) FROM t_test ORDER BY no
```

本意是根据no排序，如果no为空则赋值99；但是IFNULL是在返回视图中，在MySql条件引擎执行之后，所以会变成先排序，再赋值：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-28/fcffe46e-3697-4b82-a0f1-1dbfddd5f592.png)

## 文件上

### 1/ 文件MD5值

在代码中，会由这种场景：将字符串打包成.json文件上传至OSS，并且记录这个文件的MD5值。

一定要担心：不可以使用原字符串的byte[]形式去生成MD5值，一定要在上传文件后，通过文件URL下载文件，将这个文件的byte[]去进行计算；这样MD5值才是对的！

### 2/ 关于文件传输的请求头

```
Content-Disposition:"attachment;filename=?"
```

这是设置文件名的请求头，一般对接人员只需要从 `Content-Disposition` 中拿到filename。

但是有一种情况会导致请求失败，流被强行关闭：`当filename，即文件名中出现逗号(,)时`

因为Content-Disposition 的属性处理，有以逗号作为分隔符

## 国际化翻译上

## 1/安卓和IOS差异

因为使用语言的不同：安卓大多为JAVA，IOS不知道

但是安卓提供的国际化语言是通过JDK的系统语言，即语言+地区形式

IOS则是由手机语言绝对，即会出现地区中国，语言English的值

两者在此观念上对接时需要进行区分



## 生活

### 1/信念

```
快乐是可以具象化的！
```

### 2/人工智障

#### chatGPT

```properties
(墙外)chatGPT: https://freegpt.one/
chatGPT: https://1.chat58.top/chat
```