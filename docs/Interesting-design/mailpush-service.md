---
date: 2023-07-30
title: 针对文件邮箱的第三方服务设计
category: 
  - 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: JAVA,邮箱服务,业务代码,乐云一
  - - meta
    - name: description
      content: 发送邮箱是应用中常见的功能，比如账号注册、验证、提醒等等功能完成后都会进行邮箱的后置补强。
---
# 邮箱服务的设计

发送邮箱是应用中常见的功能，比如账号注册、验证、提醒等等功能完成后都会进行邮箱的后置补强。

而邮箱发送的功能，往往都是作为某个功能的外置点；

那么在调用邮箱服务的时候，更希望是引入某个RPC接口，由邮箱服务的服务中心应用进行发送邮箱功能管理。

以下将介绍通过RPC调用邮箱发送功能的问题与设计：

## 问题

发送邮箱很简单，主要是两种：

1、简单邮箱

2、文件邮箱

简单邮箱只需要标题、内容以及发送人就行，所以没有头痛的点。

主要是文件邮箱，无论是作为附件的文件还是插入内容栏中的行内图片，在单体应用中可以很简单的发送。

但是作为微服务剥离出来的功能，文件传递是非常需要琢磨的点：

1. 文件流不稳定
2. 以Dubbo-service为例，默认协议不支持文件传输
3. 大文件问题
4. ...

## 设计

成体见项目：[https://github.com/LeYunone/service-center](https://github.com/LeYunone/service-center)

以Dubbo服务的接口为例；

重点在于文件上的传输及拓展性

所以我以对象驱动型进行接口的编排

什么是对象驱动型：即围绕对象中的属性对功能进行设置

邮箱对象最终考虑以下属性：

```java
public class MailSendDTO implements Serializable {
    
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * 邮件主题
     */
    private String subject;

    /**
     * 邮件内容
     */
    private String text;

    /**
     * 附件路径
     */
    private ResponseCell<SolverEnum,List<MailFileDTO>> files;

    /**
     * 内容内文件
     */
    private ResponseCell<SolverEnum,Map<String,byte[]>> inLineFiles;

    /**
     * html
     */
    private String html;

    /**
     * 发送时间
     */
    private Date sendDate;

    /**
     * 接收人邮箱地址
     */
    private String[] tos;
}

```

由于需要考虑RPC接口的拓展性，重点设计在文件中，为了可以灵活的调配大小文件传输，最终使用三种方式进行文件解读：

1. 调用者打包文件byte[]二进制数组
2. 服务提供者自行解读文件
3. 网络资源

所以设置三种枚举

```java
public enum SolverEnum implements Serializable {
    /**
     * 无处理
     */
    NONE,
    /**
     * 推送中心
     */
    PROVIDER,
    /**
     * 网络资源方
     */
    INTERNET;
}
```

`ResponseCell` 对象为一个容纳两个属性的牢房对象

```java
public class ResponseCell<Cell,Mate> implements Serializable {

    private Cell cellData;

    private Mate mateDate;
    
    private ResponseCell(){}
    
    public ResponseCell(Cell cellData,Mate mateDate){
        this.cellData = cellData;
        this.mateDate = mateDate;
    }

    public static <Cell,Mate> ResponseCell<Cell,Mate> build(Cell cellData, Mate mateDate) {
        return new ResponseCell<>(cellData, mateDate);
    }
}
```

 以下以文件附件为例进行文件方法的考虑：

```java
    public void annexFile(SolverEnum solver,MailFileDTO ... mailFileDTO){
        if(ObjectUtil.isEmpty(mailFileDTO)) return;
        switch (solver) {
            case NONE:
                break;
            case PROVIDER:
                //服务提供方处理文件，但文件已存在时
                this.annexFile(SolverEnum.NONE,mailFileDTO);
                break;
            case  INTERNET:
                break;
        }
        
        this.files = ResponseCell.build(solver,CollectionUtil.newArrayList(mailFileDTO));
    }

    /**
     * 
     * @param solver 文件处理方
     * @param classFilePaths 项目内相对路径
     */
    public void annexFile(SolverEnum solver, String ... classFilePaths) {
        if(ObjectUtil.isEmpty(classFilePaths)) return;
        try {
            switch (solver) {
                case NONE:
                    //Dubbo文件传输 - byte[]
                    List<MailFileDTO> toFile = new ArrayList<>();
                    for(String filePath: classFilePaths){
                        File file = new File(filePath);
                        if(!file.exists()){
                            //项目路径名
                            ClassPathResource resource = new ClassPathResource(filePath);
                            file = resource.getFile();
                        }
                        String name = file.getName();
                        byte[] bFile = Files.readAllBytes(file.toPath());
                        MailFileDTO mailFileDTO = new MailFileDTO();
                        mailFileDTO.setArrays(bFile);
                        mailFileDTO.setFileName(name);
                        toFile.add(mailFileDTO);
                    }
                    this.annexFile(solver,toFile.toArray(new MailFileDTO[]{}));
                    return;
                case PROVIDER:
                    Map<SolverDataTypeEnum, Object> datas = this.datas;
                    List<String> serverFiles = Arrays.asList(classFilePaths);
                    if(datas.containsKey(SolverDataTypeEnum.ANNEX_FILE)){
                        List<String> annexFiles = (List<String>)datas.get(SolverDataTypeEnum.ANNEX_FILE);
                        annexFiles.addAll(serverFiles);
                    }else{
                        datas.put(SolverDataTypeEnum.ANNEX_FILE,serverFiles);
                    }
                    break;
                case  INTERNET:
                    break;
            }
        }catch (Exception e){
            logger.error("mail file io is fail");
        }
    }
```

以上为核心代码，重点在于：

- 由调用方调用API并且选择 `SolverEnum`枚举为不处理时，将从调用方应用进行文件解码成二进制的过程。

并且结合 `ClassPathResource` 类的特性，可以非常灵活的去拓展文件路径的填写，而不是绝对路径。

- 由调用方调用API并且选择 `SolverEnum` 枚举为服务提供者处理时，从服务方角度上看，自己拿到的是一份待处理的文件路径，所以文件最终将由服务应用自行取路径进行文件的解析。

最终可以解决大文件问题，即大文件由服务提供者自行转码，文件流不稳定稳定，即非文本内容的图片不进行RPC接口传输。

同时也可以支持简单文件由调用者自行控制。

**所以在服务接接受到接口调用时，他的处理是：**

```java
    public boolean sendMail(MailSendDTO sendDTO) {
        //处理服务器内附件
        if (ObjectUtil.isNotNull(sendDTO.getFiles()) && sendDTO.getFiles().getCellData() == SolverEnum.PROVIDER) {
            if (CollectionUtil.isNotEmpty(sendDTO.getDatas())) {
                Object o = sendDTO.getDatas().get(SolverDataTypeEnum.ANNEX_FILE);
                if (ObjectUtil.isNotNull(o)) {
                    List<String> files = (List<String>) o;
                    sendDTO.annexFile(SolverEnum.NONE, files.toArray(new String[]{}));
                }
            }
        }
    }
```

最后在邮箱发送层时，我们可以拿到文件的二进制数组，邮箱内容，主题等等...，将他们进行邮箱的发送处理：

```java
    @Override
    public void send(MailSendDTO mailSend) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = null;
        try {
            mimeMessageHelper = new MimeMessageHelper(mimeMessage, true);
            // 邮件发送来源
            mimeMessageHelper.setFrom(from);
            // 邮件发送目标
            mimeMessageHelper.setTo(mailSend.getTos());
            // 设置标题
            mimeMessageHelper.setSubject(mailSend.getSubject());
            mimeMessageHelper.setText(mailSend.getText());
            //发送日期
            if (ObjectUtil.isNotNull(mailSend.getSendDate())) {
                mimeMessageHelper.setSentDate(mailSend.getSendDate());
            }
            //HTML文本
            if (StrUtil.isNotBlank(mailSend.getHtml())) {
                mimeMessageHelper.setText(mailSend.getHtml(), true);
            }
            //附件
            if (ObjectUtil.isNotNull(mailSend.getFiles()) &&
                    mailSend.getFiles().getCellData() == SolverEnum.NONE &&
                    CollectionUtil.isNotEmpty(mailSend.getFiles().getMateDate())) {
                for (MailFileDTO fileDTO : mailSend.getFiles().getMateDate()) {
                    File file = File.createTempFile("temp",null,null);
                    try {
                        FileCopyUtils.copy(fileDTO.getArrays(), file);
                        mimeMessageHelper.addAttachment(fileDTO.getFileName(), file);
                    }finally {
                        file.deleteOnExit();
                    }
                }
            }
            javaMailSender.send(mimeMessage);
            logger.info("发送邮件[{}]成功", mailSend.getSubject());
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("邮件发送失败,title[" + mailSend.getSubject() + "]", e);
        }
    }
```

这样，一个非常灵活、拓展性高的文件邮箱的RPC服务就可以实现出来。

此外除了文件，针对HTML的模板内容，我们可以更加以对象驱动为源头进行同样的设计。

有兴趣的可以详细见项目：

[https://github.com/LeYunone/service-center](https://github.com/LeYunone/service-center)
