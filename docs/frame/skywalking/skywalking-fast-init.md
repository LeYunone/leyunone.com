---
date: 2023-05-15
title: Skywalking快速搭建
category: 
  - Skywalking
tag:
  - Skywalking
head:
  - - meta
    - name: keywords
      content: skywalking,探针
  - - meta
    - name: description
      content: skywalking 8.6.0 版本源码阅读，探针分析
---
# SkyWalking-快速搭建

Skywalking源码及功能分析可见：

[https://leyunone.com/frame/skwalking/skywalking-reading1.html](https://leyunone.com/frame/skwalking/skywalking-reading1.html)

# 功能

串联整个调用链路，快速定位问题

澄清各个微服务	之间的依赖关系

进行各个微服务接口的性能分析

追踪各个业务流程的调用处理顺序

日志预警、收集、定位 

## 搭建

**elasticsearch7+skywalking**

**Elasticsearch:**

```shell
docker run --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e ES_JAVA_OPTS="-Xms84m -Xmx512m" -d elasticsearch:7.12.1
```

**skywalking:** 必须安装8.4.0以上版本，否则没有日志收集功能

`oap`

```shell
docker run --name oap --restart always -d --restart=always -e TZ=Asia/Shanghai -p 12800:12800 -p 11800:11800 --link elasticsearch:elasticsearch -e SW_STORAGE=elasticsearch7 -e SW_STORAGE_ES_CLUSTER_NODES=elasticsearch:9200 apache/skywalking-oap-server:8.6.0-es7
```

`ui`

```shell
docker run -d --name skywalking-ui \
--restart=always \
-e TZ=Asia/Shanghai \
-p 8888:8080 \
--link oap:oap \
-e SW_OAP_ADDRESS=oap:12800 \
apache/skywalking-ui:8.6.0
```

## 项目配置

### **引入依赖**：

```xml
	    <dependency>
            <groupId>org.apache.skywalking</groupId>
            <artifactId>apm-toolkit-log4j-2.x</artifactId>
            <version>8.6.0</version>
        </dependency>     
```

### **log4j2-spring.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!--全局配置-->
    <properties>
        <Property name="APP_NAME">XXX</Property>
        <Property name="PATTERN">%d{yyyy-MM-dd HH:mm:ss:SSS} [%thread] %-5level %logger{50} - %msg%n</Property>
        <property name="LOG_FILE_PATH" value="/opt/developer/app/logs"/>
    </properties>
    <appenders>
        <console name="Console" target="SYSTEM_OUT" follow="true">
            <PatternLayout pattern="%d [%traceId] %-5p %c{1}:%L - %m%n"/>
        </console>
        <RollingFile name="RollingFile" fileName="${LOG_FILE_PATH}/${APP_NAME}/${APP_NAME}.log"
                     filePattern="${LOG_FILE_PATH}/${APP_NAME}/$${date:yyyy-MM}/${APP_NAME}-%d{yyyy-MM-dd}-%i.log">
            <!--控制台只输出level及以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
            <PatternLayout pattern="${PATTERN}" charset="UTF-8"/>
            <Policies>
                <TimeBasedTriggeringPolicy />
                <SizeBasedTriggeringPolicy size="100MB"/>
            </Policies>
            <DefaultRolloverStrategy max="30"/>
        </RollingFile>
        <GRPCLogClientAppender name="grpc-log">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </GRPCLogClientAppender>
    </appenders>
    <loggers>
        <!--过滤掉spring和mybatis的一些无用的DEBUG信息-->
        <logger name="org.springframework" level="INFO"/>
        <logger name="org.mybatis" level="INFO"/>
        <root level="all">
            <appender-ref ref="Console"/>
            <appender-ref ref="RollingFile"/>
            <appender-ref ref="grpc-log" />
        </root>
    </loggers>
</configuration>

```

### Agent

https://archive.apache.org/dist/skywalking/8.6.0/apache-skywalking-apm-es7-8.6.0.tar.gz

将其中的agent文件，以及agent中的**shywalking-agaent.jar** 取出。

在项目启动的VM Option中添加

```xml
-javaagent:shywalking-agaent.jar[包路径] -Dskywalking.agent.service_name=XXX[项目名] 
-Dskywalking.logging.level=INFO[日志等级] -Dskwalking.collector.backend_service=192.168.151.218:11800[OAP地址]
```

### Config

在 **/agent/config/agent.config** 中

![image-20230209174743725](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-05-15/82848323-cb5c-42e8-950c-4fc5b6c5c377.png)

进行key = value修改

## 使用

### 页面

http://ip: shywalking-ui端口号

