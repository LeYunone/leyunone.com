---
date: 2021-09-26
title: LeetCode-121. 买卖股票的最佳时机
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
输入：[7,1,5,3,6,4]
输出：5
解释：在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，
最大利润 = 6-1 = 5 。
     注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。
```

## 思路
最佳点问题，按照下图
![cc4ef55d97cfef6f9215285c7573027c4b265c31101dd54e8555a7021c95c927-file_1555699418271.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-26/cc4ef55d97cfef6f9215285c7573027c4b265c31101dd54e8555a7021c95c927-file_1555699418271.png)
可以看得出，如果想要收获最大化，则需要在最低谷时买入，离最低谷最远的最高谷时抛出。
最高谷一定是在最低谷之后的日子中，所以我们只需要找到最低谷的日子，然后以这一天为准往后找最大的差。

那么在代码里，我们需要进行动态规划，设置最小的值minIndex为当前日子以及往前最小的股票价格，设置max为到当前日子，倘若买入之前的“最低谷”能赚到的最大的钱。
变量设置好，就可以入手代码了。
## 代码
```
    public int maxProfit(int[] prices) {
        int minIndex=0;
        int max=0;
        for(int i=0;i<prices.length;i++){
            minIndex=prices[minIndex]>prices[i]?i:minIndex; //确定最低谷的股票
            int temp=prices[i]-prices[minIndex];
            max=temp>max?temp:max;
        }
        return max;
    }
```
