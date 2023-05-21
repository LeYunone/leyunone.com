---
date: 2021-11-03
title: LeetCode-162. 寻找峰值
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
**示例**
```
输入：nums = [1,2,3,1]
输出：2
解释：3 是峰值元素，你的函数应该返回其索引 2。
```
```
输入：nums = [1,2,1,3,5,6,4]
输出：1 或 5 
解释：你的函数可以返回索引 1，其峰值元素为 2；
     或者返回索引 5， 其峰值元素为 6。
```
## 思路
审题，题目中有一个很重要很重要的条件： > nums[-1] = nums[n] = -∞ 。
意味着，数组是无穷大小考虑的。
所以峰值一定存在。
解题思路一：
暴力循环，找到 i>i+1 和 i>i-1 的值返回即可。
解题思路二：
峰值，一定是一个大数，所以随机找到一个下标，从这个下标开始，一直往其前后对比后，大的数前进。
基于数组无穷的环境，一定会有一个小于这个数的两边出现。
![QQ截图20211103144029.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-03/QQ截图20211103144029.png)
相当于爬坡，**只有一直往高处走才能搞到下坡**。

所以以这个思路想，带入二分法，可以做到一直寻找数组的一半数。
## 代码
```
    public int findPeakElement(int[] nums) {
        int len=nums.length;
        if(nums.length==1){
            return 0;
        }
        int left=0;
        int right=len-1;
        while(right>left){
            int mid=(right-left)/2+left;
            if(nums[mid]<nums[mid+1]){
                left=mid+1;
            }else{
                right=mid;
            }
        }
        return right;
    }
```
