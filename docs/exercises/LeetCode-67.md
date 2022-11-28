---
date: 2021-09-24 10:11:56
title: LeetCode-67. 二进制求和
category: 刷题日记
tag:
  - LeetCode
head:
  - - meta
    - name: keywords
      content: LeetCode,算法,刷题日记
  - - meta
    - name: description
      content: 乐云一刷题日记！！！
---
**示例：**
```
输入: a = "1010", b = "1011"
输出: "10101"
```
## 思路
二进制数计算有两种方式，一是将两个字符串的二进制数转换为十进制数，相加计算后再转换回二进制。
理论上这样算出来的结果是没问题的，但是因为各语言的限制，在二进制转换十进制过程中很容易出现溢出的现象。
比如Java的，
- 如果字符串超过 3333 位，不能转化为 Integer
- 如果字符串超过 6565 位，不能转化为 Long
- 如果字符串超过 500000001500000001 位，不能转化为 BigInteger

所以对问题考虑的严谨性，还是考虑本题对两原字符串进行计算。
那么就要了解两个二进制数的加法规则了，‘逢二进1为0’。
:::align-center
![QQ截图20210924100703.png](https://www.leyuna.xyz/image/2021-09-24/QQ截图20210924100703.png)
:::
如图，知道两个二进制加法计算的时候，如果相同位为1的时候，结果为0并且向前进一位。
当遇到两字符串长短不一时，则向短的字符串前补0。
根据'逢二进1'的规则，可以翻译出代码
## 代码
```
    public String addBinary(String a, String b) {
        for(int i=a.length();i<b.length();i++){
            a="0"+a;
        }
        for(int i=b.length();i<a.length();i++){
            b="0"+b;
        }
        String result="";
        String temp="0";
        for(int i=a.length()-1;i>=0;i--){
            if(a.charAt(i)=='1' && b.charAt(i)=='1'){
                result=temp+result;
                temp="1";
            }else{
                if(temp.equals("1")){
                    if(a.charAt(i)=='0' && b.charAt(i)=='0'){
                        result=temp+result;
                        temp="0";
                    }else{
                        if(a.charAt(i)=='1' && b.charAt(i)=='1'){
                            result=temp+result;
                            temp="1";
                        }else{
                            result="0"+result;
                            temp="1";
                        }
                    }
                }else{
                    if(a.charAt(i)=='1' || b.charAt(i)=='1'){
                        result="1"+result;
                    }else{
                        result="0"+result;
                    }
                }
            }
        }
        if(temp.equals("1")){
            result=temp+result;
        }
        return result;
    }
```
这是很朴素的方法，仅通过字符判断加规则翻译得出结果。
