---
title: Alibaba Easy Excel 工具
category: GitHub
tag:
  - GitHub
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,字节码详解,Java 基本数据类型,装箱和拆箱
  - - meta
    - name: description
      content: 全网质量最高的Java基础常见知识点和面试题总结，希望对你有帮助！
---
# Alibaba Easy Excel
>导入和导出的工具：一是Poi，效率低慢，占内存高且上手复杂。二是EasyExcel，上手超级简单，读写效率高。

## EasyExcel是什么
EasyExcel是一个基于Java的简单、省内存的读写Excel的开源项目。在尽可能节约内存的情况下支持读写百M的Excel。
github地址:https://github.com/alibaba/easyexcel。
而且目前开源社区中Actions还很活跃，所以遇到Bug也可以提单交给作者。
依赖
```pom
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>easyexcel</artifactId>
            <version>2.2.7</version>
        </dependency>
```
## EasyExcel怎么使用
Easy这个单词说明了该工具的上手难度。
需要准备：
1. 一个类，类中属性使用@ExcelProperty("文档展示名")注释。这个类为写入文档的对象，和读文档转换的对象
2. 一个基础了AnalysisEventListener<T>的监听器。这个监听器为，文档读操作时，其中的invoke(data,analysisContext)方法，data为当前读到的一条数据[读出来转换为对象]，和doAfterAllAnalysed（analysisContext）读操作全部完成后的动作。
3. 一个文件夹，最好能有一个.xlsx的文件。用来存储导出或导入的excel文档。

准备好以上这些，就可以直接完成EasyExcel的读写动作了。
### 读
```
EasyExcel.read(file, MethodExcelDTO.class
                      ,new EasyExcelOrderListener()).sheet().doRead();
```
**file**:excel文档
**class**:读出来转换的对象
**listener**:绑定的监听器
**sheet()**: 可以入参一个字符串，控制关闭。

### 写
```
EasyExcel.write(file, MethodExcelDTO.class).sheet().doWrite(list);
```
**file**:文件
**class**：属性被@ExcelProperty修饰的类
**list**:存储本次写出去的对象集合。

## 场景使用
由于读写简单，所以在我们准备好需要的类及监听器后。就可以通过很简单的一行代码完成对对象集合的excel导出或导入。
在读操作的时候，注意有一个监听器，可以监听读操作中，可以拿到读出来的每一条数据。
所以在需要对读出来的字段进行校验或是字段翻译等操作时，可以再监听器中实现。
除此之外，监听器还提供了一个读取完了之后的一个after动作。
在这个方法中，我们可以进行打印日志，赋值，业务去重等等实现

**WEB场景中**
可以非常快速实现出上传和下载的功能
```
   @GetMapping("download")
   public void download(HttpServletResponse response) throws IOException {
       response.setContentType("application/vnd.ms-excel");
       response.setCharacterEncoding("utf-8");
       // 这里URLEncoder.encode可以防止中文乱码 当然和easyexcel没有关系
       String fileName = URLEncoder.encode("测试", "UTF-8");
       response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");
       EasyExcel.write(response.getOutputStream(), DownloadData.class).sheet("模板").doWrite(data());
   }

   /**
    * 文件上传
    * <p>1. 创建excel对应的实体对象 参照{@link UploadData}
    * <p>2. 由于默认一行行的读取excel，所以需要创建excel一行一行的回调监听器，参照{@link UploadDataListener}
    * <p>3. 直接读即可
    */
   @PostMapping("upload")
   @ResponseBody
   public String upload(MultipartFile file) throws IOException {
       EasyExcel.read(file.getInputStream(), UploadData.class, new UploadDataListener(uploadDAO)).sheet().doRead();
       return "success";
   }
```

## 总结
在开发到需要有导入、导出功能时，发现的工具。
也是用了这个工具之后，想到了创建一个Big Tool Box，大工具箱。去整合平时开发会用到的，简便开发工作的工具。
比如jastJson,EasyRanom，EasyExcel，随着接触开发项目的增加，也接触到了越来越多新颖的工具。
发现这些工具在我们使用中都有一个问题，就是简单的太简单，复杂的太复杂。
往往需要我们去重新封装这些工具，所以想到了[BToolBox](https://github.com/LeYunone/BToolBox.git)。
