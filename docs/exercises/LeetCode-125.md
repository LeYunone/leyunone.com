---
title: LeetCode-125. 验证回文串
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
**示例：**
```
输入: "A man, a plan, a canal: Panama"
输出: true
解释："amanaplanacanalpanama" 是回文串
```
## 思路
很简单的回文串问题，对于字符串判断我们可以使用StringBuffer的reverse方法，直接将字符串反转和原字符串判断是否相等。
或者使用双指针，以头和尾向中间判断相等。
不过本题还需要一个环境，就是需要将除0-9、a-z、A-Z的无关字符剔除。
有很多方法，可以使用Character.isLetterOrDigit(ch)；jdk内置api，用来判断字符是否为数字或字母。
也可以使用正则匹配的方式，将字母和数字匹配出来。
上代码
## 代码
```
    public boolean isPalindrome(String s) {
        s=s.replaceAll("[^a-zA-Z0-9]","").toLowerCase();
        int left=0;
        int right=s.length()-1;
        while(right>=left){
            if(s.charAt(left)!=s.charAt(right)){
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
```
