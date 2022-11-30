---
date: 2021-11-05
title: LeetCode-11. 盛最多水的容器
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
![QQ截图20211105141053.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-05/QQ截图20211105141053.png)
## 思路
非常经典的双指针问题。
根据图形可以看出，最大的面积有两个条件，一是高度一定是高的，左边和右边有距离。
即**面积=短的一边高度*两边的距离**
所以我们在最左边和最右边设置两个指针。
动态的计算他们此时的面积，并与之前进行比较留下最大值。
而由于是计算最大值，所以当我们确定一边是当前最大面积的值时，为了找到比他更大的值，就需要去移动高度最矮的那边。

根据上述伪代码思想，得.
## 代码
```
    public int maxArea(int[] height) {
        int left=0;
        int right=height.length-1;
        int sum=0;
        while(left<=right){
            int h=Math.min(height[left],height[right]);
            sum=Math.max(sum,(right-left)*h);
            if(height[left]>height[right]){
                right--;
            }else{
                left++;
            }
        }
        return sum;
    }
```
