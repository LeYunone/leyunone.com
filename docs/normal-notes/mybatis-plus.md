---
date: 2025-05-22
title: MyBatis-Plus不是垃圾，是你没把它用好
category:
  - 笔记
tag:
  - note
head:
  - - meta
    - name: keywords
      content: MyBatis-Plus,DAO,BaseRepository,封装,乐云一
  - - meta
    - name: description
      content: 看到网上有人嘲讽MyBatis-Plus，作为深度使用者忍不住说两句。分享一下我对MP的理解和封装思路，以及为什么觉得垃圾的人是因为没有正确运用。
---
# MyBatis-Plus不是垃圾，是你没把它用好

前阵子在某个技术论坛闲逛，看到一个帖子标题大概是"MyBatis-Plus就是一坨屎"。

点进去一看，楼主的抱怨大概集中在这几点：
- "SQL都封装好了，出了问题都不知道怎么改"
- "Wrapper套Wrapper，复杂查询写出来跟屎山一样"
- "Service层一堆方法，找个想要的比找对象还难"
- "跟JPA比起来就是原始社会"

底下跟着一堆人附和，什么"早就弃了"、"还是JPA优雅"之类的。

我默默关掉了帖子，喝了口咖啡，心想：**说得好像JPA你就用明白了一样。**

说实在的，作为一个从JPA转到MyBatis-Plus，并且基于它封装了一套自己的DAO层架构的人，我觉得有必要聊聊我对这个框架的理解。

不是为了吹它，而是想说清楚一件事：**框架没有垃圾的，只有没用对的。**

## MyBatis-Plus到底给了我们什么

在开始聊之前，先搞清楚MyBatis-Plus（以下简称MP）到底提供了什么。

说白了就三样东西：

**1. BaseMapper**

继承它，你就有了17个CRUD方法。`selectById`、`insert`、`updateById`、`deleteById`...不用写一行SQL。

**2. Wrapper系列**

`LambdaQueryWrapper`、`QueryWrapper`、`UpdateWrapper`...用来构建动态查询条件。

**3. ServiceImpl**

继承它，你又多了一堆批量操作、链式查询的方法。

就这？就这。

很多人抱怨MP不好用，本质上就是**只用了这三样东西的皮毛**，然后发现复杂场景搞不定，就开始骂框架。

但MP真正强大的地方在于：**它是一个很好的基础层，你可以在上面搭建适合自己团队的架构。**

## Service调DAO的正确姿势

先聊聊我理解的Service→DAO层的调用关系。

很多人用MP的时候，Controller直接调ServiceImpl，ServiceImpl里面直接写Wrapper。这在简单项目里没问题，但项目一复杂，代码就开始腐烂了。

为什么？因为**查询逻辑散落在各个Service里，没有统一规范，每个人写出来的查询风格都不一样。**

我的做法是，在Service和Mapper之间，再加一层Repository。结构是：

```
Controller → Service → Repository → Mapper
```

Repository层负责：
1. 封装通用的增删改查逻辑
2. 统一对象转换规则
3. 统一逻辑删除处理
4. 提供统一的查询接口

这样一来，Service层只关心业务逻辑，不需要操心查询条件怎么拼、DO怎么转DTO这些事。

## 我的BaseRepository架构

说干就干，我基于MP封装了一套BaseRepository。开源在这里：[leyuna-baseRepository](https://github.com/LeYunone/leyuna-baseRepository)

### 核心设计思路

整个架构的泛型定义为 `BaseRepository<M extends BaseMapper<DO>, DO>`，其中：

- **M**：MyBatis-Plus的Mapper接口
- **DO**：数据库实体对象

继承关系是：

```
ServiceImpl<M, DO>            ← MP提供的基类
    └── BaseCommon<M, DO>     ← 我封装的通用方法
        └── BaseRepository<M, DO>  ← 最终的基类
```

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/70835.png)

接口层面：

```java
public interface IBaseRepository<DO>
    extends IService<DO>, IOperationService<DO>, IQueryService<DO> {
}
```

`IOperationService`管增删改，`IQueryService`管查询，`IQueryPageService`管分页。

### 关键能力

**1. 自动对象转换**

最常用的场景是什么？前端传过来的DTO对象，要转成DO对象才能入库；查出来的DO对象，要转成VO对象才能返回给前端。

我在BaseCommon里通过反射自动处理这个转换：

```java
protected DO castToDO(Object o) {
    DO d = (DO) do_Class.newInstance();
    if (null != o) {
        BeanUtil.copyProperties(o, d);
    }
    return d;
}
```

这样调用的时候，你不需要手动做对象拷贝：

```java
// 直接传DTO，框架自动转DO
userRepo.insertOrUpdate(userDTO);
```

**2. 条件对象查询**

这是我封装的核心功能。不需要手写Wrapper，直接传一个对象进去，框架自动根据非空字段生成查询条件：

```java
// 用DTO对象查询，非空字段自动作为条件
List<User> users = userRepo.selectByCon(queryDTO);

// 查询并转换成VO
List<UserVO> vos = userRepo.selectByCon(queryDTO, UserVO.class);

// 查单条
UserVO vo = userRepo.selectOne(queryDTO, UserVO.class);
```

底层原理很简单——通过反射拿到对象的非空字段，设置到MP的`LambdaQueryWrapper`的entity属性上，MP会自动根据entity的非空字段做等值查询。

当然也支持手动传Wrapper做更精细的控制：

```java
List<UserVO> vos = userRepo.selectByCon(queryDTO, UserVO.class, wrapper -> {
    wrapper.gt(User::getAge, 18)
           .orderByDesc(User::getCreateTime);
});
```

**3. 逻辑删除自动处理**

逻辑删除这东西，说大不大说小不小，但是每次查询都要记得加`isDeleted = 0`的条件，忘一次就是一次线上事故。

我在BaseCommon里加了一个`deletedToFalse`方法：

```java
protected void deletedToFalse(Object con) {
    Field deletedField = aClass.getDeclaredField("isDeleted");
    Object value = deletedField.get(con);
    if (value == null) {
        deletedField.set(con, 0);  // 默认查未删除的
    }
}
```

每次查询前自动调用，确保不传`isDeleted`条件时默认查未删除的数据。

**4. BaseRepository2 — MapStruct版本**

如果你需要更高级的对象转换（比如字段名不一样、需要做类型转换），我还提供了`BaseRepository2`。

它支持传入一个MapStruct的Converter接口，框架在构造时自动扫描Converter里的方法，建立`Map<Class, Method>`的转换映射表。查询结果出来后，自动走对应的转换方法。

```java
// 定义Converter
@Mapper
public interface UserConverter {
    UserVO toVO(UserDO user);
    List<UserVO> toVOList(List<UserDO> users);
}

// 继承BaseRepository2，传入Converter接口
public class UserRepository
    extends BaseRepository2<UserMapper, UserDO, UserConverter> {
}
```

调用时：

```java
// 查出来的DO自动转成VO
List<UserVO> vos = userRepo.selectByCon(queryDTO, UserVO.class);
```

框架内部会自动找到`UserConverter.toVOList`方法来执行转换。

### 使用效果

整套架构用下来的效果就是——**Service层非常干净**。

一个典型的Service方法：

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    // 新增/修改
    public boolean save(UserDTO dto) {
        return userRepo.insertOrUpdate(dto);
    }

    // 条件查询
    public List<UserVO> list(UserQueryDTO query) {
        return userRepo.selectByCon(query, UserVO.class);
    }

    // ID查询
    public UserVO getById(Long id) {
        return userRepo.selectById(id, UserVO.class);
    }

    // 删除
    public boolean delete(Long id) {
        return userRepo.deleteById(id);
    }
}
```

没有一行Wrapper，没有一行对象拷贝，没有一行SQL。但是底层做的事情一样不少。

## 回到那个帖子

说了这么多，回到开头那个"MyBatis-Plus就是一坨屎"的帖子。

楼主抱怨的那些问题，真的存在吗？存在。但这些问题本质上是：

- "SQL都封装好了，出了问题都不知道怎么改" → 你没有理解MP的执行机制，也不知道怎么开SQL日志
- "Wrapper套Wrapper，复杂查询写出来跟屎山一样" → 你没有在DAO层做封装，把查询逻辑到处乱写
- "Service层一堆方法，找个想要的比找对象还难" → 你直接用了ServiceImpl，没有做自己的Repository抽象
- "跟JPA比起来就是原始社会" → 你用JPA也未必能玩明白

**觉得MyBatis-Plus垃圾的人，和觉得JPA垃圾的人，本质上是同一类人——没有深入理解框架，没有根据实际场景做架构设计，拿来就用，用不好就骂。**

MP给我最大的好处就是**可控性**。我知道每一条SQL是怎么来的，我知道每一个查询条件是怎么拼的，我知道出了问题该去哪里排查。在这个基础上，我再封装出自己的Repository层，让团队用起来简单、规范、高效。

这不比无脑骂框架强多了？

## 总结

MyBatis-Plus不是什么银弹，也不是什么垃圾。它就是一个工具，一个提供了基础CRUD能力和动态查询构建的工具。

你能用它做出什么样的架构，完全取决于你对它的理解和你的架构设计能力。

就像我封装的这套BaseRepository，说到底也就是在MP的基础上做了对象转换、条件查询、逻辑删除这三件事的统一封装。但就是这三件事，让整个团队的Service层代码量少了一半，规范统一了，维护也轻松了。

所以与其在网上跟人吵架JPA好还是MP好，不如想想怎么把你选的那个框架用好。

工具在手里，作品好坏看的是人。
