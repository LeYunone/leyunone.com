---
date: 2024-05-25
title: OAuth2.0授权码模式对接与开发记录
category: 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: OAuth2.0
  - - meta
    - name: description
      content: OAuth 2.0定义了四种授权方式。
---
# OAuth2.0授权码模式对接与开发记录

因为云云接入平台的原因，无论是作为客户端还是作为服务端都完成了`OAuth2.0` 授权码模式的一条龙开发；

在过程中不难免需要接收来自网络各式各样的OAuth2.0的时序图拆解，发现很少有一篇会从开发的角度上从时序图出发再到具体需要几个接口、设计几个缓存、刷新于授权机制等等；

因此本篇作为唤醒未来的我记录而谱写创作；

## 这是什么

OAuth 2.0定义了四种授权方式。

- 授权码模式（Authorization Code）
- 简化模式（Implicit Grant）
- 密码模式（Resource Owner Password Credentials Grant）
- 客户端模式（Client Credentials）

其中授权码模式在应用与应用之间广为使用，比如微信第三方授权登录；

其特点是不会涉及到客户端应用的账号密码信息，只需要通过简单的约定好的握手原则就可以拿到第三方用户的资源权限；

OAuth（开放授权）是一个开放标准，是一种约定俗成的规则；

## 需要什么

- 资源所有者（第三方）
- 我（需要引入第三方的人）
- 授权服务器（第三方提供）

因此如果是你需要引入第三方，那么就一定要找到对方在OAuth2认证的相关协议文档；

反之，如果是你需要对方的应用引入你的应用资源，那么：

- 你的体量大：提供你的OAuth2文档给对方，对方进行调整；
- 反之，请根据对方的接入文档调整；

## 工作流程

用我最喜欢的UML时序图简明的表述其工作流程

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-03/1231231.png)

可以看到OAuth2的流程很简单，这也是它的一大特点；

对于应用A来说，只是提供一个第三方应用登录的入口，然后再提供一个重定向的路由在其中通过授权码请求令牌；

对于第三方应用来说，只是需要一个登录界面，一个授权码生成和授权码认证的动作；

简单的登录>重定向>请求，三步走就可以对资源方完成认证。此后的刷新令牌，以及更深层次的验证校验，则由双方拟定的规则进行增强；

## 开发人员需要的

以微博的api为例：[https://open.weibo.com/wiki/%E5%BE%AE%E5%8D%9AAPI](https://open.weibo.com/wiki/%E5%BE%AE%E5%8D%9AAPI)

首先OAuth2中需要两个很重要的字段进行应用认证（只允许通过的应用）

```json
{
    "client_id":"",
    "client_secret":""
}
```

在微博案例中则是在注册开发平台账号后拿到的`App key`和 `App Secret`

然后我们需要找到对方的两个授权接口，`授权码`和`请求令牌`

- 请求授权码：https://api.weibo.com/oauth2/authorize。
- 获取令牌：https://api.weibo.com/oauth2/access_token。

然后定义一个自己的回调页面，比如定义为`localhost:80/test/api/auth.html`

这可以是一个空白的页面，等待对方回调；

然后打开微博提供的登录页面，同时带上标准入参：`state` 、`client_id`  、`scope`、`response_type`、`redirect_uri`

redirect_uri是`localhost:80/test/api/auth.html`，scope是对方可支持的范围；

登录后，点击授权

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-03/weibo.png)

这时候微博就会回调到你提供的路由上，并且附上它内部自己调用的 `请求授权码：https://api.weibo.com/oauth2/authorize。`  接口；

即跳到你准备的页面时已经拿到了授权码，这时候就只需要在页面中通过授权码请求令牌；

到此，OAuth2.0的授权流程就结束了，是不是很简单；

总结一下作为开发人员需要做的事：

### 我方使用第三方资源

你需要：

- 拿到对方的登录页面，并且在跳转路由上带上标准入参其中一定要包括client_id，redirect_uri
- 重定向路由一定得是

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-06-03/guize.png)

- 在重定向页面中请求第三方获取令牌接口，返回的参数为：

  ```json
  {
      "access_token":"",
      "expires_in":111111,
      "refresh_token":"",
      "token_type":"code"
  }
  ```

### 你作为被使用资源方

你需要：

- 两个接口 `获取授权码` 和 `获取令牌` ，其中的入参与上述描述相反
- 刷新令牌逻辑，包括但不限于：每次资源被请求时，令牌过期时自动续期...
- 保存和处理好令牌-用户关系