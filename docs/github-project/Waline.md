---
date: 2023-07-19
title: Waline-评论系统
category: 
  - GitHub
tag:
  - GitHub
head:
  - - meta
    - name: keywords
      content: Waline,Vue,评论系统,部署,GitHub
  - - meta
    - name: description
      content: Waline一款简单、安全且拆箱即用的评论框架，以下是它的部署使用即注意要点
---
# Waline

一款简单、安全且拆箱即用的评论框架，以下是它的部署使用即注意要点

## 注册LeanCloud数据库

[登录](https://console.leancloud.app/login) 或 [注册](https://console.leancloud.app/register)

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-18/1e12f689-0d40-4541-8dfc-ff2ea3705c93.png)

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-18/61d6e93a-d477-49ce-874d-4275a353cff9.png" style="zoom: 67%;" />

点击应用，打开左上角，设置 > 应用凭证

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-18/e817f810-16f2-4e44-993c-c16ad7b4e8d7.png" style="zoom: 50%;" />

将 `AppID`、`AppKey` 、`MasterKey`，保存记录

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-18/a084612c-c3f9-41b0-8269-1be54b44631a.png)

此外，虽然官方有说国内版本需要备案域名，绑定域名接入。但是在LeanCloud可以不进行设置，域名绑定在后续环节。

##  Vercel 部署

[
![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwalinejs%2Fwaline%2Ftree%2Fmain%2Fexample)

点击上面图标，跳到Vercel，务必使用GITHUB账号关联登录

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-20/af4d1f89-32ef-4a93-8ccb-727452fe1e8c.png)

点击之后，Vercel会自动帮我们建立一个存放评论配置的仓库

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-20/de2b2476-3f8b-4adb-b58d-efe5f90388da.png)

在构建完了之后，在当前页面点击下一步

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-20/6669b5c5-5494-4a2e-b212-1a23a514d7ea.png)

在新建项目中打开设置的环境变量，将前置保存的 `AppID`、`AppKey` 、`MasterKey` 设置上

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-20/d9d8cfc1-e1c0-491e-820d-daa984affe55.png)

|    Key    |               Value               |
| :-------: | :-------------------------------: |
|   AppID   | OCmvQ2hMeY8OeVnDzeCzTr0Y-MdYXbMMI |
|  AppKey   |     z0kEjL0f7VB75NPOTNFmee4f      |
| MasterKey |     5y0xRnQYVsdRq2NKYl5yMTyw      |

 在官网中，有说明 `如果你使用 LeanCloud 国内版，请额外配置 `LEAN_SERVER` 环境变量，值为你绑定好的域名。`

不过如果你有自己的国内已备案的域名，其实也没必要使用国内版的可以通过：

`Settings` - `Domains` 进入域名配置页

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-20/2d63c281-7d44-4e9a-bae6-1716163d1090.png)

添加之后，一定要在对应的域名运营商中添加解析：

| Type  | Name    | Value                |
| ----- | ------- | -------------------- |
| CNAME | example | cname.vercel-dns.com |

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-20/518300bd-af98-4207-b512-df24467c240c.png)

如果没有自己的域名，即使用的是Vercel生成的海外域名 `https://test-comment-alpha.vercel.app/` ，在墙内网络下是无法正常使用的；在配置之后评论系统在国内网络下将失效。

**最后**

部署项目

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-20/2c0d0d17-48aa-4608-9040-3757d2ae24bf.png)

等待项目状态变成 `Ready`，就可以通过 `test-comment-alpha.vercel.app` 或者 `http://example.leyunone.com/` 前者是海外域名，后者是自己配置的域名。

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-20/9fa36a63-a4c1-40f2-8984-c40dc43dfb7c.png)

通过访问域名+/ui/login可以来到Waline评论系统的管理页面。

​	![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-07-20/7397378f-1092-4186-9e90-0456a3bc25a5.png)

注册账号，这里一定要注意，注册的第一个账号就是管理员账号；

此号的所有账号都是普通账号，只有管理员才可以管理评论

## 插件使用

### HTML

**下述为官方的教程**

在你的网页中进行如下设置:

1. 导入 Waline 样式 `https://unpkg.com/@waline/client@v2/dist/waline.css`。
2. 创建 `<script>` 标签使用来自 `https://unpkg.com/@waline/client@v2/dist/waline.mjs` 的 `init()`函数初始化，并传入必要的 `el`  与 `serverURL`
   - `el` 选项是 Waline 渲染使用的元素，你可以设置一个字符串形式的 CSS 选择器或者一个 HTMLElement 对象。
   - `serverURL` 是服务端的地址，即上一步获取到的值。

```html
<head>
  <!-- ... -->
  <link
    rel="stylesheet"
    href="https://unpkg.com/@waline/client@v2/dist/waline.css"
  />
  <!-- ... -->
</head>
<body>
  <!-- ... -->
  <div id="waline"></div>
  <script type="module">
    import { init } from 'https://unpkg.com/@waline/client@v2/dist/waline.mjs';

    init({
      el: '#waline',
      serverURL: 'https://your-domain.vercel.app',
    });
  </script>
</body>

```

### vuepress

在配置文件中配置

```json
comment:{
  provider: "Waline",
  search:true,
  serverURL:"https://example.leyunone.com"
}
```
