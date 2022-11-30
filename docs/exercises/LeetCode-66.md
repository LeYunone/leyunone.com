---
date: 2021-09-23
title: LeetCode-66. 加一
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
输入：digits = [4,3,2,1]
输出：[4,3,2,2]
解释：输入数组表示数字 4321。
```
## 思路
末尾元素加一，则需要考虑到其为9和前面的元素为9的情况。
有末尾元素相邻的连续的9的时候，其加1 =10 ，会自动往前面进一位。
所以就变成了，从尾遍历各元素的时候，判断是不是9，如果是9则变为0，继续往前遍历。
直到遇到不是9的元素，将其加1，返回数组。
## 代码
```
    public int[] plusOne(int[] digits) {
        for(int i=digits.length-1;i>=0;i--){
            if(digits[i]==9){
                digits[i]=0;
            }else{
                digits[i]=digits[i]+1;
                return digits;
            }
        }
        digits=new int[digits.length+1];
        digits[0]=1;
        return digits;
    }
```
