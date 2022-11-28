---
date: 2022-04-11 14:52:40
title: Mybatis-Interceptor拦截Sql的始作俑者
category: 
  - Mybatis
tag:
  - Mybatis
head:
  - - meta
    - name: keywords
      content: JVM,Mybatis,拦截器,Sql
  - - meta
    - name: description
      content: Mybatis-plus的分页插件中，使用了Interceptor接口，对sql语句进行拦截做逻辑加强。那么我们是否也可以去拦截sql，做出有利于自己业务的加强呢。
---

# 拦截Sql-Interceptor

>  Mybatis-plus的分页插件中，使用了Interceptor接口，对sql语句进行拦截做逻辑加强。那么我们是否也可以去拦截sql，做出有利于自己业务的加强呢。

## Interceptor是什么
拦截器，注释
```
@Intercepts({@Signature(
    type = StatementHandler.class,
    method = "prepare",
    args = {Connection.class, Integer.class}
)})
```
重要的，明确的，要知道的三个属性：
1. type，拦截的类
2. method，拦截类的方法
3. args，拦截类的方法的入参。

有了以上三个参数，相当于定位到了一个方法。
而Interceptor做的，就是在这个方法执行前，进行拦截。

## Interceptor能做什么
拦截器有很多重要，这里重点讲最近接触的比较多的，对sql进行拦截。
**首先**是创建@Intercepts，定位拦截sql的方法。
```
@Intercepts(value = {
        @Signature(type = Executor.class,
                method = "update",
                args = {MappedStatement.class, Object.class}),
        @Signature(type = Executor.class,
                method = "query",
                args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class,
                        CacheKey.class, BoundSql.class}),
        @Signature(type = Executor.class,
                method = "query",
                args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class})})
```
可以发现，这里使用了多个@Signature，作用是拦截指定的多个方法。
而恰好这三个，代表的就是Sql操作的，增删改查。
当然了，这里是直接拦截了Executor执行器的进行。
我们也可以像最开始那样。
拦截StatementHandler中的prepare方法，也可以达到同样的效果。

**然后**重写intercept【拦截】方法
```
@Override
    public Object intercept (Invocation invocation)
```
这里就需要debug了，在拦截sql时，invocation中有一个重要的属性。
```
    private final Object[] args;
```
args中存储的就是本次拦截方法的入参，那么根据Executor的入参，我们可以得到：
1. MappedStatement【sql组件】
2. parameter【sql的入参】

而MappedStatement组件中，存储的是本次db操作的所有信息。
包括sql、表、数据源、配置等等等等。
所以我们可以根据以下方法获得有效属性：
```
        //找到sql
        BoundSql boundSql = mappedStatement.getBoundSql(parameter);
        //DB配置员
        Configuration configuration = mappedStatement.getConfiguration();
        //操作类型
        SqlCommandType sqlCommandType = mappedStatement.getSqlCommandType();
        //获取大写sql语句
        String strSql = getSql(configuration, boundSql).toUpperCase();
```

```
    private String getSql (Configuration configuration, BoundSql boundSql) {
        Object parameterObject = boundSql.getParameterObject();
        List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
        String sql = boundSql.getSql().replaceAll("[\\s]+", " ");
        if (parameterObject == null || parameterMappings.size() == 0) {
            return sql;
        }
        TypeHandlerRegistry typeHandlerRegistry = configuration.getTypeHandlerRegistry();
        if (typeHandlerRegistry.hasTypeHandler(parameterObject.getClass())) {
            //如果 ？ 是对应的typeHandler，则说明是拼接参数 #
            sql = sql.replaceFirst("\\?", getParameterValue(parameterObject));
        } else {
            MetaObject metaObject = configuration.newMetaObject(parameterObject);
            for (ParameterMapping parameterMapping : parameterMappings) {
                String propertyName = parameterMapping.getProperty();
                //确定本参数是本次sql构造中的参数
                if (metaObject.hasGetter(propertyName)) {
                    Object obj = metaObject.getValue(propertyName);
                    //翻译参数类型，取代首个？
                    sql = sql.replaceFirst("\\?", getParameterValue(obj));
                } else if (boundSql.hasAdditionalParameter(propertyName)) {
                    //附加参数
                    Object obj = boundSql.getAdditionalParameter(propertyName);
                    sql = sql.replaceFirst("\\?", getParameterValue(obj));
                }
            }
        }
        return sql;
    }
```
其中解析获得Sql的过程，简单的概述就是。
拿到带有？【入参位置】的sql语句，与sql的配置员【负责类型匹配和语句】进行解析。
从左到右一个个的将值与？交换，最后得到一个完整的Sql语句。
**干预Sql语句**
前面有提到，我们可以得到本次db操作的MappedStatement。
那么我们是否可以自由的对MappedStatement中原本的信息随意的进行修改呢？
答案是肯定的。
只需要对原有的sql语句进行修改，然后替换掉statement中的sql就行。
具体过程就不多追述了，有很多中实现方案。
这里推荐使用CCJSqlParserUtil工具，来自jsqlparser。
**依赖：**
```
        <dependency>
            <groupId>com.github.jsqlparser</groupId>
            <artifactId>jsqlparser</artifactId>
            <version>2.1</version>
        </dependency>
```

**Sql结果**
在使用
```
        Object result = invocation.proceed();
```
可以得到result，本次db的数据结果。
那么我们可以在执行sql前后，计算执行时间。
而这个时间就是本次sql的执行效率，可以直观的反馈出日志。

## 总结
按照以上的说法，在拦截一个db操作后，除了存在的业务、逻辑上的增强外。
我们可以对本次db操作进行：**监控**、**干预**、**调整**....
Mybatis-plus的分页插件，使用的就是对sql语句进行干预，强行增加sql语句后的limit，并且监控sql语句执行，返回出原sql的数据数目。
所以如果不满意mp的分页插件，完全有能力自己去重写他的方法，对其进行增强。
