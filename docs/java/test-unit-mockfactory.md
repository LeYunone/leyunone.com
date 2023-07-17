---
date: 2023-05-28
title: 单元测试-mock工厂设计
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: JAVA,单元测试,工厂模式,Mock
---
# 自定义单元测试Mock工厂

单元测试是成为一个优质开发不可绕过的一个坎，由于业务覆盖性问题，在针对一个功能点设计单测时，会因为该功能涉及的 `Dao` `service` `...` 类过多；导致一个简单的单元测试，过多的Mock，出现可读性差的情况。

所以简单的设计了一个极大的简化单元测试[mock]的工具工厂。

## 代码

先直接上代码：

```java
package com.leyunone.laboratory.core.factory;

import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import lombok.SneakyThrows;
import org.mockito.Mockito;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 单元测试 mock工厂 
 * @author leyunone
 */
public class MockBeanFactory {

    private volatile static MockBeanFactory factory;

    private MockBeanFactory() {
    }

    public static MockBeanFactory buildMockBeanFactory() {
        if (ObjectUtil.isNull(factory)) {
            synchronized (MockBeanFactory.class) {
                if (ObjectUtil.isNull(factory)) {
                    factory = new MockBeanFactory();
                }
            }
        }
        return factory;
    }

    private Map<Class<?>, Object> map = new HashMap<>();

    /**
     * 获得内置全被mock的对象
     * 只拿最长的构造方法构建
     *
     * @param clazz
     * @param <T>
     * @return
     */
    @SneakyThrows
    public <T> T getBeMockBean(Class<T> clazz) {
        Constructor<?>[] declaredConstructors = clazz.getDeclaredConstructors();
        Constructor allParamConstr = null;
        Class[] paramters = null;
        int len = Integer.MIN_VALUE;
        for (Constructor constructor : declaredConstructors) {
            Class[] parameterTypes = constructor.getParameterTypes();
            if (parameterTypes.length > len) {
                allParamConstr = constructor;
                paramters = parameterTypes;
                len = parameterTypes.length;
            }
        }
        Object[] params = new Object[paramters.length];
        for (int i = 0; i < paramters.length; i++) {
            Object mock = Mockito.mock(paramters[i]);
            params[i] = mock;
            map.put(paramters[i], mock);
        }
        return (T) allParamConstr.newInstance(params);
    }

    /**
     * 获得内置部分mock对象
     *
     * @param clazz
     * @param exclude 排除非mock对象
     * @param <T>
     * @return
     */
    @SneakyThrows
    public <T> T getBeMockBean(Class<T> clazz, Object... exclude) {
        if (exclude.length == 0) return this.getBeMockBean(clazz);
        Constructor<?>[] declaredConstructors = clazz.getDeclaredConstructors();
        Constructor allParamConstr = null;
        Class[] paramters = null;
        int len = Integer.MIN_VALUE;
        Map<? extends Class<?>, Object> excludeMap = CollectionUtil.newArrayList(exclude).stream().collect(Collectors.toMap(Object::getClass, Function.identity()));
        for (Constructor constructor : declaredConstructors) {
            Class[] parameterTypes = constructor.getParameterTypes();
            if (parameterTypes.length > len) {
                allParamConstr = constructor;
                paramters = parameterTypes;
                len = parameterTypes.length;
            }
        }
        Object[] params = new Object[paramters.length];
        for (int i = 0; i < paramters.length; i++) {
            Class<?> param = paramters[i];
            Object excludeObj = getExclude(excludeMap, param);
            if(ObjectUtil.isNotNull(excludeObj)){
                params[i] = excludeObj;
            }else{
                Object mock = Mockito.mock(paramters[i]);
                params[i] = mock;
                map.put(paramters[i], mock);
            }
        }
        return (T) allParamConstr.newInstance(params);
    }

    /**
     * 无参构造构建全mock对象
     * @param clazz
     * @param <T>
     * @return
     */
    @SneakyThrows
    public <T> T getBeMockBeanNoConstructor(Class<T> clazz){
        T t = clazz.newInstance();
        Field[] declaredFields = t.getClass().getDeclaredFields();
        for(Field field : declaredFields){
            boolean accessible = field.isAccessible();
            field.setAccessible(true);
            Class<?> type = field.getType();
            Object mock = Mockito.mock(type);
            field.set(t,mock);
            field.setAccessible(accessible);
            map.put(type,mock);
        }
        return t;
    }

    /**
     * 无参构造构建部分mock对象
     * @param clazz
     * @param exclude auto注入对象
     * @param <T>
     * @return
     */
    @SneakyThrows
    public <T> T getBeMockBeanNoConstructor(Class<T> clazz, Object... exclude){
        if(ObjectUtil.isNull(exclude)) return this.getBeMockBeanNoConstructor(clazz);
        T t = clazz.newInstance();
        Field[] declaredFields = t.getClass().getDeclaredFields();
        Map<? extends Class<?>, Object> excludeMap = CollectionUtil.newArrayList(exclude).stream().collect(Collectors.toMap(Object::getClass, Function.identity()));
        for(Field field : declaredFields){
            boolean accessible = field.isAccessible();
            field.setAccessible(true);
            Class<?> type = field.getType();
            Object excludeObj = getExclude(excludeMap, type);
            if(ObjectUtil.isNotNull(excludeObj)){
                field.set(t,excludeObj);
            }else {
                Object mock = Mockito.mock(field.getType());
                field.set(t,mock);
                map.put(type,mock);
            }
            field.setAccessible(accessible);
        }
        return t;
    }

    private Object getExclude(Map<? extends Class<?>, Object> map, Class<?> clazz) {
        Set<? extends Class<?>> classes = map.keySet();
        for (Class<?> mapClass : classes) {
            if(clazz.isAssignableFrom(mapClass)){
                return map.get(mapClass);
            }
        }
        return null;
    }

    public <T> T getMockBean(Class<T> clazz) {
        return (T) map.get(clazz);
    }
}

```

**代码地址**： [https://github.com/LeYunone/leyuna-laboratory/blob/master/laboratory-core/src/main/java/com/leyunone/laboratory/core/factory/MockBeanFactory.java](https://github.com/LeYunone/leyuna-laboratory/blob/master/laboratory-core/src/main/java/com/leyunone/laboratory/core/factory/MockBeanFactory.java)

## 设计思想

**背景**： 需要对DoService 中的 XX方法 进行单元测试的覆盖， 其中，XX方法调用了 AService 、BService、CDao、DValid...



### **正常思路**：

通过：

```java
AService a = Mockito.mock(AService.class);
BService b = Mockito.mock(BService.class);
CDao c = Mockito.mock(CDao.class);
.....
```

将所有涉及类一个个Mockit出来，并且，如果DoService有重构构造方法。

比如使用的是构造器注入Bean的模式，还需要对构造器中每一个元素进行new，或者Mockit，才可以创建出DoService。



### **自定义工厂思路**：

**通过**：

```java
MockBeanFactory mockBeanFactory = MockBeanFactory.buildMockBeanFactory();
DoService doS = mockBeanFactory.getBeMockBean(DoService.class);
```

**工厂中**：

```java
    @SneakyThrows
    public <T> T getBeMockBean(Class<T> clazz) {
        Constructor<?>[] declaredConstructors = clazz.getDeclaredConstructors();
        Constructor allParamConstr = null;
        Class[] paramters = null;
        int len = Integer.MIN_VALUE;
        for (Constructor constructor : declaredConstructors) {
            Class[] parameterTypes = constructor.getParameterTypes();
            if (parameterTypes.length > len) {
                allParamConstr = constructor;
                paramters = parameterTypes;
                len = parameterTypes.length;
            }
        }
        Object[] params = new Object[paramters.length];
        for (int i = 0; i < paramters.length; i++) {
            Object mock = Mockito.mock(paramters[i]);
            params[i] = mock;
            map.put(paramters[i], mock);
        }
        return (T) allParamConstr.newInstance(params);
    }
```

将Mockit动作全部交给工厂处理，我们只需要通过  `mockBeanFactory.getMockBean(AService.class);`

就可以拿到已被Mock的类，进行具体方法的Mock。

并且由于使用反射的办法，即使是构造器注入的模式，也可以直接使用从中生产的DoService。

### 拓展

基于对部分方法需要Mock，部分采用Spring容器中走Db/三方/RpC...等服务的接口覆盖原则。

自定义工厂还可以提供：

```java
    @SneakyThrows
    public <T> T getBeMockBeanNoConstructor(Class<T> clazz, Object... exclude){
        if(ObjectUtil.isNull(exclude)) return this.getBeMockBeanNoConstructor(clazz);
        T t = clazz.newInstance();
        Field[] declaredFields = t.getClass().getDeclaredFields();
        Map<? extends Class<?>, Object> excludeMap = CollectionUtil.newArrayList(exclude).stream().collect(Collectors.toMap(Object::getClass, Function.identity()));
        for(Field field : declaredFields){
            boolean accessible = field.isAccessible();
            field.setAccessible(true);
            Class<?> type = field.getType();
            Object excludeObj = getExclude(excludeMap, type);
            if(ObjectUtil.isNotNull(excludeObj)){
                field.set(t,excludeObj);
            }else {
                Object mock = Mockito.mock(field.getType());
                field.set(t,mock);
                map.put(type,mock);
            }
            field.setAccessible(accessible);
        }
        return t;
    }

    private Object getExclude(Map<? extends Class<?>, Object> map, Class<?> clazz) {
        Set<? extends Class<?>> classes = map.keySet();
        for (Class<?> mapClass : classes) {
            if(clazz.isAssignableFrom(mapClass)){
                return map.get(mapClass);
            }
        }
        return null;
    }
```

自定义对指定类不进行Mock的功能，使用起来也很简单。

在Spring单测环境中，首先通过@Autowired/@Resource 修饰需要排除的类**AService**，然后使用

`mockBeanFactory.getBeMockBeanNoConstructor(DoService.class,AService.class)`

## 缺点

没有覆盖到静态方法。

不过关于静态方法的Mock，建议使用三方包：

```xml
        <dependency>
            <groupId>org.powermock</groupId>
            <artifactId>powermock-module-junit4</artifactId>
            <scope>test</scope>
            <exclusions>
                <exclusion>
                    <artifactId>objenesis</artifactId>
                    <groupId>org.objenesis</groupId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.powermock</groupId>
            <artifactId>powermock-api-mockito2</artifactId>
            <scope>test</scope>
        </dependency>
```

