---
title: 快速搭建微服务平台-SpringCloud
category: Spring
tag:
  - SpringCloud
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,字节码详解,Java 基本数据类型,装箱和拆箱
  - - meta
    - name: description
      content: 全网质量最高的Java基础常见知识点和面试题总结，希望对你有帮助！
---

> 前言：本文是在你了解好了SpringCloud相关知识后，快速搭建复制粘贴的一个模板，仅当参考

# 依赖准备

## 父依赖[用于控制版本]
```
     <properties>
        <spring-cloud.version>Finchley.RELEASE</spring-cloud.version>
        <spring-boot.version>2.0.3.RELEASE</spring-boot.version>
    </properties>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
```
## 服务注册中心
```
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.3.RELEASE</version>
        <relativePath/>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
    </dependencies>
```
## 服务提供者
```
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
```
## 服务消费者
```
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
```
# 服务注册中心[Eureka Server]
## application.yml
配置文件
```
server:
  port: 8001

eureka:
  instance:
    hostname: localhost
  client:
    registerWithEureka: false
    fetchRegistry: false
    serviceUrl:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/

spring:
  application:
    name: eurka-server
```
**解释：**
    1. registerWithEureka: false
    2. fetchRegistry: false
```
registerWithEureka默认为true，意为将自己注册到Eureka Server
fetchRegistry默认为true，意为从Eureka Server获取注册信息
```
## application.java
启动类
```
package com.leyuna.cloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class CloudServerApplication {

    public static void main (String[] args) {
        SpringApplication.run(CloudServerApplication.class, args);
    }

}
```
# 服务提供者[Eureka Client]
## application.yml
配置文件
```
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8001/eureka/
```
## application.java
启动类
```
@SpringBootApplication()
@EnableEurekaClient
public class DiskStartApplication {

    public static void main (String[] args) {
        SpringApplication.run(DiskStartApplication.class, args);
    }

}
```

# 服务消费者[Feign]
这里不推荐使用ribbon，因为Feign集合了ribbon的功能
## application.yml
```
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8001/eureka/

# 熔断器配置
feign.hystrix.enabled=true
# 超时时间
hystrix.command.default.execution.isolation.thread.timeoutInMilliseconds=60000
```
## application.java
```
@SpringBootApplication
@EnableFeignClients(basePackages = 微服务类的包)
public class BlogStartApplication extends SpringBootServletInitializer {

    public static void main (String[] args) {
        SpringApplication.run(BlogStartApplication.class, args);
    }
}
```
**解释**
1. 首先是@EnableFeignClients(basePackages = 微服务类的包)，这里要注意一定要取标明需要扫描的包位置。因为目前大部分项目场景都是多模块结构，所以无法自动去识别需要使用微服务的类.

## rpcService.java
微服务类
```
@FeignClient(value = "leyuna-disk",fallbackFactory = LeyunaDiskRpcFallbackFactory.class)
public interface LeyunaDiskRpcService {

    @RequestMapping(value = "/file/selectFile/",method = RequestMethod.GET)
    ResponseBean selectFile(@RequestParam("id")String id);
}
```
**解释:**
1. @FeignClient中，**value**为服务注册中心列表中，服务提供者的名字
![企业微信截图_20211224151628.png](https://www.leyuna.xyz/image/2021-12-24/企业微信截图_20211224151628.png)width="auto" height="auto"
2. @FeignClient的熔断器设置，一是fallback，二是fallbackFactory 。推荐使用后者，因为只有后者可以获得本次熔断异常的错误。
3. 方法类注明，只需要注意是否和该方法提供者的接口入参一一对应，需要注意请求方式，和当对象传输时的情况
### rpcFallbackFactory.java
熔断器类
```
@Component
public class LeyunaDiskRpcFallbackFactory implements FallbackFactory<LeyunaDiskRpcService> {
    @Override
    public LeyunaDiskRpcService create (Throwable throwable) {
        return new LeyunaDiskRpcService() {
            @Override
            public ResponseBean selectFile (String id) {
                return response(throwable);
            }
        };
    }

    private ResponseBean response(Throwable throwable){
        String errMsg = throwable.getMessage();
        ResponseCode basicCode = ResponseCode.RPC_UNKNOWN_ERROR;

        if (throwable instanceof HystrixTimeoutException) {
            basicCode = ResponseCode.RPC_TIMEOUT;
        }

        if (errMsg != null && errMsg.contains("Load balancer does not have available server for client")) {
            basicCode = ResponseCode.RPC_ERROR_503;
        }

        return ResponseBean.buildFailure(basicCode);
    }
}
```
