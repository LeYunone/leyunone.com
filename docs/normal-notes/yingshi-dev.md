# 萤石云开放平台二开

>  记录买了萤石品牌的监控，然后想根据自我需求更自定义的使用其功能而对接萤石云开放平台api的流程
>
> 萤石云文档地址：https://hls01open.ys7.com/help/1798
>
> 

## 账号与应用创建

账号注册与登录略过，跳转到控制台：[https://open.ys7.com/console/home.html](https://open.ys7.com/console/home.html)

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-03/2.png" style="zoom:67%;" />

完成应用创建，非必填信息都可以跳过，后续可以随意修改。

创建完成获得`appKey` 与 `Secret`

`appKey` ：用于初始化sdk，获取accessToken接口的入参，设备托管授权页面的client_id

`Secret`：获取accessToken接口的入参，获取托管token接口的入参

后续会补充上述含义

## 授权

与其他的物联网云平台的授权模式不同，萤石云有一点“强硬”的感觉；

一般可以通过`oauth2`的标准流程双方交换token的授权模式，在萤石云中：一个萤石云账号=一个api的授权token

也就是说使用萤石云提供的原生SDK时，在下图流程中：

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-03/1.png" style="zoom: 67%;" />

需要用到的`AccessToken` 与初始化SDK的`appKey` 一定得是一个账号；

因此萤石云提供了两种授权方式：

1. 自给自足的上述模式
2. C端用户主动将设备权限给我账号的托管模式

### 1.

第一种很简单，见文档 [https://hls01open.ys7.com/help/19](https://hls01open.ys7.com/help/19)

简单的接口调用入参为创建应用时得到的`appKey` 与 `Secret`

### 2.

见托管文档说明：https://mp.weixin.qq.com/s/OYm9VMle11AMPHoeWUkGiQ

api文档：https://open.ezviz.com/help/814

我这里只补充官方文档未说明的地方：

1. 授权码回调，可以不处理，详细见下文
2.  [获取授权token](https://open.ezviz.com/help/820) 和 [刷新授权token](https://open.ezviz.com/help/820)，可以不处理，详细见下文
3.  由于拥有 [获取设备托管all权限token ](https://open.ezviz.com/help/822)  全局令牌的概念，相当于通过这个接口获取到的token比上述提到的 `授权token` 权限还要大。所以可以仅对这个令牌处理，达到操作C端用户托管给我方账号应用的萤石云设备目的
4. 托管设备授权后，开放平台可调用的api范围：
   1. <img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-09-03/3.png" style="zoom:50%;" />除框中的其余大部分不涉及加密和隐私的接口，但是比如视频加密，无法获取监控画面地址，可以通过取消视频加密后获取监控画面地址
   2. 原生SDK的所有功能，注：初始化SDK用的`appKey` 为我方账号的应用appkey，`accessToken` 为上述提到的`设备托管all权限token`
   3. 

