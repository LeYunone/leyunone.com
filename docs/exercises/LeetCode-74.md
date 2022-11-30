---
date: 2021-11-02
title: LeetCode-74. 搜索二维矩阵
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
![QQ截图20211102151636.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-02/QQ截图20211102151636.png)

## 思路
虽然题目强调了二维矩阵，但当我们确定目标数在二维数组中的一个数组中时。
题目则变得简单处理，假设目标值为3。
遍历二维数组：
1. 首先判断第一列数组中目标值是否在 下标0 和下标 matrix[0].length 中。
2. 在，则在第一列数组中，进行正常的二分查找
3. 如果不在，则遍历第二列数组。
4. 重复上述步骤，如果找到目标值则返回true，否则返回false。

步骤很简单，和其他二分查找的题目一样，需要注重细节。
比如，left=0，right=matrix[0].length-1。
比如，如果已确定了目标值区间，且在区间中没有找到目标值，则无需继续往下遍历。

## 代码
```
    public boolean searchMatrix(int[][] matrix, int target) {
        int y=0;
        int len=matrix.length;
        int xlen=matrix[0].length-1;
        int left=0;
        int right=xlen;
        if(len==1 && matrix[0].length==1){
            return matrix[0][0]==target;
        }
        while(y<len){
            if(matrix[y][0]<=target && matrix[y][xlen]>=target){
                while(right>=left){
                    int mid=(right-left)/2+left;
                    if(matrix[y][mid]==target){
                        return true;
                    }
                    if(matrix[y][mid]>target){
                        right=mid-1;
                    }else{
                        left=mid+1;
                    }
                }
                return false;
            }else{
                y++;
            }
        }
        return false;
    }
```
