---
date: 2023-08-26
title: String-hashcode引起的思考问题
category:
  - Java
tag:
  - Java
head:
  - - meta
    - name: keywords
      content: JAVA,hashcode,hash
---
# String的hashcode

**背景：**

在一个发送短信的功能中，我需要针对一个相同的内容以及手机号设立一个冷却期。所以如何判断相同的内容，单独拿出来简单，但是加上对这个内容的缓存判断，则不能暴力的将整个内容设为key值缓存。最终采取了内容的hashCode值+手机号码作为一个唯一的key值进行冷却期控制。

## 问题

**字符串相同，hashcode一定相同；hashcode相同，字符串不一定相同** ，这是String基于hash算法不可避免的问题。原理很简单，即String的hashcode是对字符串内容中的每一个`char[?]` 进行一次累加的hash运算。

于是乎在看了String的hashcode方法后，就引起了以下两个思考：

1. 有没有办法让hashcode相同，则字符串一定相同的理论出现在业务代码中。
2. 为什么hash值设定为 `int` 类型，既然是累加计算难道不担心越界问题吗

围绕这两个问题探索String的hashcode方法

### 问题一

回归到背景，我想通过内容的hashcode值去确保他的唯一性。

那么仅仅去调用 `String.hashcode()`方法，由于hash算法的规则性，是不足一支持一次内容的唯一。

既然hashcode不能保证唯一，那么我们可以往其中添加一些唯一性的调剂。

**方法一：**

构建对象：

```java
public class UniqueContent{
	
	private String content;
	
	private String uuid;

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;

		UniqueContent that = (UniqueContent) o;

		if (content != null ? !content.equals(that.content) : that.content != null) return false;
		return uuid != null ? uuid.equals(that.uuid) : that.uuid == null;
	}

	@Override
	public int hashCode() {
		return uuid.hashCode() * content.hashCode();
	}
}
```

既然String无法保证字符串的hashcode唯一，那么我们为此添加一个雪花算法的uuid的hashcode。在加上与原hashcode的乘积，最终的内容hashcode值 = `原内容hashcode` * `雪花标识hashcode`。

**方法二：**

在计算hash值的散列计算上，加入时间戳的计算。由于背景中需要唯一性的原因是确保内容在一分钟内进入冷却，那么我们则可以通过拿到上一分钟的整数分钟的时间戳，在获得hashcode后再进行时间戳内容的hash运算。

同理，除了时间戳，我们也可以通过截断内容\反转内容等操作将hash值变得尽可能多次去确保唯一。

### 问题二

```java
    public int hashCode() {
        int h = hash;
        if (h == 0 && value.length > 0) {
            char val[] = value;

            for (int i = 0; i < value.length; i++) {
                h = 31 * h + val[i];
            }
            hash = h;
        }
        return h;
    }
```

我们先着步分析String的hash运算

首先是几个知识：

- `31` 选择这个数作为乘数，是因为31是一个大小最合适Integer整形类型的质数，可以将分布区间在

   `[-2^31]` - `[2^31-1]` 上，并且31 = 32-1，离 2^5 = 32 最近，这样在计算hash时可以优化为 `(i << 5) - i `模式的位运算，更多的解释可以在 https://developer.aliyun.com/article/665663 中有详细解释。

- `hash` 为这个字符串常量当前的hash初始值

-  `val[i]` 是字符串中的char[]数组的每一位的ASCII码值

String的hash运算规则：

如果hash值 == 0 ，且数组长度 > 0 ，进行hash运算

hash值为0的可能：

- 未进行hash
- 进行过hash，但是 `31 * h + val[i]` 为0，查看ASCII表，只有为null时才为0；但是字符串中不可能出现null的ASCII。

因此`hash==0` 时，一定是该字符串未进行过hash运算。

回到hash计算中来：

目前我有一个字符串 `String str = "abcd";`

根据 `h = 31 * h + val[i];`

可以得到：

1. h = 31*0 + a（ASII值：97）= 97
2. h = 31*97 + b（ASII值：98）= 3105
3. h = 31*3105 + c（ASII值：99）= 96354
4. h = 31*96354 + d（ASII值：100）= 2987074

这里都很正常，但是当 字符串累加成 `String str = "abcdef";`时

hashcode值打印出来为 -1424385949；

熟悉Int类型的都知道，这明显是将超过4字节的数字塞入int中导致出现的 `变窄转换` 理论，即通过使用补码计算的方式将结果类型强行提升，把宽于int整形的部分全部丢弃。

并且由于反码与补码的计算，在将hashcode类型提升的过程中，即使是丢弃部分结果，也是一种hash分布的思路体现，所以最终在 `31` ，int区间 的整体讨论下，JVM选择将 `int`类型作为hash值的存储类型。





 
