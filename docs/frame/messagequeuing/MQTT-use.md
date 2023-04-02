---
date: 2023-03-28
title: MQTT使用-集成SpringBoot自动装配
category: 
  - 消息队列
tag:
  - Mq、MQTT、IOT
head:
  - - meta
    - name: keywords
      content: MQTT,物联网,通讯协议,iot
  - - meta
    - name: description
      content: 。MQTT协议是轻量、简单、开放和易于实现的，这些特点使它适用范围非常广泛。在很多情况下，包括受限的环境中，如：机器与机器（M2M）通信和物联网。
---
>  前篇介绍了MQTT的基本知识与其特性 [MQTT协议入门](https://leyunone.com/frame/messagequeuing/MQTT-about.html)

# 使用

## 消息服务器

首先需要安装一个消息服务器作为MQTT协议的仓库

这里推荐使用 [EMQX](https://www.emqx.io/docs/zh/v4.4/getting-started/getting-started.html#%E5%AE%89%E8%A3%85-emqx)

EMQX 是一款大规模可弹性伸缩的云原生分布式物联网 MQTT 消息服务器。

作为全球最具扩展性的 MQTT 消息服务器，EMQX 提供了高效可靠海量物联网设备连接，能够高性能实时移动与处理消息和事件流数据，帮助您快速构建关键业务的物联网平台与应用。

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-27/caaa4505-dbe6-45cd-b7fe-3965ddc34b40.png)

### docker安装

1、获取 Docker 镜像

```bash
docker pull emqx/emqx:latest
```

2、启动 Docker 容器

```bash
docker run -d --name emqx -p 1883:1883 -p 8081:8081 -p 8083:8083 -p 8084:8084 -p 8883:8883 -p 18083:18083 emqx/emqx:latest
```

记得开放18083【页面】1883【MQTT协议】8081【页面API接口】8083【MQTT-WebSocket】8084【MQTT-SSl】端口

访问IP:18083，检查是否进入到EMQ Dashboard页面，账号密码默认：admin / public

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-27/6e5de4b6-460a-45ef-af66-a685f4ef0599.png)

## 客户端连接使用

### 配置

```java
    @Bean
    public MqttConnectOptions mqttConnectOptions() throws CertificateException, NoSuchAlgorithmException, KeyStoreException, IOException, KeyManagementException {
        MqttConnectOptions options = new MqttConnectOptions();
        options.setUserName("mqtt用户名");
        options.setServerURIs(new String[]{"mqtt地址"});
        options.setPassword("mqtt密码".toCharArray());
        options.setCleanSession(true);
        options.setKeepAliveInterval(90);
        options.setAutomaticReconnect(true);
        options.setMaxInflight(10000);
        options.setConnectionTimeout(120);
        options.setSocketFactory(SslUtil.getSslSocktet("ssl证书地址"));
        return options;
    }

    @Bean
    public MqttAsyncClient mqttAsyncClient(MqttConnectOptions mqttConnectOptions) {
        MqttAsyncClient sampleClient = null;
        try {
            sampleClient = new MqttAsyncClient("mqtt地址", "clientId");
            sampleClient.connect(mqttConnectOptions);
            boolean successful = sampleClient.isConnected();
            long startTime = Clock.systemDefaultZone().millis();
            long timeout = Integer.parseInt("超时时间") * 1000;
            long endTime = startTime;
            while (!successful && (endTime - startTime) <= timeout) {
                Thread.sleep(10);
                successful = sampleClient.isConnected();
                endTime = Clock.systemDefaultZone().millis();
            }
            if (!successful) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("mqtt client connect is timeout");
            }
        } catch (Exception e) {
            logger.error("mqtt client connect is failed.");
        }
        return sampleClient;
    }
```

### 发布主题

```java
    @Autowired
    private MqttAsyncClient mqttAsyncClient;

    public boolean messagePublish(String topic,String message,Integer qos) {
//        String topic = "topic-mqtt主题";
        if (StringUtils.isBlank(topic) || StringUtils.isBlank(message)) {
            return false;
        }
        MqttMessage mqttMessage = new MqttMessage();
        mqttMessage.setPayload(message.getBytes());
        mqttMessage.setQos(ObjectUtil.isNull(qos) ? 0 : qos);
        try {
            mqttAsyncClient.publish(topic, mqttMessage);
        } catch (Exception e) {
            return false;
        }
        return true;
    }
```

### 订阅主题

```java
@Service
public class MqttSubscribe implements MqttCallback {
    @Override
    public void connectionLost(Throwable throwable) {
        //失去连接 -  重连
    }

    @Override
    public void messageArrived(String s, MqttMessage mqttMessage) {
        String topic = s;
        //消息
        JSONObject messageJson = JSONObject.parseObject(new String(mqttMessage.getPayload(), StandardCharsets.UTF_8));
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
        //断开连接
    }
}
```

**虽然使用了SpringBoot，但是由于Springboot整合mqtt并不完整，没有一套自动装配的流程，使用需要我们自己构造一个客户端对象进行mqtt连接**

## 开发Springboot-mqtt自动装配项目

**项目：** [https://github.com/LeYunone/springboot-mqtt-leyunone](https://github.com/LeYunone/springboot-mqtt-leyunone)

### 配置

```java
@ConfigurationProperties(prefix = "spring.mqtt")
@Data
public class MqttProperties {

    private String url;

    private String clientId = "mqtt-sdk-client";

    private String username;

    private String password;

    private String group = "default-group";

    private int keepalive;

    private String ssl;
    
    private int timeout;

    private List<MqttTopic> topics = new ArrayList<>();
}
```

### spring.factories

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.leyunone.springmqtt.config.MqttClientAutoConfiguration

```

### 自动装配

```java
@Configuration
@ConditionalOnProperty(value = "spring.mqtt.enabled", havingValue = "true", matchIfMissing = true)
@EnableConfigurationProperties(MqttProperties.class)
public class MqttClientAutoConfiguration {
    
    private static final Logger logger = LoggerFactory.getLogger(MqttClientAutoConfiguration.class);

    @Bean
    public MqttConnectOptions mqttConnectOptions(MqttProperties mqttProperties) {
		...
    }

    @Bean
    public MqttAsyncClient mqttAsyncClient(MqttProperties mqttProperties, MqttConnectOptions mqttConnectOptions) {
		...
    }


    @Bean
    public MqttMessageDispatchHandler mqttMessageDispatchHandler(){
        return new MultiHandlerDispatchHandler();
    }

    /**
     * 自动订阅
     * @param mqttProperties mqtt配置
     * @param mqttAsyncClient mqtt客户端
     * @return 订阅实现
     */
    @ConditionalOnMissingBean({MqttAutoSubscribe.class})
    @Bean
    public MqttAutoSubscribe mqttAutoSubscribe(MqttProperties mqttProperties,MqttAsyncClient mqttAsyncClient,MqttMessageDispatchHandler dispatchHandler){
        return new MqttAutoSubscribe(mqttProperties, mqttAsyncClient,dispatchHandler);
    }
```

### 自定义注解 

**消费者： @MqttConsumerHandler**

```java
@Component
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface MqttConsumerHandler {

    /**
     * bean对象名
     * @return
     */
    @AliasFor(annotation = Component.class)
    String value() default "";
}
```

**消费者方法： @MqttSubscribe**

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface MqttSubscribe {

    @AliasFor("topic")
    String topic() default "\\.*.*";

    @AliasFor("value")
    String value() default "";
}
```

### 订阅者配置

```java
public class MultiHandlerDispatchHandler extends MqttCallback implements InitializingBean {

    Logger logger = LoggerFactory.getLogger(MultiHandlerDispatchHandler.class);

    private final List <ConsumerHandler> consumerHandlers = new ArrayList<>();

    @Override
    public void messageArrived(String topic, MqttMessage mqttMessage) {
        consumerHandlers.forEach(h -> {
            String pattern = h.pattern;
            boolean matches = Pattern.matches(pattern,topic);
            if(matches){
                h.getHandleMethod().invoke(h.beanObject,topic,mqttMessage);
            }
        });
    }
	//加载消费者
    @Override
    public void afterPropertiesSet() {
        Map<String, Object> handlerArray = context.getBeansWithAnnotation(MqttConsumerHandler.class);
        logger.info("mqtt consumer handler list {}",handlerArray.keySet());
        if(handlerArray.size() == 0){
            throw new NullPointerException("mqtt consumer bean is empty...");
        }
        handlerArray.forEach((k,v) -> {
            Class<?> aClass = v.getClass();
            Method[] methods = aClass.getMethods();
            if(methods.length == 0){
                throw new NullPointerException("mqtt consumer handler method is empty,handler "+k);
            }
            Method mqttMessageHandlerMethod = null;
            for(Method method :methods){
                MqttSubscribe annotation = method.getAnnotation(MqttSubscribe.class);
                if(null != annotation){
                    mqttMessageHandlerMethod = method;
                    break;
                }
            }
            Objects.requireNonNull(mqttMessageHandlerMethod,"No consumption method found on this handler "+k);
            MqttSubscribe annotation = AnnotationUtils.getAnnotation(mqttMessageHandlerMethod,MqttSubscribe.class);
            Objects.requireNonNull(annotation,"Method is missing necessary annotations "+mqttMessageHandlerMethod.getName());
            String pattern = annotation.topic();
            ConsumerHandler consumerHandler = new ConsumerHandler(k,v,mqttMessageHandlerMethod,pattern);
            consumerHandlers.add(consumerHandler);
        });
    }
}
```

### 自动订阅

```java
    private static final String GROUP_SUBSCRIBE_PREFIX = "$share/";
    private static final String DEFAULT_SUBSCRIBE_PREFIX = "$queue/";
    final private MqttProperties mqttProperties;
    final private MqttAsyncClient mqttAsyncClient;
    final private MqttMessageDispatchHandler dispatchHandler;

    @Override
    public void afterPropertiesSet() {
        if (Thread.interrupted()) {
            return;
        }
        List<MqttProperties.MqttTopic> mqttTopics = mqttProperties.getTopics();
        if (CollectionUtils.isEmpty(mqttTopics)) {
            logger.warn("subscribe topic is blank.subscribe stop");
            return;
        }
        String[] topics = mqttTopics.stream().map(mqttTopic -> {
            String group = mqttProperties.getGroup();
            String topic = mqttTopic.getTopic();
            if (!StringUtils.isEmpty(group)) {
                return GROUP_SUBSCRIBE_PREFIX + group + "/" + topic;
            } else {
                return DEFAULT_SUBSCRIBE_PREFIX + topic;
            }
        }).collect(Collectors.toList()).toArray(new String[mqttTopics.size()]);
        int[] qos = mqttTopics.stream().map(MqttProperties.MqttTopic::getQos).mapToInt(Integer::intValue).toArray();
        try {
            dispatchHandler.setMqttAutoSubscribe(this);
            dispatchHandler.setMqttAsyncClient(mqttAsyncClient);
            mqttAsyncClient.setCallback(dispatchHandler);
            mqttAsyncClient.subscribe(topics, qos);
            logger.info("subscribe success topic:{}", Arrays.toString(topics));
        } catch (Exception e) {
            logger.error("subscribe failed...", e);
        }
    }
```

### 最终使用

```yaml
spring:
 mqtt:
    url: tcp://192.168.151.218:1883
    clientId: iothub.${spring.application.name}:${server.port}
    topics:
      - topic: keepalive/smarthome
        qos: 1
    username: iot_service
    password: TYGHJK&*(&8923
    group: ${spring.application.name}
```

```java
@MqttConsumerHandler
@Component
public class MqttMessageConsumer {

    private final static Logger logger = LoggerFactory.getLogger(MqttMessageConsumer.class);
    
    @MqttSubscribe(topic = "指定的topic主题")
    public void messageAccept(String topic, MqttMessage message) {
        logger.info("MQTT message receive topic:{},message:{}", topic, message.toString());
    }
}
```
