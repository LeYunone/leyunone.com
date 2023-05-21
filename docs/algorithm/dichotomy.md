---
date: 2021-11-03
title: 常用算法之 【二分法】
category: 
  - 算法
tag:
  - 算法
head:
  - - meta
    - name: keywords
      content: 数据结构,乐云一,算法,常用算法
  - - meta
    - name: description
      content: 二分法，复杂级别为logn，是最基本也是最常使用的搜索方法；
---

>二分法，复杂级别为logn，是最基本也是最常使用的搜索方法；
## 原理
二分法如其名，在一段有序的数组中。以除以2的思想压缩数组，从而找到目标搜索值的方法。
贴近生活，在1-100内猜一个数字，如果目标值为70：猜一：50，我说小了，则将原数组1-100.压缩至51-100.
重复上述，最终得到目标值。
二分法思路原理非常简单，难的是在定义条件以及变量时的细节。

**固定定式**：
```
while(left<=right){
  int mid=(right-left)/2+left;
   
  if(nums[mid]==target){

  }
  if(nums[mid]>target){
     right=mid-1;
  }else{
     left=mid+1;
  }
}
```

:::tip 细节
定义mid时，常用（right-left）/2+left,而不用(left+right)/2
原因：right+left 容易超出int的数据范围。

移动下标压缩数组时，要注重题意场景，不固定定式思想
原因：很多使用场景中，需要判断临界点或是使用临界值，所以不能一味的left=mid+1,或right=mid-1,而是需要判断题意需不需要左临界或者右临界

循环条件不固定定式思想【left<=right】
原因：很多使用场景中，因为下标原因，在其目标值判断时，需要对比前后数值或无需找到最后的目标值，那么就需要使用left<right的条件过滤掉最后一次left=right=mid的循环

待补充
:::

# 涉及题目
### 1、[LeetCode-33. 搜索旋转排序数组](https://leyuna.xyz/#/blog?blogId=51)
### 2、[LeetCode-162. 寻找峰值](https://leyuna.xyz/#/blog?blogId=54)
### 3、[LeetCode-153. 寻找旋转排序数组中的最小值](https://leyuna.xyz/#/blog?blogId=53)
### 4、[LeetCode-74. 搜索二维矩阵](https://leyuna.xyz/#/blog?blogId=52)
