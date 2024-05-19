---
date: 2023-05-19
title: Vue+Java+Oss创建自己的云盘
category: 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: Java,数据库,乐云一,云盘,阿里云
  - - meta
    - name: description
      content: Vue+Java+Oss创建自己的云盘
---
# Vue+Java+Oss创建自己的云盘

| 前置环境  |
| :-------: |
|   JDK8    |
| 阿里云Oss |
|   VUE3    |

## 项目地址：

页面：https://github.com/LeYunone/leyunone-disk-vue

后台：https://github.com/LeYunone/leyunone-disk

## 需求功能

众所周知，一个云盘一定是围绕着如下几点功能展开：

1. 文件上传
2. 文件夹管理
3. 文件下载

因此我们只需要一个简单的页面就可以设计出一个自己的云盘；

**演示：**

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/2024-05-19/image/yanshi.gif)

## 实现

这里这提上传阶段中的分片上传实现原理，其余的推荐根据代码查阅，因为过于<u>业务</u>

### 后台分片上传

Api文档：

[https://www.alibabacloud.com/help/zh/oss/developer-reference/java-multipart-upload?spm=a2c63.p38356.0.0.f45a1413dRJEtA](https://www.alibabacloud.com/help/zh/oss/developer-reference/java-multipart-upload?spm=a2c63.p38356.0.0.f45a1413dRJEtA)

这里先非常简单的介绍一下阿里云分片上传的流程是什么样的：

1. 在Oss客户端中请求本次分片的**uploadId** 
2. 将文件进行分片，上传分片到oss，通过uploadId+注册uploadId时的fileKey定位碎片；
3. 判断最后一个分片上传时，调用合并分片请求；

![image](https://help-static-aliyun-doc.aliyuncs.com/assets/img/zh-CN/2363090171/f0eb0228c8bb9.svg)

代码为：

#### 获得uploadId

```java
/**
 * 分块上传完成获取结果
 */
@Override
public String getUploadId(String filkey) {
    OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
    InitiateMultipartUploadRequest request = new InitiateMultipartUploadRequest(bucketName, filkey);
    // 初始化分片
    InitiateMultipartUploadResult unrest = ossClient.initiateMultipartUpload(request);
    ossClient.shutdown();
    // 返回uploadId，它是分片上传事件的唯一标识，您可以根据这个ID来发起相关的操作，如取消分片上传、查询分片上传等。
    return unrest.getUploadId();
}
```

#### 分片上传

```java
/**
 * @param fileKey  文件名称
 * @param is       文件流数据
 * @param uploadId oss唯一分片id
 * @param fileMd5  文件的md5值（非必传）
 * @param partNum  第几片
 * @param partSize 分片大小
 * @return
 */
@Override
public PartETag partUploadFile(String fileKey, InputStream is, String uploadId, String fileMd5, int partNum, long partSize) {
    OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
    UploadPartRequest uploadPartRequest = new UploadPartRequest();
    uploadPartRequest.setBucketName(bucketName);
    uploadPartRequest.setUploadId(uploadId);
    uploadPartRequest.setPartNumber(partNum);
    uploadPartRequest.setPartSize(partSize);
    uploadPartRequest.setInputStream(is);
    uploadPartRequest.setKey(fileKey);
    uploadPartRequest.setMd5Digest(fileMd5);
    UploadPartResult uploadPartResult = ossClient.uploadPart(uploadPartRequest);
    ossClient.shutdown();
    return uploadPartResult.getPartETag();
}
```

#### 合并分片

```java
@Override
public String completePartUploadFile(String filekey, String uploadId, List<PartETag> partETags) {
    OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
    CompleteMultipartUploadRequest request = new CompleteMultipartUploadRequest(bucketName, filekey, uploadId,
            partETags);
    ossClient.completeMultipartUpload(request);
    ossClient.shutdown();
    return getDownloadUrl(fileName);
}
```

#### 缓存设计

缓存应用在断点续传，历史续传以及多文件上传中；

```java
 public class UploadContext {
	private final static Map<String, Content> updateCache = new ConcurrentHashMap<>();
    private final static Map<String, String> uploadId = new ConcurrentHashMap<>();
    public static class Content {

        private Map<Integer, PartETag> partETags = new ConcurrentHashMap<>();
        
        private Set<Integer> parts = new HashSet<>();

        private String fileKey;

        private Set<Integer> parentIds = new ConcurrentSkipListSet<>();
    }
}
```

`uploadId`的key-value为：`md5` - `uploadId`

这个缓存用来上传前判断是否为在上传过程中的重复文件，防止重复申请uploadId；

`updateCache`的key-value为：`uploadId` - `上传进度`

Content中，partETags为阿里云的上传进度，parts为本地磁盘云时的上传进度；

parentIds则是这个文件被哪几个父目录记录在上传阶段中；

因此分片上传的所有分片中，都要带上主文件的MD5或者本次上传的uploadId

#### 注意点

- 在云盘环境和分片上传场景中，一定要注意控制ossClient的开闭，并且尽可能的节省其创建客户端的资源消耗
- `fileKey`是文件的具体路径，比如`test.txt`会上传至Oss的根路径上； `/测试/test.txt` 会自动生成上传到测试文件夹下；
- 在初始化一个文件的分片并且得到`uploadId`后，直到正确的调用合并分片，完整的完成一次分片上传操作前。Oss中始终会记录这个文件的分片碎片，包括初始化的第一个分片；

### 前端分片上传

采用的上传插件为：[https://github.com/simple-uploader/vue-uploader/tree/vue3](https://github.com/simple-uploader/vue-uploader/tree/vue3)

前言有：[https://leyunone.com/Interesting-design/vue-simple-upload.html](https://leyunone.com/Interesting-design/vue-simple-upload.html)

组件配置：

```vue
<uploader
                    ref="uploader"
                    :options="options"
                    :file-status-text="statusText"
                    :autoStart="false"
                    @file-added="filesAdded"
                    @file-removed="fileRemoved"
                    @file-progress="onFileProgress"
                    @file-success="onFileSuccess"
                    class="uploader-example">
</uploader>
```

```vue
<script>
    export default {
        data() {      
			options: {
                    singleFile: false, // 启用单个文件上传。上传一个文件后，第二个文件将超过现有文件，第一个文件将被取消。
                    query: function (file, res, status) {
                        let param = {
                            "fileType": file.getType(),
                            "uploadId": file.uploadId
                        }
                        param.parentId = self.loadParams()
                        return param;
                    },
                    testChunks: true,     //是否开启服务器分片校验
                    checkChunkUploadedByResponse: function (chunk, message) {
                        let res = JSON.parse(message);
                        if (res.success) {
                            if (res.result.skipUpload) {
                                console.log("skip...")
                                return true;
                            }
                            console.log(chunk);
                            return (res.result.uploadedChunks || []).indexOf(chunk.offset + 1) >= 0;
                        } else {
                            ElMessage.error(res.message);
                        }
                    }
                },
        }
</script>
```

文件上传前，在前端上需要计算文件的md5码交给后台判断文件是否存在，实现秒传功能。

不过因为文件的大小问题，计算md5肯定不能使用文件的所有kb，因此可以选择文件的第一片分片大小用作该文件的md5；

```vue
<script>
    export default {    
        methods:{
            filesAdded(file, event) {
                this.testFile = file;
                this.uploadPanel = true;
                //上传前校验该文件是否上传
                file.pause();
                file.parentId = this.loadParams();
                this.calculateMD5(file).then(() => {
                    axios({
                        url: "/disk/api/pre/requestUploadFile",
                        method: "POST",
                        data: {
                            "uniqueIdentifier": file.uniqueIdentifier,
                            "folderId": this.loadParams(),
                            "fileName": file.name
                        }
                    }).then((res) => {
                        var data = res.data;
                        if (data.success) {
                            var responseType = data.result.responseType;
                            if (responseType === 0) {
                                ElMessage.success("重复文件...上传成功");
                                file.cancel();
                            }
                            if (responseType === 1) {
                                file.uniqueIdentifier = data.result.identifier;
                                file.uploadId = data.result.uploadId
                                //继续上传
                                file.resume();
                            }
                        } else {
                            //上传失败
                            ElMessage.error(data.message);
                            file.cancel();
                            return false;
                        }
                    })
                }).catch(error => {
                });
            }
            
            calculateMD5(file) {
                return new Promise((resolve, reject) => {
                    const fileReader = new FileReader()
                    const time = new Date().getTime()
                    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
                    let currentChunk = 0
                    const chunkSize = 5 * 1024 * 1000
                    const chunks = Math.ceil(file.size / chunkSize)
                    const spark = new SparkMD5.ArrayBuffer()
                    //只计算第一片文件md5码
                    const chunkNumberMD5 = 1

                    loadNext()
                    fileReader.onload = e => {
                        spark.append(e.target.result)

                        if (currentChunk < chunkNumberMD5) {
                            loadNext()
                        } else {
                            const md5 = spark.end()
                            file.uniqueIdentifier = md5
                        }
                        resolve();
                    }
                    fileReader.onerror = function () {
                        reject();
                        ElMessage.error(`文件${file.name}读取出错，请检查该文件`)
                        file.cancel()
                    }

                    function loadNext() {
                        const start = currentChunk * chunkSize
                        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize

                        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
                        currentChunk++
                    }
                });
            },
        }
          
    }
</script>
```

## 总结

一个项目是一篇文章无法解释全的，因此本篇仅简述分片上传部分；不过一个简单的云盘，有分片上传，暂停功能，续点上传，就可以搭建出来用作自己的网盘了。

不过以上的前端和后台项目，大伙可以直接拉取使用；

