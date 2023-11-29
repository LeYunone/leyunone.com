---
date: 2023-11-22
title: 对应用\用户习惯而言的操作记录业务
category: 
  - 业务
tag:
  - 业务
---
# 方法操作日志

`操作`，这一简单两字，对于一款应用而言，在各个角度上看他是存有歧义的：

- 对于产品经理来说，操作是用户使用产品留下的 `习惯` 的动作
- 对于用户来说，操作是我建立某个可见性 `订单` 的动作
- 对于前端开发来说，操作是用户点击每一个按钮、文字、跳转...等等组件的动作
- 对于后端开发来说，操作是用户在数据库操作所留下的记录

那么我们该如何记录这些操作？

记录这些操作又有什么用？

本篇会以后端程序员的视角来看待 用户操作在应用中的定义。



## 如何记录操作

对于JAVA程序员来说，日志这两个字一定熟悉的不能在熟悉的名词

在Log4j的应用中，仅仅是一个日志打印，就可以追踪很多用户的操作行为。

但是此日志并非彼之日志，操作日志并非开发们平时调试程序所留下 调试日志点；操作更关注的是用户在什么时候做了什么，得到了什么结果这么一段链路。

那么记录操作重点在于理解什么才是用户的操作，在上面有说，从后端的角度上看， `操作是用户在数据库操作所留下的记录` ；

因为只有对数据进行编辑或查询，操作才算有效，况且记录操作的目的只有两种：

1. 记录用户使用习惯，统计功能高频点
2. 管理类系统进行操作记录

不管哪一种，都是会在数据库中留下痕迹。因此如何记录操作，则是对指定的接口\方法的出入参作定制化的日志记录。

看到这，不知你的脑子是否立马会蹦出一个词：`AOP`

涉及到了 `日志` 、`监听` 当然少不了设计中的AOP增强方法的思路

因此不管使用Cglib还是JDK，都可以实现监听指定接口\方法的记录动作，那么难点就在于定制化记录问题了。

比方说：用户创建订单，什么时候创建，名为什么的订单，订单的核心内容是什么

用户删除消息，什么时候删除，删除的消息是什么

.......

每个接口\方法的入参都不相同，那么如何做到定制化的思路呢？

可以参考`自定义注解` + `策略模式` 

见下述：

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface OperationLog {
    
    OperationModuleEnum module();
    
    OperationTypeEnum type();

    Class<? extends LogHandler<?>> handler();
    
}
```

其中 `OperationModuleEnum` 为操作的模块，指定这个功能的所属块，比如用户模块、订单模块、图片模块....；

`OperationTypeEnum` 为操作的类型，不管是什么操作，永远离不开增删改查，除此之外还可以定制比如发送验证码、触发推送等等

`handler` 为定制化记录问题的核心处理器，指定该方法交给哪个处理器处理

这样通过 模块+操作类型 => 指定给日志记录处理器，就可以达到定制化的设置某个方法需要进行哪种记录的模式了。

然后问题点就来到了：

- 入参与出参
- 如何定制化

从流程入口开始，使用spring-aop捕捉方法

```java
@Aspect
@Component
public class OperationLogAspect {
    @Autowired
    private OperationLogService operationLogService;
  
    @Around("@annotation(operationLog)) ")
    public Object outLog(ProceedingJoinPoint point,OperationLog operationLog) throws Throwable {
        MethodSignature methodSignature = (MethodSignature)point.getSignature();
        Method method = methodSignature.getMethod();
        OperationLog annotation = method.getAnnotation(OperationLog.class);
        if(ObjectUtil.isNotNull(annotation)) {
            //写入操作日志
            Class<?> bean = annotation.module().getLogBean();
            Object o = bean.newInstance();
            Object[] args = point.getArgs();
            /**
             * 循环遍历参数填充日志对象属性 不考虑覆盖因素
             */
            for(Object arg :args){
                BeanUtil.copyProperties(arg,o);
            }
            operationLogService.doRecord(OperationLogBean.builder().module(annotation.module())
                    .type(annotation.type()).handlerClass(annotation.handler()).logBean(o).build());
        }
        return point.proceed();
    }
}
```

入参收集普遍只有两种，一种是多个参数时，操作的对象在其中的一个参数中或在各个参数中；第二种是只有一个参数，操作对象的属性都在这个参数中。

那么就需要结合业务场景去做入参的收集，比方上上述的案例，适用于对 `增删改查` 的操作进行记录。

因为新增时的入参属性只会是一个个参数累加成最终的实体类；修改时只会是根据某个标识，然后和新增一样累加成最终的实体类；删除只会根据某个标识；

因此，简单操作的记录大概率是不需要考虑参数覆盖的问题。

此外，对于比较复杂的方法记录，比如多个入参，需要收集的参数为指定的某个；

那么就需要额外构建一个日志记录的操作对象，然后将此对象与方法的入参的配对关系通过 key - value 的方式，采用工具类 + 指定参数转换器的方式将其特殊化处理。

最后对于 **记录处理器**的设计，非常简单，仅需要通过查询、比对的方式就可以判断出本次操作，修改的是什么，新增的是什么

首先通过 `ApplicationContextAware` Spring上下文，通过自定义注解中的 `Class<?>` 拿到本次使用的处理器 

**处理器接口**

```java
public interface LogHandler<T> {

    LogResultBean write(T t, OperationTypeEnum type);
}
```

**案例【用户模块】**

```java
public class UserLogHandler implements LogHandler<UserLogBean> {

    @Autowired
    private UserDao userDao;
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public LogResultBean write(UserLogBean userLogBean, OperationTypeEnum type) {
        String userIdf = null;
        if(StringUtils.isBlank(userLogBean.getUserName()) && StringUtils.isNotBlank(userLogBean.getAccount())){
            //拿到操作对象 根据入参中的标识，判断：新增时与更新时
        }else{
        }
        sb.append(userIdf);
        //如果是更新操作 那么就进行比对判断
        if(type == OperationTypeEnum.UPDATE) {
            UserDO userDO = userDao.selectByAccount(userLogBean.getAccount());
            if(!userDO.getUserName().equals(userLogBean.getUserName())) {
				//姓名发生变动
            }
            if(!userDO.getDepartmentInfo().equals(userLogBean.getDepartmentInfo())){
                //部门发送变动
            }
            if(!passwordEncoder.matches(userLogBean.getPassword(),userDO.getPassword())){
				//更新密码
            }
            if(!userDO.getRoleId().equals(userLogBean.getRoleId())){
                //修改角色
            }
        }
        return LogResultBean.builder().operationObject(userIdf).build();
    }
}
```

以上就可以简单的针对一个方法，模块化的进行方法操作的记录，在需要记录的稍复杂的方法中。

万变不离其中，首先是方法需要配置操作日志功能在方法入参中填充本次操作对象的标识，比如更新、删除->主键；发送验证码->手机号；查询->查询条件 ......；

然后是对出、入参是否转化的处理与收集

最终是将其丢进定制向的处理器中。

## 记录操作又有什么用

大数据就是财富，这点不管在哪个行业、哪个应用中都是永恒的真理。

**对于产品来说：**

因此记录用户的操作，细致到数据库的数据变化，将其统计就可以得到一份这个APP中每个功能的使用频率报表；

那么产品就可以根据此进行优化升级，甚至为下一个应用的需求计划提供参考性数据

**对于产品的稳定性来说：**

在遇到问题时，可以少掉很多很多扯皮的过程，因为问题在哪，什么时间产生的，数据是什么，这些可以作为定位问题的高频证据。

因此有这些数据在，可以将此设置在后台系统的列表中，作为监控系统的一部分。

**总结**

```
- 便于进行数据追溯
- 便于开发者日志调试
- 便于统计功能的适用情况
```

**缺陷**

需要考虑对原业务的影响以及考虑对数据库压力、调用频率的空间限制
