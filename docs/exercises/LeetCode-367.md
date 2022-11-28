---
date: 2021-10-09 10:33:11
title: LeetCode-367. 有效的完全平方数
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
```
输入：num = 16
输出：true
```
## 思路
求完全平方根的问题，脑海里要有两种解决方案。
一是，二分查找。二是，牛顿迭代。
首先看看平方根的特点，数字本身的平方等于的值，为完全平方。
所以在除了2和1的特殊数字外，我们可以发现，判断一个数是否为完全平方。只需要在范围为[2,num/2]中找到有无与之匹配的数字。

所以二分查找时，可以将num/2 设为right，2为left。然后遍历判断的过程就和普通的查找一个数字的过程类似了。

### 牛顿迭代
![QQ截图20211009103050.png](https://www.leyuna.xyz/image/2021-10-09/QQ截图20211009103050.png)
算法比较通俗，意思就是从num/2开始，通过牛顿迭代的公式无限的逼近平方根。
## 代码
### 二分查找
```
    public boolean isPerfectSquare(int num) {
        if(num==1){
            return true;
        }
        long right=num/2;
        long left=2;
        while(right>=left){
            long mid=(right-left)/2+left;
            long temp=mid*mid;
            if(temp>num){
                right=mid-1;
            }else if(temp<num){
                left=mid+1;
            }else{
                return true;
            }
        }
        return false;
    }
```
### 牛顿迭代
```
  public boolean isPerfectSquare(int num) {
    if (num < 2) return true;

    long x = num / 2;
    while (x * x > num) {
      x = (x + num / x) / 2;
    }
    return (x * x == num);
  }
```
