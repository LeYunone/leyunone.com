# 阿里巴巴FastJson的事故

最近在对接Alexa亚马逊语音技能，`Smart Home Skill Apis`时，有一个配置的JSON字符串是这样的：

```json
     { 
         "capabilityResources": {
                "friendlyNames": [
                  {
                    "@type": "asset",
                    "value": {
                      "assetId": "Alexa.Setting.Opening"
                    }
                  }
                ]
              }
     }
```

在开发配置，只当是一个普通的字符串；直到单测开始，在解析这行字符串成JSONObject对象的时候报错，同时也抛出了一个异常：

`Exception in thread "main" com.alibaba.fastjson.JSONException: autoType is not support. asset`

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-21/45b1cd32-e672-42e5-86a8-d3b1a77017a4.png)

fastjson版本是：

```xml
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.70</version>
        </dependency>
```

autoType is not support，是什么含义，为什么fastjson独对这个字符串进行了check设置了`ParserConfig.checkAutoType`方法;

## 源码问题定位

因为每个版本的FastJson对checkAutoType都有大大小小的优化，因此只针对伪代码式的含义

**第一次过滤**：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-22/550461bb-aec8-4d25-9b29-31ff6cef6c21.png)



很模糊，safeMode为JSONObject对象初始化的时候会根据是否配置 `fastjson.parser.safeMode` 值，默认为false；

下面的大于192，以及小于3，则是???，意义不明

 **第二次过滤**:

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-22/3a3bd0f4-3689-4388-87ff-4e4b2dbaca90.png)

这里为符号过滤，取第一个符号以及最后一个符号进行描述符检查，分别为 `[` 和 `L`

