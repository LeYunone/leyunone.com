---
title: LeetCode-55. 跳跃游戏
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
输入：nums = [2,3,1,1,4]
输出：true
解释：可以先跳 1 步，从下标 0 到达下标 1, 然后再从下标 1 跳 3 步到达最后一个下标。
```
## 思路
首先看题，排除nums[0]==0 && len!=1 的情况，因为动态规划考虑不到。
然后就是找公式了。
当我们跳到K下标时，此时他应该有两种情况，一是由前面的某一级跳过来，且跳过来还有剩余；二是由前面的某一级跳过来，跳过来没了，如果此时K下标能量为0则说明跳不动了，如果还没有到最后-返回false。反之使用K下标能量继续跳。
那么我们对当跳到K下标时，他的能量公式以最大值考虑应该是：
dp[k]==Math.max(dp[k-1]-1,nums[k])
最后只需要考虑当前dp[k]如果为0，且没在最后一级，则说明没能量跳到最后了。
## 代码
```
    public boolean canJump(int[] nums) {
        if(nums[0]==0 && nums.length!=1){
            return false;
        }
        int [] dp=new int [nums.length];
        dp[0]=nums[0];
        for(int i=1;i<nums.length;i++){
            dp[i]=Math.max(dp[i-1]-1,nums[i]);
            if(dp[i]==0 && i!=nums.length-1){
                return false;
            }
        }
        return true;
    }
```
