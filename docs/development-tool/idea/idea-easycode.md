---
title: Idea插件-Easy Code
category: 插件
tag:
  - 插件
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,字节码详解,Java 基本数据类型,装箱和拆箱
  - - meta
    - name: description
      content: 全网质量最高的Java基础常见知识点和面试题总结，希望对你有帮助！
---

![QQ截图20210907155908.png](https://www.leyuna.xyz/image/2021-09-07/QQ截图20210907155908.png)width="auto" height="auto"}}}
# Easy Code模板的神
## 说明书
![QQ截图20210908140729.png](https://www.leyuna.xyz/image/2021-09-08/QQ截图20210908140729.png)width="auto" height="auto"}}}
Easy Code是一款自动化模板插件，只要设定好其中的模板样式，就可以连接数据库，生成其对应表的模板代码。
### Type Mapper
![QQ截图20210908143020.png](https://www.leyuna.xyz/image/2021-09-08/QQ截图20210908143020.png)width="auto" height="auto"}}}
这里设置的，是数据库的数据类型和程序中，实体类对应的数据类型。
例如LongText-> String ;dataTime->LocalDateTime
### Template Setting
![image.png](https://www.leyuna.xyz/image/2021-09-08/image.png)width="auto" height="auto"}}}
模板配置，在这里编写好需要生成的代码模板。给个例子
比如如果我想自动生成数据库表的实体类entry、原子服务dao、原子方法impl、映射文件mapper。
#### 实体类entry
```
package com.blog.daoservice.entry;
#set($tableName = $tableInfo.name)
$!callback.setFileName($tool.append($tableName, ".java"))
$!callback.setSavePath($tool.append($modulePath, "/src/main/java/com/blog/daoservice/entry"))
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.*;

/**
 * $!{tableInfo.comment}($!{tableInfo.name})实体对象
 *
 * @author $!author
 * @since $!time.currTime()
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Builder
@TableName("$tool.hump2Underline($tableInfo.name)")
public class $!{tableName} implements Serializable{
   private static final long serialVersionUID = $!tool.serial();
#foreach($column in $tableInfo.fullColumn)

    #if(${column.comment})/**
    * ${column.comment}
    */#end
    #if($column.obj.getName().equals("id"))
    @TableId(value = "$!{column.name}",type = IdType.AUTO)
    #else 
    @TableField(value = "$tool.hump2Underline($!{column.name})") 
    #end
    private $!{tool.getClsNameByFullName($column.type)} $!{column.name};
#end
}

```
可以看出Easy Code提供的模板语法还是很接近编码语言的，所以只需要掌握他提供的各类API使用。
为了方便理解，再展示一个例子
#### 原子方法 impl
```
package com.blog.daoservice.impl;
#set($tableName = $tableInfo.name)
$!callback.setFileName($tool.append($tableName, "DaoImpl.java"))
$!callback.setSavePath($tool.append($modulePath, "/src/main/java/com/blog/daoservice/impl"))

import com.blog.daoservice.dao.$!{tableName}Dao;
import com.blog.daoservice.entry.$!{tableName};
import com.blog.daoservice.mapper.$!{tableName}Mapper;
import org.springframework.stereotype.Service;

/**
 * $!{tableInfo.comment}($!{tableInfo.name})原子服务
 *
 * @author $!author
 * @since $!time.currTime()
 */
@Service
public class $!{tableName}DaoImpl extends SysBaseMpImpl<$!{tableName}Mapper,$!{tableName}> implements $!{tableName}Dao {
}
```
### API
撇开Easy Code提供的说明文档，使用中其实主要是围绕一个东西。
**$tableInfo.name**
和两个函数
```
$!callback.setFileName($tool.append($tableName, "DaoImpl.java"))  //生成的文件名 [表名+DaoImpl.java]
$!callback.setSavePath($tool.append($modulePath, "/src/main/java/com/blog/daoservice/impl"))//生成文件的路径
```
#### $tableinfo
$tableinfo.name = 表名
$tableinfo.fullColumn = 表中所有列
**使用场景**
获得表名:$!{tableinfo.name}
循环获得表中所有列，创建实体类:
```
#foreach($column in $tableInfo.fullColumn)

    #if(${column.comment})/**
    * ${column.comment}
    */#end
    #if($column.obj.getName().equals("id"))
    @TableId(value = "$!{column.name}",type = IdType.AUTO)
    #else 
    @TableField(value = "$tool.hump2Underline($!{column.name})") 
    #end
    private $!{tool.getClsNameByFullName($column.type)} $!{column.name};
#end
```
#### 工具类
![QQ截图20210908144558.png](https://www.leyuna.xyz/image/2021-09-08/QQ截图20210908144558.png)width="auto" height="auto"}}}

## 使用方法
当配置了模板之后，不用在意下面两个【Table Editor Config】和【Global Config】全局配置，已经可以直接使用Easy-Code一键生成模板代码
#### 步骤一：连接数据库
![QQ截图20210908145000.png](https://www.leyuna.xyz/image/2021-09-08/QQ截图20210908145000.png)width="550" height="auto"}}}
#### 步骤二：选中表
![QQ截图20210908145128.png](https://www.leyuna.xyz/image/2021-09-08/QQ截图20210908145128.png)width="400" height="400"}}}
#### 步骤三：设定模板
![QQ截图20210908145305.png](https://www.leyuna.xyz/image/2021-09-08/QQ截图20210908145305.png)width="auto" height="auto"}}}
关键使用是这里，要根据你的模板代码来进行更改。如果我的模板中
```
$!callback.setFileName($tool.append($tableName, "DaoImpl.java"))  //生成的文件名 [表名+DaoImpl.java]
$!callback.setSavePath($tool.append($modulePath, "/src/main/java/com/blog/daoservice/impl"))//生成文件的路径
```
生成文件路径的地方，我使用 $modulePath[图中对应的Module]+"/src/main/java/...."来指定文件生成的路径。
所以设置模板的时候，我不需要指定Package、RemovePre，只需要需要在哪个子模块中生成代码就行。
所以我的子模块中，daoservice为持久层模块，所以
![QQ截图20210908145644.png](https://www.leyuna.xyz/image/2021-09-08/QQ截图20210908145644.png)width="auto" height="auto"}}}
只需要这样设定，点击ok，就可以一键生成配置好了的模块代码。
然后api-dto 则是和持久层交互的出参，因为其中大部分的参数都和对应表实体类对应所以也可以进行模板化操作。
```
package com.blog.api.dto;
#set($tableName = $tableInfo.name)
$!callback.setFileName($tool.append($tableName, "DTO.java"))
$!callback.setSavePath($tool.append($modulePath, "/src/main/java/com/blog/api/dto"))
import lombok.*;

/**
 * $!{tableInfo.comment}($!{tableInfo.name})出参
 *
 * @author $!author
 * @since $!time.currTime()
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class $!{tableName}DTO {

#foreach($column in $tableInfo.fullColumn)

    #if(${column.comment})/**
    * ${column.comment}
    */#end
    private $!{tool.getClsNameByFullName($column.type)} $!{column.name};
#end
}
```
## 总结
因为网络上，很少有人提及Easy Code的APi模板语法的设计和使用，所以例出自己配置好了的模板代码，希望能给看到这篇文章的人些许帮助。
![u=383958315,2863741093&fm=26&fmt=auto&gp=0.webp](https://www.leyuna.xyz/image/2021-09-08/u=383958315,2863741093&fm=26&fmt=auto&gp=0.webp)width="auto" height="auto"}}}
