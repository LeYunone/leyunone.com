---
date: 2021-09-24
title: LeetCode-69. x 的平方根
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
输入：x = 8
输出：2
解释：8 的平方根是 2.82842..., 由于返回类型是整数，小数部分将被舍去。
```
## 思路
求平方根，在数学中，人眼能看出来心算出来的就是最接近平方根数的某个人的平方。
而题目也正好只要我们返回整数。
所以题目就变成了，哪个数的平方 最接近或等于平方根下的数。
既然是哪个数，那就涉及到了查找算法的问题了。
查找的范围也很确定，首先是不可能大于数本身，其次就是不可能大于这个数的一半。
那么就可以规定出法则:
- 查找算法-> 二分查找
- 范围-> 数的一半

话不多说，上代码
## 代码
```
    public int mySqrt(int x) {
        if(x==1 || x==0){
            return x;
        }
        int max=0;
        int left=0;
        int right=x/2;
        while(right>=left){
            int mid=left + (right - left) / 2;
            if((long)mid*mid<=x){
                max=mid;
                left=mid+1;
            }else{
                right=mid-1;
            }
        }
        return max;
    }
```
