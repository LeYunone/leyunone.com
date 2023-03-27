---
date: 2021-11-01
title: 常用算法之 【回溯法】
category: 
  - 算法
tag:
  - 算法
head:
  - - meta
    - name: keywords
      content: 数据结构,算法,常用算法
  - - meta
    - name: description
      content: 回溯算法，以递归为驱动遍历搜索的回溯操作。在算法题目中多有出现，例如：全排序、组合、子集、棋盘问题等等。
---
> 回溯算法，以递归为驱动遍历搜索的回溯操作。在算法题目中多有出现，例如：全排序、组合、子集、棋盘问题等等。

# 原理
回溯算法 == 递归算法，他是在递归的基础上，进行原数组的回溯撤销操作。
所以回溯函数的雏形在递归上，有：终止条件，递归条件。
那么在一个回溯函数中，对于全排序问题时

![fig14.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-01/fig14.png)
可以知道，函数中，回溯的宽度处决于结果集的大小。回溯的深度处决与回溯条件。

所以在递归的原基础上。
```
public 参数 order(参数){
  if(条件){
    终止
  }
  return  order(参数)[递归条件]
}
```
可以演变为：
```
public void order(参数){
  if(条件){
    终止
  }
  for(回溯的宽度){
     处理结果
     
     order(参数) 递归演变

     回溯操作  【一般指根据题目的撤销操作】
  }
}
```

# 涉及题目
### [LeetCode-39. 组合总和](https://leyuna.xyz/#/blog?blogId=65)
### [LeetCode-40. 组合总和 II](https://leyuna.xyz/#/blog?blogId=66)
### [LeetCode-79. 单词搜索](https://leyuna.xyz/#/blog?blogId=67)
