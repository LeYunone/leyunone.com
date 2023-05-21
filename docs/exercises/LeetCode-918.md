---
date: 2021-11-16
title: LeetCode-918. 环形子数组的最大和
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
输入：[1,-2,3,-2]
输出：3
解释：从子数组 [3] 得到最大和 3
```
```
输入：[5,-3,5]
输出：10
解释：从子数组 [5,5] 得到最大和 5 + 5 = 10
```
## 思路
本题参考[LeetCode-53. 最大子序和](https://leyuna.xyz/#/blog?blogId=16)
同样是求子数组中最大的子序和，不过一个是确定是线性，一个是可能为环形。
那么对本题考虑，就只有两种情况，一个是维持原数组的，在线性数组中找到最大子序和，那么解题思路和[LeetCode-53. 最大子序和](https://leyuna.xyz/#/blog?blogId=16)一模一样。
其次就是考虑环形的情况，但数组的最大子序和的场景为环形数组时。
则它的数组分布应该是，部分开头加结尾的形式。
那么除了开头加结尾部分，数组中间的部分就一定有本数组中最小子序和。
所以可以知道
最大的子序和应该就是，本数组的总和减去数组中间的那部分，即最小子序和。
所以我们在遍历数组过程中，计算他的最大子序和【线性时】和最小子序和【环形时】。
然后判断，最大子序和 与 SUM-最小子序和 的大小即可得出结果
## 代码
```
    public int maxSubarraySumCircular(int[] nums) {
        int sum=0;
        int max=Integer.MIN_VALUE;
        int min=Integer.MAX_VALUE;
        int preMax=0;
        int preMin=0;
        for(int i=0;i<nums.length;i++){
            sum+=nums[i];
            preMax=Math.max(preMax+nums[i],nums[i]);
            preMin=Math.min(preMin+nums[i],nums[i]);
            max=Math.max(max,preMax);
            min=Math.min(min,preMin);
        }
        return sum-min==0?max:Math.max(sum-min,max);
    }
```
