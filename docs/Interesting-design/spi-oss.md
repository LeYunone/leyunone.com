---
date: 2023-08-13
title: 基于SPI机制拓展的OSS上传工具
category: 
  - 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: JAVA,乐云一,OSS,SPI,Dubbo,阿里云上传
  - - meta
    - name: description
      content: 因为阿里云OSS是基于Bucket进行模块化的管理的，也就意味着如果项目的Bucket运用划分明确，我们在使用OSS上传的时候，必须要根据需要去指定应对的Bucket。
---
# 基与SPI机制拓展的OSS上传工具

因为阿里云OSS是基于Bucket进行模块化的管理的，也就意味着如果项目的Bucket运用划分明确，我们在使用OSS上传的时候，必须要根据需要去指定应对的Bucket。

并且由于各文件的访问，以及上传等等处理机制都不同，比如：

- 图片，无脑上传，然后生成一条永久访问的URL
- 大文件，根据MD5唯一性的去上传文件，然后生成的URL必须有时间限制。
- ...

所以在针对OSS上传工具的开发，在可以灵活运用不同的Bucket的同时也必须保证其内部业务的拓展性。

同时因为都是OSS访问文件的动作，它们又有非常多相同的地方。

并且，作为一个工具，一定不可以依赖IOC环境，因此在抽象OSS上传工具的设计中，首选推荐的是采取SPI机制进行框架执行。

## SPI

多于SPI的介绍以及运用在这篇文章中不进行赘叙，[Dubbo源码阅读-可扩展机制](https://leyunone.com/frame/dubbo/dubbo-read.html) 以及 [JDK-SPI源码阅读](https://leyunone.com/java/java-spi.html) 都有对SPI的详细介绍

## 设计

源码：[https://github.com/LeYunone/leyuna-laboratory/tree/master/laboratory-core/src/main/java/com/leyunone/laboratory/core/tool/oss](https://github.com/LeYunone/leyuna-laboratory/tree/master/laboratory-core/src/main/java/com/leyunone/laboratory/core/tool/oss)

由于需要考虑方法增强，以及业务处理，所以选取了Dubbo的SPI机制进行搭建；

作为一个文件处理的工具，无非是4个方法：

1. 上传文件
2. 获取文件访问URL
3. 下载文件
4. 删除文件

因此它的接口：

### 接口

```java
@SPI
public interface OssService {

    String ENDPOINT = "https://oss-cn-shenzhen.aliyuncs.com";
    String ACCESS_KEY_ID = "?";
    String ACCESS_KEY_SECRET = "?";

    String uploadFile( URL url,String name, InputStream stream);
    String getFileUrl(String name, Long expireTime);
    void downFile(OutputStream outputStream, String objectName);
    void deleteFile(String name);
}

```

然后由于前文说过，文件操作的动作大同小异，因此在接口实现层设计一个通用的抽象类去模板化文件的一般处理动作：

### 接口-抽象类

```java
public abstract class OssAbstractService implements OssService {
    
    
    public abstract String getBucketName();
    
    @Override
    public String uploadFile(org.apache.dubbo.common.URL url,String name, InputStream stream) {
        // 创建OSSClient实例。
        OSS ossClient = new OSSClientBuilder().build(ENDPOINT, ACCESS_KEY_ID, ACCESS_KEY_SECRET);
        // 上传文件到指定的存储空间（bucketName）并将其保存为指定的文件名称（objectName）。
        ossClient.putObject(getBucketName(), name, stream);
        // 关闭OSSClient。
        ossClient.shutdown();
        return name;
    }

    @Override
    public String getFileUrl(String name, Long expireTime) {
        if(ObjectUtil.isNull(expireTime)) {
            //默认时长
            expireTime = 30 * 60 * 1000L;
        }
        // 创建OSSClient实例。
        OSS ossClient = new OSSClientBuilder().build(ENDPOINT, ACCESS_KEY_ID, ACCESS_KEY_SECRET);
        // 设置URL过期时间为1小时。
        Date expiration = new Date(System.currentTimeMillis() + expireTime);
        // 生成以GET方法访问的签名URL，访客可以直接通过浏览器访问相关内容。
        URL url = ossClient.generatePresignedUrl(getBucketName(), name, expiration);
        // 关闭OSSClient。
        ossClient.shutdown();
        return url.toString();
    }

    @Override
    public void downFile(OutputStream outputStream, String objectName) {
        BufferedInputStream inputStream = null;
        OSS ossClient = new OSSClientBuilder().build(ENDPOINT, ACCESS_KEY_ID, ACCESS_KEY_SECRET);
        OSSObject ossObject = ossClient.getObject(getBucketName(), objectName);
        try {
            inputStream = new BufferedInputStream(ossObject.getObjectContent());
            byte[] bytes = new byte[1024];
            int read = 0;
            while ((read = inputStream.read(bytes)) != -1) {
                outputStream.write(bytes, 0, read);
            }
            outputStream.flush();
            ossClient.shutdown();
        } catch (Exception e) {
        } finally {
            try {
                if (outputStream != null) {
                    outputStream.close();
                }
                if (inputStream != null) {
                    inputStream.close();
                }
            }catch (Exception e){
            }
        }
    }

    @Override
    public void deleteFile(String name) {
        OSS ossClient = new OSSClientBuilder().build(ENDPOINT, ACCESS_KEY_ID, ACCESS_KEY_SECRET);
        // 删除文件。如需删除文件夹，请将ObjectName设置为对应的文件夹名称。如果文件夹非空，则需要将文件夹下的所有object删除后才能删除该文件夹。
        ossClient.deleteObject(getBucketName(), name);
        // 关闭OSSClient。
        ossClient.shutdown();
    }
}
```

### 接口-实现

最终文件操作的实际服务动作，只需要根据自己的Bucket的特殊处去做相应的方法重写，比如对于存放图片的Bucket，直接进行图片路径的拼接

```java
public class ImagePatternService extends OssAbstractService implements OssService {

    private static final String BUCKET_NAME = "image";

    @Override
    public String getBucketName() {
        return BUCKET_NAME;
    }

    @Override
    public String getFileUrl(String name, Long expireTime) {
        String imgPath = "https://my-image.oss-cn-shenzhen.aliyuncs.com/";
        return imgPath + name;
    }
}
```

或者存放大文件的Bucket：

```java
public class FilePatternService extends OssAbstractService implements OssService {

    private static final String BUCKET_NAME = "file";
    
    @Override
    public String uploadFile(URL url, String name, InputStream stream) {
		//判断文件MD5值在数据库中是否已存在
        if(存在){
            super.uploadFile(url,name,stream)
        }else{
            //返回数据库中的路径
        }
        return this.getFileUrl(name, null);
    }
}
```

### 文件前置处理

当文件在操作前需要进行业务级的处理时，我们还需要使用 `Dubbo-spi` 中IOC的特殊处去进行接口的赋值，于是乎，文件前置处理的服务接口以及他的实现类：

```java
@SPI
public interface FileResolve {
    String uploadFile(URL url, Integer appId, String name, InputStream stream);
}
```

```java
public class AppFileResolve implements FileResolve {

    private OssService ossService;

    public void setOssService(OssService ossService) {
        this.ossService = ossService;
    }

    /**
     * 上传文件前的文件处理
     */
    @Override
    public String uploadFile(URL url, Integer appId, String name, InputStream stream) {
        //根据appId自动定位应用文件夹
        if (ObjectUtil.isNotNull(appId)) {
            name = AppDirEnum.getDir(appId) + name;
        }
        return ossService.uploadFile(url,name, stream);
    }
}
```

### AOP方法增强处理

除了业务级的处理，在OSS调用，我们还需要打印日志、异常处理、...等，这里就可以使用到 `Dubbo-spi` 中的AOP机制进行接口调用前的动态代理，所以这个实现类：

```java
public class OssAspect implements OssService {
    
    private final Logger logger = LoggerFactory.getLogger(OssAspect.class);

    private final OssService ossService;
    
    public OssAspect(OssService ossService){
        this.ossService = ossService;
    }

    @Override
    public String uploadFile(URL url,String name, InputStream stream) {
        if(ObjectUtil.isNull(stream)){
            throw new ServiceException("stream is empty");
        }
        String fileUrl = ossService.uploadFile(url, name, stream);
        logger.info("文件上传成功，路径:"+fileUrl);
        return fileUrl;
    }

    @Override
    public String getFileUrl(String name, Long expireTime) {
        String fileUrl = ossService.getFileUrl(name, expireTime);
        logger.info( "{} 文件路径为：{}，有效时长：{}",name,fileUrl,expireTime);
        return fileUrl;
    }

    @Override
    public void downFile(OutputStream outputStream, String objectName) {
        if(StringUtils.isBlank(objectName)) return;
        logger.info("oss down is start =/is ok");
        ossService.downFile(outputStream,objectName);
        logger.info("oss down is finished =/is ok");
    }

    @Override
    public void deleteFile(String name) {
        if(StringUtils.isBlank(name)) return;
        ossService.deleteFile(name);
    }
}

```

### SPI使用

最后，我们使用 `Dubbo-spi` 的各扩展机制将整个方法链路串联起来，再将枚举以及 `Dubbo-spi` 中的services文件 **key-value** 的设定，他的入口最终变成这样：

```java
public class MyOssUtils {

    private MyOssUtils() {
    }

    private MyOssUtils(Integer appId, OssTypeEnum ossType) {
        this.appId = appId;
        this.ossType = ossType;
    }

    private Integer appId;

    private OssTypeEnum ossType;

    public static MyOssUtils build(OssTypeEnum ossType, Integer appId) {
        return new MyOssUtils(appId,ossType);
    }

    public static MyOssUtils build(OssTypeEnum ossType) {
        return build(ossType, null);
    }

    public String uploadFile(String name, InputStream stream) {
        ExtensionLoader<FileResolve> extensionLoader = ExtensionLoader.getExtensionLoader(FileResolve.class);
        FileResolve my = extensionLoader.getExtension("my");
        Map<String, String> map = new HashMap<>();
        map.put("ossPattern", ossType.getType());
        URL url = new URL("", "", 0, map);
        return my.uploadFile(url, appId, name, stream);
    }

    public String getFileUrl(String name, Long expireTime) {
        ExtensionLoader<OssService> extensionLoader = ExtensionLoader.getExtensionLoader(OssService.class);
        OssService ossService = extensionLoader.getExtension(ossType.getType());   
        return ossService.getFileUrl(name,expireTime);
    }

    public String getFileUrl(String name) {
        return this.getFileUrl(name,null);
    }

    public void downFile(OutputStream outputStream, String objectName) {
        ExtensionLoader<OssService> extensionLoader = ExtensionLoader.getExtensionLoader(OssService.class);
        OssService ossService = extensionLoader.getExtension(ossType.getType());
        ossService.downFile(outputStream,objectName);
    }

    public void deleteFile(String name) {
        ExtensionLoader<OssService> extensionLoader = ExtensionLoader.getExtensionLoader(OssService.class);
        OssService ossService = extensionLoader.getExtension(ossType.getType());
        ossService.deleteFile(name);
    }

}
```

**枚举:**

```java
public enum  OssTypeEnum {
    
    IMAGES("image","图片桶"),
    
    FILE("file","文件桶"),
    
    OTA("ota","ota文件桶"),

    PRODUCT_THEME("product-theme", "产品主题")
    ;
```

**services文件：**

```java
image = com.leyunone.laboratory.core.tool.oss.pattern.ImagePatternService
file = com.leyunone.laboratory.core.tool.oss.pattern.FilePatternService
ota = com.leyunone.laboratory.core.tool.oss.pattern.OtaPatternService
product-theme = com.leyunone.laboratory.core.tool.oss.pattern.ProductThemePatternService
com.leyunone.laboratory.core.tool.oss.boost.OssAspect
```

```java
app = com.leyunone.laboratory.core.tool.oss.boost.AppFileResolve    
```



