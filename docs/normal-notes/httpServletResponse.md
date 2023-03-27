---
date: 2022-04-20
title: 解读——HttpServletResponse
category: 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: HttpServletResponse
  - - meta
    - name: description
      content: Response的获得方式完全就像是框架的进化史一样...
---
# 解读HttpServletResponse场景

>  因为最近在回传文件，包装请求头这块，被一些API和属性给卡住了，所以好好的研究了一下HttpServletResponse设置返回头以及属性的知识:sunglasses:

## 获得方式

Response的获得方式完全就像是框架的进化史一样。

目前主流的是通过Spring由自动配置的Http拦截器去拦截获取本次响应的HttpServletResponse，并且放入到当前次的IOC容器中。

所以我们可以根据：

```
    @Resource
    private HttpServletResponse response;
```

也可以从ApplicationContext容器中手动取：

```
 HttpServletResponse response=((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getResponse()

```

最原始的就是通过方法入参，页面带进来的时候自动识别填充：

```
    @PostMapping("/export")
    public void export (HttpServletResponse response) {
       
    }
```

## 方法

### **addDateHeader**

```
void addDateHeader(String name, long date)
```

添加指定名称的响应头和日期值。

**应用场景：**

一般要用到这个方法的场景，肯定是希望后端返回一个和业务有关的日期值出来。

但是在一般业务中，都有Response BoBy带着业务数据出来，所以有些冷门。![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210452.png)

可以通过

```
response.addDateHeader("expires", 0)
```

 使浏览器不进行响应的缓存。

还可以在没有返回数据的请求中，比如导出、业务转让等接口中，可以放入解决时间、开始时间等等时间结果。

### addHeader

```
void addHeader(String name, String value)
```

添加指定名称的响应头和值。

**应用场景：**

addHeader应用场景可太多了，主要是因为很多功能的刷新点是基于Key - Value进行配置的。

比如说：

Response.AddHeader (“REFRESH”, ”60;URL=XXX”)

设置60秒刷新一次页面，页面请求为URL：相当于给了前端设置了META标签

```html
<META HTTP-EQUIV=”REFRESH”, “60;URL=XXXX”></META>
```

刷新不想要，那么可以进行页面转发：

Response.Addheader (“Location”, XXX)

将页面转向到路径XXX页面，相当于前端自己调用了：

```script
Response.redirect(“XXX”)
```

除了这些干预页面刷新的问题，和addDateHeader一样可以根据自己的需求往请求头中添加自己的业务数据，但是这种方式很不建议，数据还是老实待在返回体中好。

### containsHeader

```
boolean containsHeader(String name)
```

返回指定的响应头是否存在.

**应用场景：**

暂时研究不出来，因为对于后端来说，前端将自己的数据设置到Response中我们还要去判断也太怪了。

因为如果设置了，那么后端拿出来也是一个String，也是需要进行处理的，那么判断是否存在、是否为空理应由后端人处理。

### setHeader

```
void setHeader(String name, String value)
```

使用指定名称和值设置响应头的名称和内容。

**应用场景：**

一个大头，可以取代以上的所有方法。

![https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-04-20/企业微信截图_20220420231108.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-04-20/企业微信截图_20220420231108.png)

这是一般Response自带的请求头信息，所以最基本的就是设置以上属性，自定义一个请求头出来。

这里就直接总结一下使用setHeader触发的功能:

1. X秒刷新页面一次 response.setHeader("refresh","X");

2. X秒跳到其他页面 response.setHeader("refresh","X;URL=XXX");

3. 设置本次响应不给缓存
   response.setHeader("Pragma", "No-cache");
   response.setHeader("Cache-Control", "no-cache");

4. 本次响应的过期时间:

   response.setDateHeader("Expires",自己设置的时间期限);

5. 请求后跳转到其他页面：

   response.setStatus（302）;

   response.setHeader("location","url");

6. 下载文件，这里有很多说法。先暂时不提，由底部补充

7. ......

底部补充Response的各类特殊属性的用法与意义。

### setIntHeader

```
void setIntHeader(String name, int value)
```

指定 int 类型的值到 name 标头。

**应用场景：**

和setHeader的用法区别不大，主要是value一个是String，一个是value。

首先要知道，由前端处理请求头时，是不会考虑整形或字符型的，因为他们根本就没得数据类型。![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210514.jpg)

所以使用intHead还是Head，纯粹是由后端设置进去的值类型决定的。

### setDateHeader

```
void setDateHeader(String name, long date)
```

使用指定名称和值设置响应头的名称和内容。

**同上**

### **setStatus**

```
void setStatus(int sc)
```

设置响应的状态码

**应用场景：**

状态编码，请求头返回时，html协议首先是判断状态编码的类型，然后选择对应的处理方式：

| 1XX  |               服务端不响应已发请求               |
| :--: | :----------------------------------------------: |
| 2XX  |                    成功。200                     |
| 3XX  |              302重定向；304访问缓存              |
| 4XX  | 404请求路径找不到资源；405请求方式错误(GET/POST) |
| 5XX  |              500服务端内部出现错误               |

## 设置请求头

主要介绍一下几个常用请求头的设置

### Content-Type

让服务器告诉浏览器它发送的数据属于什么文件类型。

所以根据导出、下载的文件需要定位兼容Content-Type，以下是网络上的资料对应：

| 序号 | 内容类型                      | 文件扩展名            | 描述                   |
| ---- | ----------------------------- | --------------------- | ---------------------- |
| 1    | application/msword            | doc                   | Microsoft Word         |
| 2    | application/octet-stream bin  | dms lha lzh exe class | 可执行程序             |
| 3    | application/pdf               | pdf                   | Adobe Acrobat          |
| 4    | application/postscript        | ai eps ps             | PostScript             |
| 5    | appication/powerpoint         | ppt                   | Microsoft Powerpoint   |
| 6    | appication/rtf                | rtf                   | rtf 格式               |
| 7    | appication/x-compress         | z                     | unix 压缩文件          |
| 8    | application/x-gzip            | gz                    | gzip                   |
| 9    | application/x-gtar            | gtar                  | tar 文档 (gnu 格式 )   |
| 10   | application/x-shockwave-flash | swf                   | MacroMedia Flash       |
| 11   | application/x-tar             | tar                   | tar(4.3BSD)            |
| 12   | application/zip               | zip                   | winzip                 |
| 13   | audio/basic                   | au snd                | sun/next 声音文件      |
| 14   | audio/mpeg                    | mpeg mp2              | Mpeg 声音文件          |
| 15   | audio/x-aiff                  | mid midi rmf          | Midi 格式              |
| 16   | audio/x-pn-realaudio          | ram ra                | Real Audio 声音        |
| 17   | audio/x-pn-realaudio-plugin   | rpm                   | Real Audio 插件        |
| 18   | audio/x-wav                   | wav                   | Microsoft Windows 声音 |
| 19   | image/cgm                     | cgm                   | 计算机图形元文件       |
| 20   | image/gif                     | gif                   | COMPUSERVE GIF 图像    |
| 21   | image/jpeg                    | jpeg jpg jpe          | JPEG 图像              |
| 22   | image/png                     | png                   | PNG 图像               |

### Content-Disposition

一般在下载文件的接口中设置，这个请求头可以告诉游览器数据文件类型、文件名等

比如：

```
        response.setHeader("Content-Disposition", "attachment;filename=export.xlsx");
```

并且由这个请求头触发页面上弹出下载对话框。



## 定义一个下载文件的场景

首先是对请求头的设置

```
        response.setHeader("Content-Disposition", "attachment;filename=export.xlsx");
        response.setContentType("application/octet-stream");
        response.setCharacterEncoding("UTF-8");
```

response.setContentType("application/octet-stream");

会将本次数据处理成blob类型返回给页面上。

然后就谈谈**response.getOutputStream()**:本次字节输出流对象 

 **getWriter()**：字符的输出流对象

对上面的对象进行写入或写出，就会返回给客户端或反馈到服务端，但是一定要记得关流，因为response发生流泄漏的话对于一个Web应用是很恐怖的事。![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210533.jpg)

然后就是页面接受的问题，这里我就无脑贴出来了：

```script
                axios({
                    url: "method/export",
                    method: "POST",
                    date: this.exportList,
                    responseType: 'blob'
                }).then((res) => {
                    console.log(res)
                    console.log(res)
                    const filename = res.headers["content-disposition"];
                    const blob = new Blob([res.data]);
                    var downloadElement = document.createElement("a");
                    var href = window.URL.createObjectURL(blob);
                    downloadElement.href = href;
                downloadElement.download = decodeURIComponent(filename.split("filename=")[1]);
                    document.body.appendChild(downloadElement);
                    downloadElement.click();
                    document.body.removeChild(downloadElement);
                    window.URL.revokeObjectURL(href);
                })
```

## 总结

由于Response有太多的请求头，参数，如果一一去解读加之深究的话，会很麻烦（不熟，而且很少用的知识最好不要产生模棱两可的感觉）。所以这次主要是挖掘一下下主要用的方法和参数，另外总结一下这次参考到的，很有用的场景知识。![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210528.gif)

### 用途

1、向客户端写入Cookie

2、重写URL

3、获取输出流对象，向客户端写入文本或者二进制数据

4、设置响应客户端浏览器的字符编码类型

5、设置客户端浏览器的MIME类型。

### 让网页不缓冲

```
Response.Expires = 0
Response.ExpiresAbsolute = Now() - 1
Response.Addheader “pragma”,“no-cache”
Response.Addheader “cache-control”,“private”
Response.CacheControl = "no-cache
```

原文链接：https://blog.csdn.net/weixin_45680561/article/details/114870800

### 向客户端写文件[JSP时代常用]

```
 resp.setHeader("content-type", "text/html;charset=UTF-8");
 resp.setCharacterEncoding("UTF-8");
 PrintWriter out = resp.getWriter();//获取PrintWriter输出流
                        out.write("使用PrintWriter流输出数字1：");
	                    out.write(1+"");	                    	                 
```

原文链接：https://blog.csdn.net/wwq0813/article/details/90270883

### **强制浏览器显示一个username/口令对话框**

Response.Status= “401 Unauthorized”
Response.Addheader “WWW-Authenticate”, “BASIC”
