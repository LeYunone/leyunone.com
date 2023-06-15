---
date: 2021-12-21
title: SpringBoot错误异常解决指南
category: 
  - Spring
tag:
  - SpringBoot
head:
  - - meta
    - name: keywords
      content: SpringBoot
  - - meta
    - name: description
      content: 记录使用SpringBoot过程中的异常和解决方式
---

> 记录使用SpringBoot过程中的异常和解决方式

# 启动
## 配置问题
### 1、@ComponentScan
**场景：** 在多模块中，单独设置启动模块时。
                                        .

![企业微信截图_20211221104819.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-12-21/企业微信截图_20211221104819.png)width="400" height="auto"

**原因：** SpringBoot自动解析项目注入的前提是，application启动类在该项目的根目录下。但在多模块的场景下，必须使用@ComponentScan标明需要SpringBoot扫描的其他模块包
**解决：**
```
@SpringBootApplication
@ComponentScan({"com.leyuna.*"})
public class DiskStartApplication {

    public static void main (String[] args) {
        SpringApplication.run(DiskStartApplication.class, args);
    }
}

需要使用@ComponentScan 指定子模块需要解析注入注解的模块包。
```
### 2、包扫描问题
**场景**： 发生某个模块无法自动注入相关类到bean中供使用
**原因**： 因为是多模块，假设当前：![企业微信截图_20211222140613.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-12-22/企业微信截图_20211222140613.png)
 ...一定要确认模块之间的依赖为start->web->service->dao->domain ，从start开始找到所有的模块包；否则，需要自定义扫描类进行配置。
**解决**： 
```
理清所有模块之间的关联，划清依赖关系
```
