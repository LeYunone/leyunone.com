---
date: 2021-09-23
title: LeetCode-53. 最大子序和
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
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6 。
```
## 思路
子数组和最大值，连续，所以联想到动态规划。
动态规划则意味着需要找到数组的滚动规律。
-2,1 。数组移动到这，如果设置初始最大值为[0]-2的话，-2+1=1 > -2 ，则最大值更新为1。
-2,1,-3 。到这，当滚动添加-3的时候，1 -3 =-2<1，则最大值为1。-2, 1，-3的子数组和为-2.

-2,1,-3,4。到这，当滚动添加4的时候，4>前子数组的和，所以最大值为4。
...

## 代码
```
    public int maxSubArray(int[] nums) {
        int pre = 0, maxAns = nums[0];
        for (int x : nums) {
            pre = Math.max(pre + x, x);
            maxAns = Math.max(maxAns, pre);
        }
        return maxAns;
    }
```
