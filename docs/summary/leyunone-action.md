---
date: 2021-11-04 17:05:44
title: 乐云一的行为手册
category: 总结
tag:
  - 无
---
>记录行为
# 代码
## 敲代码
```
用null==object
```
```
循环中有用到数据库交互的话；
用list.parallelStream().forEach(t ->{}) 
但是别在这里面进行 d u i 操作
开个并发流循环
```
```
对数组用增强for(int i : ar)，好看
对集合就用普通for循环，好操作。
如果是链表集合用增强for循环也行，效率高一些。
```
```
接口不返回null
结果集为Collections返回new Collections
结果集为对象返回空对象
```
```
如果要用equal方法，请用object<不可能为空>.equal(object<可能为空>))例如
"bar".equals(foo)
 
而不是用
foo.equals("bar") 
```
```
字符串拼接：

操作String不如操作StringBuffer
操作String不如用StringUtils.join()
```

# 工具
## [GitHub](https://leyuna.xyz/#/blog?blogId=19)
## 搜索引擎
```
Lucene很不好用，因为他的分词器好垃圾...
```
## Spring
```
有idea自动生成 别去折磨自己一个个创建文件，另外记得用：https://start.aliyun.com 找服务
```
## Lombok
```
如果有人和你说这个东西好用，你可以叫他去网上搜Lombok的坏处。
如果有人和你说这个东西垃圾，你可以叫他去网上搜Lombok的好处。
总而言之：项目组用我就用，反正我自己的项目一定用，谁不想偷懒呢？ ╮(╯▽╰)╭
```
# 注释使用
## @Value
```
@Value(XXX)
private String xxx;
```
在这里记录的原因是要注意，当属性为static修饰静态时，无法正常的加载注释使用。
想要正常的使用，但又要修饰静态，只能在使用属性的方法上使用@Value
