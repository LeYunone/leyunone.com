---
title: LeetCode-1567. 乘积为正数的最长子数组长度
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
输入：nums = [0,1,-2,-3,-4]
输出：3
解释：最长乘积为正数的子数组为 [1,-2,-3] ，乘积为 6 。
注意，我们不能把 0 也包括到子数组中，因为这样乘积为 0 ，不是正数。
```
## 思路
和子数组计算相关问题，大多是动态规划的思路解决。
类似的有求最长的子序和长。
按照惯例，寻找动态规划的转移方程以及边界条件。
首先看例题。
边界条件一：0
边界条件二：乘积负数

即，当我们遍历数组时，当遇到0或是乘积为负数时，特殊处理。
若数组中，所有数为正数时，那么他的最长正数子数组长度的转移方程应该是：
```
                                  Fn=F(n-1)+1
```
若数组中，排序为2，1,-3时，
```
                                  F(3)=F(2)
```
当数组中，排序为2,-3,1，-4时，
```
                                  F(4)= ~F(3) +1
```
发现，一个转移方程无法应对乘积为负数时的情况。
我们还需要一个记录当前负数乘积长度的数组。
记录2，-3,1的长度。

所以最终方程应该是：
```
                        dp(n)= dp(n-1)+1 (nums[n]>0);
                               dpIndex(n-1)+1 (dpIndex(n-1)>0 && nums[n]<0)
                               
                        dpIndex(n)= dpIndex(n-1)+1; (dpIndex(n-1)>0 && nums[n]>0)
                                    dp(n-1)+1 (nums[n]<0);
```
## 代码
```
    public int getMaxLen(int[] nums) {
        int len=nums[0]>0?1:0;
        int [] dp=new int [nums.length];
        int [] dpIndex=new int [nums.length];
        if(nums[0]>0){
            dp[0]=1;
        }else if(nums[0]<0){
            dpIndex[0]=1;
        }
        for(int i=1;i<nums.length;i++){
            if(nums[i]>0){
                dp[i]=dp[i-1]+1;
                dpIndex[i]=dpIndex[i-1]>0?dpIndex[i-1]+1:0;
            }else if (nums[i]<0){
                dp[i]=dpIndex[i-1]>0?dpIndex[i-1]+1:0;
                dpIndex[i]=dp[i-1]+1;
            }
            len=Math.max(len,dp[i]);
        }
        return len;
    }
```
