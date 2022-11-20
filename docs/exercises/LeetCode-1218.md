---
title: LeetCode-1218. 最长定差子序列
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
输入：arr = [1,5,7,8,5,3,4,2,1], difference = -2
输出：4
解释：最长的等差子序列是 [7,5,3,1]。
```
## 思路
首先要注意题目是等差子序列而不是子集，所以子序列不是要在原数组中连续的存在。
求等差子序列这种，从左往右挪动判断的方式一般有两种解决方式，一是两套循环，二是动态规划。
两套循环则可以使用start和end指针进行优化，但是因为题意的原数组量很大很大，所以肯定会超时。
所以本题思路主要是在动态规划这条路线上。
动态规划则需要找到他的规律。
**arr[i]+difference=arr[?]**
路线为从左往右。
我们判断如果当前所在下标前有和他对应的等差数。
则:**arr[index]-difference==arr[i]**。
所以看例题，当我们遍历到5的时候，应该要知道，前面有7是他的等差数。
遍历到3的时候要知道，前面有7,5是他的等差数。
所以应该到每个整数下存储当前到他位置上时，已知的最大的等差序列长度。
所以我们可以列出：
**dp[index]=dp[前]+1**
最后根据最大数判断，求得最长的等差序列

## 代码
```
    public int longestSubsequence(int[] arr, int difference) {
        Map<Integer,Integer> map=new HashMap<>();
        int max=0;
        for(int i:arr){

            map.put(i,map.getOrDefault(i-difference,0)+1);
            max=Math.max(max,map.get(i));
        }
        return max;
    }
```
