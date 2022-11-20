---
title: LeetCode-5. 最长回文子串
category: 刷题日记
tag:
  - LeetCode
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,字节码详解,Java 基本数据类型,装箱和拆箱
  - - meta
    - name: description
      content: 全网质量最高的Java基础常见知识点和面试题总结，希望对你有帮助！
---
**示例**
```
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案。
```
## 思路
回文子串问题有，最短回文子串，回文子串数目，以及本题的最长回文子串。
首先对于回文子串的定义，BAB,ABA。这样的正反读都一样的字符串称为回文子串。
那么，假设在字符串babad中，bab是他的回文子串，其中的a也是回文子串，当a是回文子串的时候。只需要将其左，右指针向各方移动。
若左指针指向的b和右指针指向的b相同，那么bab是回文子串。
依靠这个逻辑，可以知道。
确定了一个回文子串后，移动他的左右指针可以得到新的回文子串。
所以问题就演变为，怎么确定一个回文子串。
在一个字符串中，最短的字符串首先是当字符串。
![QQ截图20211012095319.png](https://www.leyuna.xyz/image/2021-10-12/QQ截图20211012095319.png)width="auto" height="auto"}}}
当最长字符串的中心为a时，即bab，一定是个奇数字符串。
所以当最长字符串是偶数字符串时，他的中心一定是偶数字符串。
![QQ截图20211012095544.png](https://www.leyuna.xyz/image/2021-10-12/QQ截图20211012095544.png)width="auto" height="auto"}}}
依靠两种求字符串的模式，可以写出解题步骤
1. 从头到尾遍历字符串
2. 默认情况：当遍历下标i时，默认他是单字符串，则移动他的左右边下标，直到左右边下标不相等时，下标i的最长回文字符串长度则是，right-left-1.
3. 特殊情况：当遍历下标i时，默认他是偶数字符串，则需要将右下标移至i+1位置，再进行 步骤2 的移动模式。
4. 遍历的过程中，记录此时最长的回文字符串长度，并且不断维护最长回文长度时，left和right的值。
5. 遍历完成，使用left和right切割原字符串得到最长回文子串

## 代码
```
    public String longestPalindrome(String s) {
        int start=0;
        int end=0;
        int max=0;
        for(int i=0;i<s.length();i++){
            int len=order(s,i,i);
            int len2=order(s,i,i+1);
            len=Math.max(len,len2);
            if(len>max){
                max=len;
                start=i-(len-1)/2;
                end=i+len/2;
            }
        }
        return s.substring(start,end+1);
    }

    public int order(String str,int left,int right){
        while(left>=0 && right<str.length() && str.charAt(left) == str.charAt(right)){
            left--;
            right++;
        }
        return right-left-1;
    }
```
