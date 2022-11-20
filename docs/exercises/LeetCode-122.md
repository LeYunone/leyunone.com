---
title: LeetCode-122. 买卖股票的最佳时机 II
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
输入: prices = [7,1,5,3,6,4]
输出: 7
解释: 在第 2 天（股票价格 = 1）的时候买入，在第 3 天（股票价格 = 5）的时候卖出,
 这笔交易所能获得利润 = 5-1 = 4 。
     随后，在第 4 天（股票价格 = 3）的时候买入，在第 5 天（股票价格 = 6）的时候卖出,
 这笔交易所能获得利润 = 6-3 = 3 。

```
## 思路
首先，题意里标注的[不能同时参与多笔交易]，要注意并没有说在一天内不能卖出又买入。
所以我们对于任一一天，有都可以有两种操作，一是抛出当前手头的股票，二是买入当前天的股票。
那么我们只要去关注，对于当天时，什么情况下抛出，什么情况买入即可。

买入和抛出操作：
如果当前手头的股票大于当天股票价时，买入。
如果当前手头的股票小于当天股票价时，抛出，并且买入当天的股票。

所以我们需要动态的记录,假装自己买入了当天的股票，如果后面的时间中遇到了比这张股票大的则抛出。
最终累计交易的收益额，即是最大利润。
例 [9,2,4,7,10,3,6]
按照题目的计算公式应该是：
**(10-2)+(6-3)=11**
按照当天买入当天卖出的思路:
**(4-2)+(7-4)+(10-7)+(6-3)= (4-4)+(7-7)+(10-2)+(6-3)=11;**

所以可以知道每天的状态转移方程：
```
 dp[i]=dp[i-1] (prices[i]<index)
 dp[i]=dp[i-1]+prices[i]-index (prices[i]>index)
```
其中index为当前手中记录的股票

## 代码
```
    public int maxProfit(int[] prices) {
        int [] dp=new int [prices.length];
        int index=prices[0];
        for(int i=1;i<prices.length;i++){
            if(prices[i]<index){
                dp[i]=dp[i-1];
            }else{
                dp[i]=dp[i-1]+prices[i]-index;
            }
            index=prices[i];
        }
        return dp[prices.length-1];
    }
```
