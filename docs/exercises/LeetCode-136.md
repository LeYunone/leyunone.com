---
date: 2021-09-26
title: LeetCode-136. 只出现一次的数字
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
**示例：**
```
输入: [2,2,1]
输出: 1
```
## 思路
首先题目里明确表示了用O(1)的空间，那么我们无法使用map表去判断重复元素了。
然后在原数组上去判断重复元素，最简单粗暴的是直接使用双循环，一个个数判断。
但是这样也太不优雅了。
对于重复元素，其实在数学中还有一种处理方式：位运算。
当有两个重复数字 10和10 时。

![QQ截图20210926150031.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-26/QQ截图20210926150031.png)

使用异或 ^ 运算，相同的为0，不相同的为1。
那么当数组是[4,10,10]时，有
![QQ截图20210926150249.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-26/QQ截图20210926150249.png)
使用异或运算时，会将计算的两个数保存在一个数中，所以这样操作可以将所有的重复元素消除掉，最终得到的就是唯一一个没有重复元素的值。
## 代码
```
    public int singleNumber(int[] nums) {
        int result=0;
        for(int num:nums){
            result^=num;
        }
        return result;
    }
```
