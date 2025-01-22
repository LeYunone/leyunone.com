---
date: 2025-01-12
title: Spring环境接口响应体格式化配置
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,笔记,Spring
---
# Spring环境接口响应体格式化配置

在接口环境项目中，不免出现这样的情况：

- 对接方对你接口中返回的无值内容为`null`很不满，比方说Web开发的前端接口联调中，例如知乎问题：[https://www.zhihu.com/question/282946327](https://www.zhihu.com/question/282946327)
- 又或者接收方无法解析接口返回的数据类型，比方说`long` 长度的整数
- ...

等等情况，因而团队为防止扯皮甚至上升到人身攻击，往往是三种解决方式：

- 一方理由充足，规定另一方处理
- 谁声音大听谁的
- 后台专注业务，由前端处理

好吧，说笑的，总而言之无论所在的团队对这方面有多规范。在Spring项目环境中的应用，后台为前端做一些响应格式化处理是躲不开的，接下来记录与介绍4种接口响应体格式化配置的办法；

## 1/WebMvcConfigurationSupport类

```java
@Configuration
public class WebJsonConfig extends WebMvcConfigurationSupport {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        FastJsonHttpMessageConverter converter = new FastJsonHttpMessageConverter();
        FastJsonConfig config = new FastJsonConfig();
        config.setSerializerFeatures(
                //json格式输出
                SerializerFeature.PrettyFormat,
                // 保留map为空的字段
                SerializerFeature.WriteMapNullValue,
                // 将String类型的null转成""形式
                SerializerFeature.WriteNullStringAsEmpty,
                // 将Number类型的null转成0
                SerializerFeature.WriteNullNumberAsZero,
                // 将List类型的null转成[],而不是""
                SerializerFeature.WriteNullListAsEmpty,
                // Boolean类型的null转成false
                SerializerFeature.WriteNullBooleanAsFalse,
                SerializerFeature.WriteDateUseDateFormat,
                // 处理可能循环引用的问题
                SerializerFeature.DisableCircularReferenceDetect);
        config.setDateFormat("yyyy-MM-dd HH:mm:ss");
        converter.setFastJsonConfig(config);
        converter.setDefaultCharset(StandardCharsets.UTF_8);
        List<MediaType> mediaTypeList = new ArrayList<>();
        mediaTypeList.add(MediaType.APPLICATION_JSON);
        converter.setSupportedMediaTypes(mediaTypeList);
        converters.add(converter);
    }
}
```

**tip：**

WebMvcConfigurationSupport作为顶级类重写方法，效果是将SpringBoot默认自动装配的各种转换器全部覆盖；

如上代码，重写后转换器中只会有一个 `FastJsonHttpMessageConverter` ；

因此在没有百分百把握或者环境复杂的项目中，千万不要选择这个，使用次代码 = 响应体的转化工作全权交给自己

## 2/WebMvcConfigurer接口

```java
@Order(Ordered.HIGHEST_PRECEDENCE)
@Configuration
public class WebJsonConfig2 implements WebMvcConfigurer {

    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        //json序列化的转化
        FastJsonHttpMessageConverter converter = new FastJsonHttpMessageConverter();
        FastJsonConfig config = new FastJsonConfig();
        config.setSerializerFeatures(
                //json格式输出
                SerializerFeature.PrettyFormat,
                // 保留map为空的字段
                SerializerFeature.WriteMapNullValue,
                // 将String类型的null转成""形式
                SerializerFeature.WriteNullStringAsEmpty,
                // 将Number类型的null转成0
                SerializerFeature.WriteNullNumberAsZero,
                // 将List类型的null转成[],而不是""
                SerializerFeature.WriteNullListAsEmpty,
                // Boolean类型的null转成false
                SerializerFeature.WriteNullBooleanAsFalse,
                // 处理可能循环引用的问题
                SerializerFeature.DisableCircularReferenceDetect);
        converter.setFastJsonConfig(config);
        converter.setDefaultCharset(StandardCharsets.UTF_8);
        List<MediaType> mediaTypeList = new ArrayList<>();
        mediaTypeList.add(MediaType.APPLICATION_JSON);
        converter.setSupportedMediaTypes(mediaTypeList);
        converters.add(converter);

        //值映射关系的转化
        MappingJackson2HttpMessageConverter jackson2HttpMessageConverter = new MappingJackson2HttpMessageConverter();
        ObjectMapper objectMapper = new ObjectMapper();
        /**
         * 序列换成Json时,将所有的Long变成String
         * 因为js中得数字类型不能包括所有的java Long值
         */
        SimpleModule simpleModule = new SimpleModule();
        simpleModule.addSerializer(Long.class, ToStringSerializer.instance);
        simpleModule.addSerializer(Long.TYPE, ToStringSerializer.instance);

        // 所有的double类型返回保留三位小数
        objectMapper.registerModule(simpleModule);
        jackson2HttpMessageConverter.setObjectMapper(objectMapper);
        converters.add(jackson2HttpMessageConverter);
    }
}
```

**tip:**

类似第一种，第一种是强行覆盖，而实现接口则在加载的过程中会被SpringIOC容器识别为一个后置处理器；

即在装配转化器的过程中，会根据加载顺序往后执行重写的代码：如上，往后添加了两个转化器；



因此并不会破坏默认转配和已经存在的转化器配置，但是由于是按顺序执行，会出现前一个的处理影响后一个处理的问题，比方说：第一个转化器是将Long转化为字符串，而第二个则是需要根据是否是Long类型进行计算；

这样就会出现第二个转化器拿到的对象属性的Long类型永远是字符串类型

解决方式就是通过`@Order`注解设置配置类的加载顺序

## 3/HttpMessageConverters

```java
@Configuration
public class WebJsonConfig3 {

    @Bean
    public HttpMessageConverters jsonConverters() {
        FastJsonHttpMessageConverter fastConverter = new FastJsonHttpMessageConverter();
        FastJsonConfig fastJsonConfig = new FastJsonConfig();
        fastJsonConfig.setSerializerFeatures(SerializerFeature.PrettyFormat, SerializerFeature.IgnoreNonFieldGetter,
                SerializerFeature.WriteMapNullValue, SerializerFeature.WriteNullStringAsEmpty);
        fastConverter.setFastJsonConfig(fastJsonConfig);
        List<MediaType> supportedMediaTypes = new ArrayList<>();
        supportedMediaTypes.add(MediaType.APPLICATION_JSON);
        fastConverter.setSupportedMediaTypes(supportedMediaTypes);
        HttpMessageConverter<?> converter = fastConverter;
        return new HttpMessageConverters(converter);
    }
}

```

**tip：**同下

## 4/MappingJackson2HttpMessageConverter

```java
@Configuration
public class WebJsonConfig4 {

    @Bean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter = new MappingJackson2HttpMessageConverter();
        List<MediaType> supported = new ArrayList<>();
        supported.add(MediaType.APPLICATION_JSON);
        mappingJackson2HttpMessageConverter.setSupportedMediaTypes(supported);

        // JsonMapper
        ObjectMapper objectMapper = new ObjectMapper();

        // null值的处理，必须要放在第一步，否则会将下面的日期格式化覆盖掉  null ==> ""
        objectMapper.getSerializerProvider().setNullValueSerializer(new JsonSerializer<Object>() {
            @Override
            public void serialize(Object value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
                gen.writeString("");
            }
        });
        // 处理默认日期格式化：yyyy-MM-dd HH:mm:ss
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
        mappingJackson2HttpMessageConverter.setObjectMapper(objectMapper);
        return mappingJackson2HttpMessageConverter;
    }
}
```

**tip：**

基于SpringBootIOC的自动装配模式，将外置设置好的转化器注入到转化器列表中，是最推荐的方式；

不过依然有2中的问题，还是需要处理顺序
