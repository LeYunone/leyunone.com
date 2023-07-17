---
date: 2021-11-09
title: LeetCode-740. 删除并获得点数
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
输入：nums = [2,2,3,3,3,4]
输出：9
解释：
删除 3 获得 3 个点数，接着要删除两个 2 和 4 。
之后，再次删除 3 获得 3 个点数，再次删除 3 获得 3 个点数。
总共获得 9 个点数。
```
## 思路
读题，取2则不能取1和3，取3则不能去2和4.
所以我们取K值时，无法拿K-1和K+1.
在一片连续的数组中，意味着不能取相邻的数字。
那么题目就变成了和[LeetCode-198. 打家劫舍](https://leyuna.xyz/#/blog?blogId=61)，相同的问题了。
首先我们需要取数组中最大的数字，用来创建一片连续的数组。
其次，还需要注意，如果有相同的数字，则在该数字的下标结果中应该是累加计算的。
所以有：
- **int [] dp=new int [max]**
- **dp[i]+=i**

通过上面的操作，就可以得到由原数组转换成连续下标的数组了。
然后就和打家劫舍一样的操作就可以获得最大的点数。
## 代码
```
    public int deleteAndEarn(int[] nums) {
        int max=0;
        for(int i:nums){
            max=Math.max(max,i);
        }
        int [] dp=new int [max+1];
        for(int i:nums){
            dp[i]+=i;
        }

        int pre=dp[0];
        int suf=Math.max(dp[0],dp[1]);
        for(int i=2;i<dp.length;i++){
            int temp=suf;
            suf=Math.max(pre+dp[i],temp);
            pre=temp;
        }
        return suf;
    }
```
