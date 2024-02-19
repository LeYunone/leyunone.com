---
date: 2024-02-20
title: ChatGpt接入流程
category: 笔记
tag:
  - note
head:
  - - meta
    - name: ChatGpt
      content: 本文档记录从注册到使用ChatGpt的流程，以及踩到的坑；
  - - meta
    - name: description
      content: 本文档记录从注册到使用ChatGpt的流程，以及踩到的坑；
---
# ChatGpt接入流程

本文档记录从注册到使用ChatGpt的流程，以及踩到的坑；

## 注册ChatGpt

需要准备：**国外手机号** 、**魔法**

其中魔法是必须的，除非chatGpt进入国内市场，或者咱们放开互联网围墙╮(╯▽╰)╭。

当然国内有大量的二次包装可略过官网使用的封装，可以直接通过他反的注册系统，填写gpt的api-key去使用

### 没有国外手机号

有两种办法，一是通过各种形式找个境外友人，二是使用企业代理虚拟号码；

使用第二种，需要15RMB的成本；

**SMS-active**

[https://sms-activate.org/cn](https://sms-activate.org/cn)

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-20/69e5bdbe-6d9d-49f2-ab86-3a089995c64a.png" style="zoom: 33%;" />

官方很友好，右上角可选择中文，登录可随意账号，Google目前支持境内邮箱及手机号

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-20/79e58209-38a7-469a-95c9-00cd6f72482e.png" style="zoom:50%;" />

在右侧选择openai服务，在购买对应国家虚拟手机号之前，先完成充值，充值按钮在右上角登录人像旁；

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-20/aaa58658-7cc9-4e27-820c-965fd535b41b.png" style="zoom:33%;" />

选择支付宝充值，最低为2美元，差不多15RMB

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-20/6432e4c8-5233-4a41-98ed-1e7712c12866.png)

之后购买对应国家的虚拟手机号，会根据国家热门度以及手机存量价格进行偏移；

这里踩了第一个坑，**尽量选择魔法所在地的梯子**；

![image-20240220230054170](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-21/97a2957a-901f-481f-a0cf-8eee6461ba43.png)

然后就购买到了一个手机号，在OpenAI里需要用到手机号验证的地方可以直接使用；

如果是使用Goole或是微软、苹果账号登录的，则需要创建其境外的账号；

这里可以大胆的尝试，因为 **SMS-active** 在手机没有被激活过，无论发生什么都可以随时退款，时间到了20分钟会自动退款；

然后需要注意，如果注册账号的过程中，比如Goole账号

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-20/2b11c69f-846e-4034-8290-f604a33bf7db.PNG" style="zoom:25%;" />

出现 **此电话号码已用过太多次** ，只需要在 SMS-active 的号码列表中点击最右边的置换按钮，换一个号码就可以了；

**ps:**

**1、** **此电话号码无法用于进行验证。** 魔法的IP被标记为不安全，选择无痕模式+切换ip。

**2、** sms-active 无法收到短信，大体上四个原因：

- [SMS-activate](https://sms-activate.org/?ref=3138803)提供了多个虚拟手机号供用户使用，但如果某个号码被多人同时使用，可能会导致短信无法送达。在这种情况下，你可以尝试切换不同的虚拟手机号，或者选择更少使用的时间段，以提高收到短信的几率。
- 有时候，短信在传送过程中可能会受到网络延迟或不稳定的影响，导致无法及时到达你的手机。这种情况下，你可以尝试切换到一个更稳定的网络连接，例如切换到Wi-Fi或更稳定的移动数据网络。
- 平台问题
- 还有一种可能，没有选对对应的服务，比方说openai选了Goole的

以上为官方的解释

### 页面使用

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-20/67f0635f-e1c4-4897-b246-1cb1f8c2248f.png)

页面目前可免费使用3.5模型的，不过因为没有角色扮演、面具等调教好的gpt特性，所以这很 "人工智能"

每个账号默认有$5

### 登录后台

通过上述境外手机号，直接跳到gpt后台，选择 **API keys**

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-20/154759a5-3d6a-42df-9301-69d0f8ae72cc.png)

进行手机验证，创建一个api keys，用于后续代码接入调用；

## 搭建自己的GptDemo

官方文档：[https://platform.openai.com/docs/quickstart/build-your-application](https://platform.openai.com/docs/quickstart/build-your-application)

由于官方写的过于详细，且搭建过程过于傻瓜；

按照教程，下载zip，搭建env文件和Python/Node.js，并配置好上面验证后创建的API Key；

运行后，就是一个普通的页面，使用感官也好官方的页面一样，很不实用；

因此我极力推荐使用 [[ChatGPT-Next-Web](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-02-20/3ce4d29a-c959-4eb5-a707-6e377714a53b.png" style="zoom: 50%;" />

## 代码使用

支持非常多的语音接入，并且因为GPt的火爆，社区上有各种各样的开源SDK提供接入入口；

官方文档：[https://platform.openai.com/docs/libraries/community-libraries](https://platform.openai.com/docs/libraries/community-libraries)

仅以JAVA为例，[https://github.com/TheoKanning/openai-java](https://github.com/TheoKanning/openai-java)

```xml
        <dependency>
            <groupId>com.theokanning.openai-gpt3-java</groupId>
            <artifactId>api</artifactId>
            <version>0.11.0</version>
        </dependency>
        <dependency>
            <groupId>com.theokanning.openai-gpt3-java</groupId>
            <artifactId>client</artifactId>
            <version>0.11.0</version>
        </dependency>
        <dependency>
            <groupId>com.theokanning.openai-gpt3-java</groupId>
            <artifactId>service</artifactId>
            <version>0.11.0</version>
        </dependency>
```

使用起来非常简单，和一般的HTTP服务调度一致：

1. 创建服务 `OpenAiService service = new OpenAiService(token);`
2. 通过service.create.....发起请求
3. 拆解请求结果

这里只举一个非常常用的例子，上下文聊天模式：

```java
    public void chat(boolean startStatus,String newChat,Integer index) {
        UserData user = TokenUtils.getUser();
        Map<String, List<ChatMessage>> chatCache = ChatDialogueConstants.chatList;
        String key = user.getUserBaseInfo().getSessionId()+"#"+index;
        List<ChatMessage> chatList = null;
        if(startStatus) {
            chatList = new ArrayList<>();
            chatCache.put(key,chatList);
        }else{
            ChatDialogueConstants.chatList.remove(key);
        }
        ChatMessage newMessage=new ChatMessage();
        newMessage.setContent(newChat);
        chatList.add(newMessage);
        String result = aiChatting(chatList);
    }

    private String aiChatting(List<ChatMessage> chatList) {
        ChatCompletionRequest chatCompletionRequest= ChatCompletionRequest.builder()
                .model(ChatDialogueConstants.CHAT_MODEL)
                .messages(chatList)
                .build();
        ChatCompletionResult result=chatGPTTokenManager.getOpenApi().createChatCompletion(chatCompletionRequest);

        return result.getChoices().get(0).getMessage().getContent();
    }

    /**
     * 聊天框列表
     */
    public static Map<String, List<ChatMessage>> chatList = new ConcurrentHashMap<>();

    public static String CHAT_MODEL = "";
```

**还有一个生成图片的**

```java
    /**
     * 生成描述图片
     * @param imageChat
     */
    public void chatImage(String imageChat) {
        CreateImageRequest createImageRequest= CreateImageRequest.builder()
                //所需图像的文本描述。最大长度为 1000 个字符。
                .prompt(imageChat)
                //生成图像的大小。必须是256x256、512x512或1024x1024
                .size("1024x1024")
                //响应格式,生成的图像返回的格式。必须是url或b64_json,默认为url,url将在一小时后过期。
                .responseFormat("url")
                //要生成的图像数。必须介于 1 和 10 之间。
                .n(1)
                .build();
        ImageResult result=chatGPTTokenManager.getOpenApi().createImage(createImageRequest);
        Map<String,String> r=new HashMap<>();
        String url=result.getData().get(0).getUrl();
    }
```

差不多一个功能齐全的gpt可以围绕着这两个展开，剩下的是角色的设置，面具的选择等管理问题

不过因为gpt的爆火，其实Git上可以很容易找到一个比较完善的项目直接使用，重点还是在与如何去使用GPt

