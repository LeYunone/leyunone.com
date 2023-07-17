---
date: 2021-10-13
title: LeetCode-647. 回文子串
category: 刷题日记
tag:
  - LeetCode
head:
  - - meta
    - name: keywords
      content: LeetCode,乐云一,算法,刷题日记
  - - meta
    - name: description
      content: 乐云一刷题日记！！！
---
**示例**：
```
输入：s = "abc"
输出：3
解释：三个回文子串: "a", "b", "c"
```
```
输入：s = "aaa"
输出：6
解释：6个回文子串: "a", "a", "a", "aa", "aa", "aaa"
```
## 思路
回文子串问题在之前[最长回文子串](https://leyuna.xyz/#/blog?blogId=46)中探讨过。
本题是求所有回文子串的数目，
还是找回文子串的问题，那么依然可以使用 **最长回文子串中** ，找回文子串的中心扩展法。
解题步骤：
1. 遍历原字符串‘aaa’，从头取‘a’
2. 以‘a’为中心，向左右两边扩展，并且计数，如果符合回文串条件：左右两边相同那么计数+1
3. 以‘aa’为中心，向左右两边扩展，并且计数，如果符合回文串条件，左右两边相同那么计数+1
4. 重复步骤1，取第二个a

步骤2和步骤3，是因为在回文串中有两种情况，一是奇数回文串，以a为中心，二是偶数回文串，以aa为中心。
需要两者一起考虑

## 代码
```
    public int countSubstrings(String s) {
        int result=0;
        for(int i=0;i<s.length();i++){
            int sum=orderStr(s,i,i);
            int sum2=orderStr(s,i,i+1);
            result=result+sum2+sum;
        }
        return result;
    }

    public int orderStr(String s,int left,int right){
        //计算当前遍历下标的所有回文串
        int sum=0;
        while(left>=0 && right<s.length() && s.charAt(left)==s.charAt(right)){
            sum++;
            left--;
            right++;
        }
        return sum;
    }
```
