---
title: 浅谈Vue-Simple-Upload
category: 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,字节码详解,Java 基本数据类型,装箱和拆箱
  - - meta
    - name: description
      content: 全网质量最高的Java基础常见知识点和面试题总结，希望对你有帮助！
---
# [Vue-Simple-Upload](https://github.com/simple-uploader/vue-uploader)
第一次写前端的使用笔记，也是因为这个工具没有很正式的官方文档。所以为防止之后还有可能用到，最好是做一次记录！
# 这是什么
是一个基于Vue的上传文件组件，只需要引入其对应依赖，就可以直接使用
```
            <uploader :options="options"
                      class="uploader-example">
                <uploader-unsupport></uploader-unsupport>
                <uploader-drop>
                    <uploader-btn>上传文件</uploader-btn>
                    <uploader-btn :directory="true">上传文件夹</uploader-btn>
                </uploader-drop>
                <uploader-list></uploader-list>
            </uploader>
```
<uploader></uploader>已经封装完全的组件。
功能专一，只做上传文件这件事，但是可以使用其封装的一些方法以及参数完成很多复杂上传的场景

## 依赖：

**Vue2：**
```
npm install vue-simple-uploader --save
```
**Vue3:**
```
npm install vue-simple-uploader@next --save
```

# 属性及方法介绍
前文已经知道，我们只需要使用<uploader></uploader>就可以引入一个上传文件的组件，包括他的样式。
所以我们只需要根据自己对应的业务，去设置需要的入参以及方法逻辑。
这里就直接用分片上传举例：
## 上传
### 第一：
![image.png](https://www.leyuna.xyz/image/2022-04-27/image.png)width="auto" height="auto"}}}
```
                options: {
                    target: '/disk/file/uploadFile',
                    chunkSize: 1024 * 1024 * 5,  //3MB
                    fileParameterName: 'file', //上传文件时文件的参数名，默认file
                    singleFile: true, // 启用单个文件上传。上传一个文件后，第二个文件将超过现有文件，第一个文件将被取消。
                    query: function(file, res, status) {
                        console.log(file)
                        return {
                            "userId": Cookies.get('userId'),
                            "fileType": file.getType(),
                        }
                    },
                    maxChunkRetries: 3,  //最大自动失败重试上传次数
                    testChunks: true,     //是否开启服务器分片校验
                    checkChunkUploadedByResponse: function (chunk, message) {
                        let res = JSON.parse(message);
                        if (!res.status) {
                            return false;
                        }
                    },
                    simultaneousUploads: 3, //并发上传数
                },
```
options属性，属性很多很多，这里可以直接看工具文档去了解 [文档](https://github.com/simple-uploader/Uploader/blob/develop/README_zh-CN.md#%E9%85%8D%E7%BD%AE)。
在分片场景中：
1. target：分片上传的请求
2. chunkSize：每个分片的大小
3. **checkChunkUploadedByResponse**这里是一个大坑，首先这个属性的作用是，指定服务器分片校验的函数，但是通过文档可以发现他没有设置请求校验的请求路径。那么他的路径是什么？ **GET方式的target属性**。校验的时候target发出Get请求，上传分片文件的时候发出POST请求，所以校验的时候不会带上文件。
4. 函数中的message后端返回参数，这个参数是一个字符串的json类型，所以在使用它前一定要通过Json的解析。
5. query：每个分片请求带的额外参数。

除了上面这些常用的属性外，还有很多很多设置上传限制、回调等的属性。
每个分片的请求参数默认为：
![fp.png](https://www.leyuna.xyz/image/2022-04-27/fp.png)width="auto" height="auto"}}}
### 第二：
![sss.png](https://www.leyuna.xyz/image/2022-04-27/sss.png)width="auto" height="auto"}}}
#### @file-added
指定上传文件前【当默认设置选择文件即上传时】，先调用的函数。
这里可用作秒传，并解析文件MD5码以及设置。
除此之外，如果需要当文件加入文件列表待上传前，还想要对文件进行操作，则可以调用**filesAdded**函数入参的file的API方法及属性。
```
filesAdded(file, event) {
}
```
file不是文件，而是工具封装的一个文件对象，其包含很多操作文件的方法。
比如在我的业务中，通过后端接收文件并且解析得到MD5码返回给前端后。
前端需要将此码设置到所有分片文件的唯一标识**identifier**属性上，则可以用到
```
  file.uniqueIdentifier = data.data.identifier; //data.data.identifier;为后端属性
```
并且在**filesAdded**方法中，当后端处理后，可以使用file对应的方法控制状态：
```
.pause() 暂停上传文件。
.resume() 继续上传文件。
.cancel() 取消上传且从文件列表中移除。
.retry() 重新上传文件。
```

#### @file-success
当所有分片上传后，执行的方法。
一般就文件上传是否成功作判断，以及对文件上传的后续操作【比如删除分片文件的临时文件夹】进行控制。
# 总结
总之这只是一个上传文件的工具，倘若不使用他，使用原生的axios也可以完成所有的操作。
并且他也有他的局限性，一个很明显的是，完全规定写死了一次分片请求的入参：
![43434.png](https://www.leyuna.xyz/image/2022-04-27/43434.png)width="auto" height="auto"}}}
并且在Vue3下还有很多方法以及Bug没补全，所以最好不只是依赖工具完成文件上传、分片、断点这些操作，最重要的还是思维理解。
# 遇到的坑
1. 前文提到的**checkChunkUploadedByResponse**属性校验分片的请求路径问题，和target相同，不同请求方式
2. 所有函数中后端的回调参数，是一个纯后端参数的Json字符串，意思就是没有一般请求的Data，Code这些数据包装。
3. 文件大小是B,计算具体形式大小要自己处理。
4. file.getFileType()方法不好用，当文件类型复杂【指超过一般理解，比如.vag】时返回为空
5. 分片虽然是有序【按分片下标】发起，但请求速度可能不同，需要在后端进行并发处理。
6. .....
7. 更多的坑是后端问题上，但这里记录的是前端工具所以就不提了
