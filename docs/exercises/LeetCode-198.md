---
title: LeetCode-198. 打家劫舍
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
输入：[1,2,3,1]
输出：4
解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。
     偷窃到的最高金额 = 1 + 3 = 4 。
```
## 思路
我是好孩子，不偷行不行 : ) 。虽然很想这样说，但是来看这道题把；根据题意找规律，我们只能隔间偷，说明需要在两条路线，从第一家或第二家开始，比较出他最大的金额。
假设我们有第三家,K=3 ，则总金额有：SUM=K+K-2 或者 SUM=K-1;

那么当我们有第5家时，K=5，总金额有： 如果偷第五家，则不能偷第4家，金额为偷到第三家的金额加上第五家的金额。 或 ；不偷第五家，则能偷第四家，金额为偷到第四家的金额和。

按照这个规律，可以看出，当我们偷到第K家的时候，金额是在动态变化的。
有规律为：SUM[K]==Math.max(SUM[K-2]+K，SUM[K-1]);
所以如果有K家，我们只需要返回第K家的动态公式结果足以。
特殊情况：
- 无序列表房屋小于等于2时，拿最大的金额。
- 房屋大于3时，需要判断，由于有第四家的情况，如果第二家的金额小于第一家时，第四家的金额应该为：SUM=MAX（K==1,K==2）+K==4。

## 代码
```
    public int rob(int[] nums) {
        int len=nums.length;
        int [] dp=new int [len];
        if(len>2){
            dp[0]=nums[0];
            dp[1]=Math.max(nums[1],nums[0]);
        }else{
            if(len==1){
                return nums[0];
            }else{
                return Math.max(nums[0],nums[1]);
            }
        }
        for(int i=2;i<len;i++){
            dp[i]=Math.max(dp[i-2]+nums[i],dp[i-1]);
        }
        return dp[len-1];
    }
```
