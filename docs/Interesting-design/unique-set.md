---
date: 2022-04-17
title: 集合去重方案Function<T,R>
category: 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: Java,乐云一,函数式接口,集合去重
  - - meta
    - name: description
      content: Function<T, R>函数接口自定义一个UniqueSet
---
# Function<T, R>函数接口自定义一个UniqueSet

在开发中，有很多地方需要实现：
一个List中Person对象，根据Person对象中的age年龄去重，留下年龄不重复的集合。

## 实现方案一：
也是最传统最简单的：![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210445.jpg)
```
        List<Person> list = new ArrayList();
       //将list转成TreeSet 自定义一个比较器compartor

        Set be_set = new TreeSet(new Comparator<Person>() {

            @Override
            public int compare(Person o1, Person o2) {
                return o1.getAge().compareTo(o2.getAge());
            }
        });
        be_set.addAll(list);
        return ArrayList(be_set)
```
这个方案实现原理很简单，将list转换为set;由于set的不可重复的特性，加上自定义比较的comparator，key达到去重的效果。
如果需要的结果不是整个对象，而是普通数据存储[包装类、String]。
则可以更简单的使用JDK8的引入的stream()以及提供的map()接口,collect()接口轻松达到：
```
     Set<Integer> set =list.stream().map(Person::getAge).collect(Collectors.toSet());
     return new ArrayList(set);
```

## 实现方案二：
通过自定义一个唯一规则，定义一个uniqueSet。
通过Function<T，R> 函数式接口，以及Set底层map的特点，实现重复时不添加，不重复添加map的效果。![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210521.jpg)
.
**Function<T,R>**
JDK8引入的函数式接口，其特点是：接受一个T，返回一个R。
其中R的生成规则，可由定义接口时，通过链式 -> XXXX 指定。
比如：
```
        Function<Integer,Integer> f1  = i->i+2;
```
则说明，当使用f1.apply(1)时，根据定义的函数i=i+2，会返回一个3出来。
那么通过这样的特性。
我们是不是可以定义一个这样的函数： k =  V，
K = “**想要去重的属性唯一值**”
V = “**这个唯一值，对应的对象**”
说做就做，配合Map：
```
public class UniqueSet<K,V> extends AbstractSet<V> implements Serializable {
    
    private static final long serialVersionUID = 1L;

    //set的底层是一个map，那么我们可以用其中的value，作为判断对象中的唯一属性的媒介
    private Map<K,V> map;
    
    private final Function<V,K> uniqueCondition;

    public UniqueSet(Function<V, K> uniqueCondition) {
        map = new HashMap<>();
        this.uniqueCondition = uniqueCondition;
    }
```

简单的定义出一个，unique规则的set，但是这也只是个骨架，肉还是来自里面的方法。
那么作为set，在去重中的定位应该是这样的流程：
List转换为set，set在转换为List返回出去。
**第一步**：
List转换为set，相当于**set.addAll(list)**
我们调用set.addAll(list)时，由AbstractSet指定。调用其特征类的add方法。
当我们没有重写add方法时，会调用到AbstractSet，然后直接抛出异常。
```
    public boolean add(E e) {
        throw new UnsupportedOperationException();
    }
```
重写add(V v):
```
    @Override
    public boolean add(V v){
        //如果V[对象] 申请出来的值[属性]，
        V put = map.put(this.uniqueCondition.apply(v), v);
        return null == put;
    }
```
this.uniqueCondition.apply(v)申请出来的是对象的属性值。
那么在调用addAll方法时，经过重写的add方法，就会做出如下逻辑：
当这个对象在函数接口中申请出来的值[对象的属性]，存在；
由于map的特性，key不可重复，则会覆盖掉之前重复这个属性值的对象。
收集这个新对象。

### 细节
通过上面定义一个Fuction接口，并且重写add方法。
已经可以达到进入到uniqueSet的集合会由定义的某个属性值去重。
但是我们一定需要重写**：iterator**和**size**
```
    @Override
    public Iterator<V> iterator() {
        return map.values().iterator();
    }

    @Override
    public int size() {
        return map.size();
    }
```
理由不言而喻，懂的都懂![emo](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/emo/QQ图片20220302210528.gif)
最后贴出完整的代码和测试。
### UniqueSet：
```
/**
 * @author LeYuna
 * @date 2022-04-17
 *  自定义一个唯一key[对象属性] 的set
 */
public class UniqueSet<K,V> extends AbstractSet<V> implements Serializable {
    
    private static final long serialVersionUID = 1L;

    //set的底层是一个map，那么我们可以用其中的value，作为判断对象中的唯一属性的媒介
    private Map<K,V> map;
    
    private final Function<V,K> uniqueCondition;

    public UniqueSet(Function<V, K> uniqueCondition) {
        map = new HashMap<>();
        this.uniqueCondition = uniqueCondition;
    }
    
    @Override
    public boolean add(V v){
        //如果V[对象] 申请出来的值[属性]，
        V put = map.put(this.uniqueCondition.apply(v), v);
        return null == put;
    }
    
    @Override
    public Iterator<V> iterator() {
        return map.values().iterator();
    }

    @Override
    public int size() {
        return map.size();
    }
}
```
### Test测试
```
    public static void main(String[] args) {
        List<Person> list = new ArrayList<>();
        Person person = new Person();
        person.setAge(1);
        person.setId("1");
        Person person2 = new Person();
        person2.setAge(1);
        person2.setId("2");
        Person person3 = new Person();
        person3.setAge(3);
        person3.setId("3");
        list.add(person);
        list.add(person2);
        list.add(person3);
        UniqueSet uniqueSet = new UniqueSet<>(Person::getAge);
        uniqueSet.addAll(list);
        ArrayList<Person> arrayList = new ArrayList<>(uniqueSet);
        for(Person person1 : arrayList){
            System.out.println(person1);
        }
    }

结果： Person(id=2, name=null, age=1)
       Person(id=3, name=null, age=3)
```
