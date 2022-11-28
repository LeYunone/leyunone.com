---
date: 2021-09-23 11:20:09
title: LeetCode-58. 最后一个单词的长度
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
**示例:**
```
输入：s = "   fly me   to   the moon  "
输出：4
```
## 思路
因为是求最后一个单词的长度，所以首先应该想的是方向遍历。
目的也很清晰
1. 过滤后面的空格
2. 找到最后一个单词前的空格下标

## 代码
```
    public int lengthOfLastWord(String s) {
        int end=s.length()-1;
        while(end>0 && s.charAt(end)==' '){
            end--;
        }
        int start=end;
        while(start>=0 && s.charAt(start)!=' '){
            start--;
        }
        return end-start;
    }
```
