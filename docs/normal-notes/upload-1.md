---
date: 2024-01-26
title: 记一次海外服务文件导出
category: 
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: 
  - - meta
    - name: description
      content: 一个大文件的excel导出，文件大小因其内的图片大小无上限增大；
---
# 记一次海外服务文件导出

## 背景

一个大文件的excel导出，文件大小因其内的图片大小无上限增大；

并且因为图片是由前端使用 `html2canvas`  生成的大且高清的图，因此一个文件很容易就达到几十甚至几百M以上；

在后续测试中，海外服务器下的导出，更是无法保证流的稳定传输。

这样肯定不行，哪有一个简简单单的导出功能文件又大，传输还不稳定的，得改！

## 优化

首先是文件大小，这里使用的是 `EasyExcel 3.1.1版本`

```xml
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>easyexcel</artifactId>
            <version>3.1.1</version>
        </dependency>
```

并且根据需求，需要走过三个自定义拦截器进行：动态合并、嵌入内容居中图片、样式处理；

动态合并和样式处理很快的可以处理，文件生成速度主要处决与图片处理。

那么我们的主要优化路线则是对图片进行压缩，正确的说应该是在基本不改变图片的前提下，减少图片的内存；

于是了解到前端同志生成图片的格式是`png`，当即提议换成 `jpeg` 格式图片；因为jpg图片在内存上小于png的同时，还有一个巨大的优势：压缩

通过调研，得知有一款工具可以专门压缩Jpg类型的图片：

```xml
        <dependency>
            <groupId>net.coobird</groupId>
            <artifactId>thumbnailator</artifactId>
            <version>0.4.8</version>
        </dependency>
```

[https://github.com/coobird/thumbnailator](https://github.com/coobird/thumbnailator)

`BufferedImage outImage = Thumbnails.of(src).outputQuality(0.5f).size().asBufferedImage();`

核心原理是通过重写图片的方式，通过设置`CompressionQuality` 压缩质量，达到减少内存的效果。

```java
ImageWriter jpgWriter = ImageIO.getImageWritersByFormatName("jpg").next();
ImageWriteParam jpgWriteParam = jpgWriter.getDefaultWriteParam();
jpgWriteParam.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
jpgWriteParam.setCompressionQuality(0.7f);
```

由于jpg有损压缩的特性，在图片允许失真的范围内，完全可以达到不改变图片肉眼可见的修改前提下减少内存。

不过需要注意的是，通过重写图片设置压缩质量的方法，在这次业务中，仅针对JPG类型有效；

因为图是由 `html2canvas`  生成的背景透明底图，压缩时会修改png属性中的alpha通道或四色图，出现图片变色情况；

**结果**

通过重写jpg图片的方式，压缩之后原本1M的图片，直降10倍且质量未受肉眼可见的影响。

那么文件大小的问题就此解决。

但是在海外服务器上，国内挂梯子访问无法导出这一点无论如何都是不应该的；

根据后台日志，当代码跑到EasyExcel的`write.finish` 时，抛出异常  ` can not close io` ；

finish方法都知道，是释放数据，关闭流的标志；

那么在正常关闭流之间抛出这个异常的唯一原因，只可能是客户端与服务端的流中断，结合海外网络与国内网络的特殊性，很容易判断出网络不稳定，丢包问题；

但是为什么只有海外的服务会出现正常导出功能这一点带宽都无法保证稳定传输的错误？这一点目前也很令人匪夷所思

如果将文件通过http而非流传输，则不存在这样的问题；

即不通过 `response.getOutputStream()` 的方式提供下载文件通过，而是采用服务内部处理 ->上传文件oss ->返回文件url的方式；

这里只需要使用 `File.createTempFile("",".xlsx")` 的方法生成临时文件，将easyexcel的导出数据指向改文件即可；

除此使用url提供给页面进行直接下载的方式外，也可以使用文件分块传输，我们常谈的：分片上传、断点续传的方式。

## 后感

虽然只是一次很简单的需求记录，但是压缩图片这一方案，在开发这个需求的一个月来竟然完全没有想到过；

要知道每次自测/他测时，也不是一次吐槽文件大小问题了，最终也是要以bug优化为驱动力才想到压缩图片，减小文件大小的这个想法；

并且针对海外应用，在流传输时会丢包，导致页面下载失败这个问题，未来就需要多重视各个接口、服务响应延时，丢包时的补偿方案；

