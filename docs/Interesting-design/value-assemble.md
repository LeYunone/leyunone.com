---
date: 2024-02-28
title: 云云对接协议中的值组装
category: 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: Java,云云接入,乐云一,Alexa,百度,小米,天猫精灵,Google
  - - meta
    - name: description
      content: 本次对接的云有：百度 、小米 、华为 、Tmall 、Alexa 、Google
---
# 云云对接协议中的值组装

最近对接各方的技能语音技能云，有做过各方云云接入经历的同学绝对会有感觉：每个产商云有有不同程度的个异性；

除了统一的使用OAuth2授权认证流程的那套外，主要是针对都有的三种协议的出入参与产商云一致的设计。

本次对接的云有：**百度** 、**小米** 、**华为** 、**Tmall** 、**Alexa** 、**Google**

简单的提一下几个云的比较特殊的地方，以及与各方云对接协议时值组装的坑

### **百度**：

- 传感器类型数据查询接口的响应特殊体：

这是传感体的响应：

```json
{
    "header": {
        "namespace": "DuerOS.ConnectedHome.Query",
        "name": "GetAirQualityIndexResponse",
        "messageId": "780013dd-99d0-4c69-9e35-db0457f9f2a7",
        "payloadVersion": "1"
    },
    "payload": {
        "AQI": {
            "value": 10
        },
        "level":{
            "value":"轻度污染"
        }
    }
}
```

这是一般功能的查询接口响应：

```json
{
    "header": {
        "namespace": "DuerOS.ConnectedHome.Query",
        "name": "GetTargetHumidityResponse",
        "messageId": "780013dd-99d0-4c69-9e35-db0457f9f2a7",
        "payloadVersion": "1"
    },
    "payload": {    
        "attributes": [{
            "name": "humidity",
            "value": 50.1,
            "scale": "%",
            "timestampOfSample":1496741861,
            "uncertaintyInMilliseconds": 10,
            "legalValue": "[0, 100]"
        }]
    }
}
```

针对这种响应体的不一致化，由于我方开发的云云接入，适配的肯定是一对多方云的响应与请求。因此针对所有平台的结构体设计，最好是能通过配置数据库表的方式将响应体可控型的不一致化；

所以带来了思考出了 [运行时，编译字符串中的代码](https://leyunone.com/java/jdk-compile-runcode.html) 的方案去应对百度。

但是后续又面临了百度的第二个异点：

- 不同于其他产商云对设备属性中技能这一数组的定义；

**其余的统统都是针对一个属性去设计技能，而百度则是因为这个技能才会发这个属性**

打个比方，Google的技能 [action.devices.traits.OnOff](https://developers.home.google.com/cloud-to-cloud/traits/onoff?hl=zh-cn)  ，Google对这个设备的开关的双向控制与查询只需有这个技能就会有功能；

而百度则是需要分为 `getTurnOnState` 、`turnOn` 、`turnOff` 三个动作作为设备属性的技能返回，而三者由百度发起控制指令时的请求体又存在差异；

因此在对我方云与百度云设计中，针对属性映射关系，分化为了 

1. 我方云映射产商云的 属性映射表
2. 产商云映射我方云的 动作映射表

其中，两表各有字段作为组装技能的标识，比方说百度就会由动作映射表中的技能标识决定，其余的产商云则都是一个属性一个技能的属性映射表决定

### Alexa：

Alexa与国内的各方云有点像一个模子里刻出来的；

但是在将国内云接入完毕后，在着手海外云时，它的语义配置将我的项目架构中的 `组装` `映射` `转化` 多少有部分进行了重构；

简单的介绍一下**Alexa 语义**的概念：

国内的 "傻瓜云"，操作一个空调的风速，在协议中会直接提供

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-29/18216667-ffad-497b-8660-84e80158e1ea.png)

对应的 操作code以及value含义给你，我们只需要做好动作映射表的配置即可；

但是在Alexa中，不存在具体到一个语义，一个值含义的概念；

除了基本的开关、百分比、声音...等等基础控制的设置会如上图一致，其余的风速、模式、窗帘的开闭等等都是由其 **范围控制器** 、**模式控制器**

完成的，https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-rangecontroller.html；

并且两者要求我们，在对设备基本属性进行组装的时候，需要完成对控制属性的语义配置，举个例子，我想要配置一台空调，其中就由风速：

那么我就需要根据它的配置，返回以下参数（很长，可以跳过）：

```json
{
    "payload": {
      "endpoints": [
        {
          "capabilities": [
            {
              "type": "AlexaInterface",
              "interface": "Alexa.RangeController",
              "instance": "Fan.Speed",
              "version": "3",
              "properties": {
                "supported": [
                  {
                    "name": "rangeValue"
                  }
                ],
                "proactivelyReported": true,
                "retrievable": true,
                "nonControllable": false
              },
              "capabilityResources": {
                "friendlyNames": [
                  {
                    "@type": "asset",
                    "value": {
                      "assetId": "Alexa.Setting.FanSpeed"
                    }
                  },
                  {
                    "@type": "text",
                    "value": {
                      "text": "Speed",
                      "locale": "en-US"
                    }
                  },
                  {
                    "@type": "text",
                    "value": {
                      "text": "Velocidad",
                      "locale": "es-MX"
                    }
                  },
                  {
                    "@type": "text",
                    "value": {
                      "text": "Vitesse",
                      "locale": "fr-CA"
                    }
                  }
                ]
              },
              "configuration": {
                "supportedRange": {
                  "minimumValue": 1,
                  "maximumValue": 10,
                  "precision": 1
                },
                "presets": [
                  {
                    "rangeValue": 10,
                    "presetResources": {
                      "friendlyNames": [
                        {
                          "@type": "asset",
                          "value": {
                            "assetId": "Alexa.Value.Maximum"
                          }
                        },
                        {
                          "@type": "asset",
                          "value": {
                            "assetId": "Alexa.Value.High"
                          }
                        },
                        {
                          "@type": "text",
                          "value": {
                            "text": "Highest",
                            "locale": "en-US"
                          }
                        },
                        {
                          "@type": "text",
                          "value": {
                            "text": "Fast",
                            "locale": "en-US"
                          }
                        },
                        {
                          "@type": "text",
                          "value": {
                            "text": "Alta",
                            "locale": "es-MX"
                          }
                        },
                        {
                          "@type": "text",
                          "value": {
                            "text": "Élevée",
                            "locale": "fr-CA"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "rangeValue": 1,
                    "presetResources": {
                      "friendlyNames": [
                        {
                          "@type": "asset",
                          "value": {
                            "assetId": "Alexa.Value.Minimum"
                          }
                        },
                        {
                          "@type": "asset",
                          "value": {
                            "assetId": "Alexa.Value.Low"
                          }
                        },
                        {
                          "@type": "text",
                          "value": {
                            "text": "Lowest",
                            "locale": "en-US"
                          }
                        },
                        {
                          "@type": "text",
                          "value": {
                            "text": "Slow",
                            "locale": "en-US"
                          }
                        },
                        {
                          "@type": "text",
                          "value": {
                            "text": "Baja",
                            "locale": "es-MX"
                          }
                        },
                        {
                          "@type": "text",
                          "value": {
                            "text": "Faible",
                            "locale": "fr-CA"
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  }
}
```

简单的说就是根据官方提供的https://developer.amazon.com/en-US/docs/alexa/device-apis/resources-and-assets.html#capability-resources

将友好的语义词，国家语言，与对应的值进行配置

在这里需要注意，以上的配置仅仅是针对一个属性的技能配置，因此在装配Alexa发现设备协议的时候，由于国内云都是由产商云定义技能配置，前面没有预留给技能一张单独的表；

最终也是将映射组装部分进行了技能配置的重构，这是Alexa带来的第一个坑；

然后就是第二个坑了，注意我前文有说，国内云都是一个技能对应一个属性的，比如开关，那就是on；风速，那就是fan；颜色，那就是color....

但是在Alexa中由于 `范围控制器`和 `模式控制器` 的语义配置的关系，一个技能会对应到多个属性上。

所以最终在组转关系时，针对产商云的属性标识码一栏，使用了`_`分隔符进行异化 ，这是Alexa带来的第二个坑；

### Google：

同样作为海外云，它和Alexa有相同的地方:语义配置；

不过好在，先对接的Alexa，这个坑就已经先填掉了；

但是关于谷歌的请求、响应体还是有一个花了些时间处理的地方

https://developers.home.google.com/cloud-to-cloud/guides/light?hl=zh-cn#response

这是谷歌的灯光查询的响应案例：

```json
{
  "requestId": "6894439706274654514",
  "payload": {
    "devices": {
      "123": {
        "status": "SUCCESS",
        "online": true,
        "on": true,
        "brightness": 65,
        "color": {
          "temperatureK": 4000
        }
      }
    }
  }
}
```

控制的请求案例：

```json
{
  "requestId": "6894439706274654520",
  "inputs": [
    {
      "intent": "action.devices.EXECUTE",
      "payload": {
        "commands": [
          {
            "devices": [
              {
                "id": "123"
              }
            ],
            "execution": [
              {
                "command": "action.devices.commands.ColorAbsolute",
                "params": {
                  "color": {
                    "name": "Warm White",
                    "temperature": 3000
                  },
                  "brightness":90
                }
              }
            ]
          }
        ]
      }
    }
  ]
}
```

眼尖的人可以看到，其中的 `color` 属性与众不同，这只是色温控制，它的完整体：

```json
{
  "command": "action.devices.commands.ColorAbsolute",
  "params": {
    "color": {
      "name": "Magenta",
      "temperature": 3000,
      "spectrumRGB": 16711935,
      "spectrumHSV": {
        "hue": 300,
        "saturation": 1,
        "value": 1
      }
    }
  }
}
```

起初看到，感觉可以和百度的定制体处理一样。

但是Google操作和百度不一样，没有一个明确的Code告诉你什么属性要，什么属性不要；

最终想来想去，还是在原有的两张映射表上动手：

原本为： 产商云属性code           我方云属性code           

这里的问题，主要是产商云code的深度发生了变化，推到了之前所有云的key-value形式；

因此我配置为了  

```xml
color#temperature     我方云temperature
color#spectrumRGB     我方云rgb
....
```

问题就来到了值组装时，将以上两条数据封装为：

```json
{
    "color": {
      "temperature": 3000,
      "spectrumRGB": 16711935
}
```

哦吼，来到了动脑子的算法问题，但是作为非公式文章，我这里就直接上代码了：

```java
    public static void main(String[] args) throws UnsupportedEncodingException, NoSuchFieldException {

        JSONObject result = new JSONObject();
        mapping(result,"color#temperature","3000");
        mapping(result,"color#spectrumRGB","16711935");
        System.out.println(JSONObject.toJSON(result));
    }
    
    public static void mapping(Map<String,Object> result,String code,Object value) {
        String[] statusCode = code.split("#");
        if (statusCode.length > 1) {
            //存储属性值
            Object valueStorage = value;
            //初始点位
            JSONObject preV = (JSONObject) result.getOrDefault(statusCode[0],new JSONObject());
            value = preV;
            for (int i = 1; i < statusCode.length; i++) {
                //当前code对象
                JSONObject currentV = (JSONObject) preV.getOrDefault(statusCode[i],new JSONObject());
                if (i == statusCode.length - 1) {
                    //最后一个code赋予值
                    preV.put(statusCode[i], valueStorage);
                    break;
                }
                preV.put(statusCode[i], currentV);
                //对象传递,记录当前对象用于下一次遍历赋值
                preV = currentV;
            }
        }
        result.put(statusCode[0], value);
    }
```

使用了JAVA值传递的特性，进行一层一层遍历；

### 转换函数

在对接各方云的时候，有一个地方是无论在哪个场合都会出现的：他方云给我的值非我需要的单位；

比如颜色RGB控制，Google给的是HSV或者十进制整数，但是我方是 `{"r","g","b"}`三点值；

所以在根据组装解析拿到对方请求协议的值后，还需要判断值是否需要进行函数运算；

这里就很简单的可以直接通过在各方映射表的配置上，加入枚举字段，比如颜色转化 `INT_TO_RGB`

代码中只需要判断这个属性的映射配置中是否拥有函数，如果有就执行这个枚举对应的convert方法；

## 总结

以上简单的介绍了语音云接入时，在开发设计之初可能会踩到的坑以及应对思路；

后续如需需要，会将全平台通用的智能语音技能云云接入的项目开源出来，地址：[https://github.com/LeYunone/voice-cloud-cloud](https://github.com/LeYunone/voice-cloud-cloud)

欢迎有兴趣，和正在做云云接入的小伙伴交流；