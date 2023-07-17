---
date: 2022-05-13
title: LeetCode-16. 最接近的三数之和
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
**示例**：

```
示例 1：

输入：nums = [-1,2,1,-4], target = 1
输出：2
解释：与 target 最接近的和是 2 (-1 + 2 + 1 = 2) 。
示例 2：

输入：nums = [0,0,0], target = 1
输出：0

```

## 思路

本题是 [**LeetCode-15. 三数之和**](https://leyuna.xyz/#/blog?blogId=47) 的续展题目，所以大致思路和15一致。

但是写这道题的时候，忘记了三数之和的题目原型，所以直接另起独灶。

开始想的：

暴力循环，三层嵌套，遍历所有组合的和值，判断其大小。

意外的是，暴力破解竟然可以走通，但是本题作为中等难度，当然有他自己的技巧啦。

### 双指针

倘若我们确定了一个范围，在这个范围中寻找与目标值最接近的和值。

那么是否只要不断的移动两范围的下标，当和大于目标值时，由于题意需要接近则需要缩小和值，则移动右坐标到左。

如果和小于目标值，则需要移动左坐标向右，增大和值。

但是这一切都是在一条线性排序的范围中才可实现，

所以我们的**第一步**：

将原数组排序。

**第二步**：

确定双指针包围的范围，

由于本题是三数之和，所以我们要在双指针移动循环外，嵌套一层单数遍历循环。

**第三步**：

将三数之和【单数遍历下标值+左坐标下标值+右坐标下标值】与目标值比较。

同时维护一个min值【最靠近目标值】。

而我们则需要计算与目标值之间的绝对值，判断两者之间的距离。

**第四步**：

动态移动双指针，不断判断最接近值。

## 代码

```
    public static int threeSumClosest(int[] nums, int target) {
        int min = Integer.MAX_VALUE;
        Arrays.sort(nums);
        for (int i = 0; i < nums.length; i++) {
            if(i>0 && nums[i] == nums[i-1]){
                continue;
            }
            int left = i+1;
            int right = nums.length - 1;
            while(left<right){
                int temp = nums[i]+nums[left]+nums[right];
                if(temp == target){
                    return temp;
                }
                int v = temp - target;

                if(Math.abs(v) < Math.abs(min)){
                    min = v;
                }
                if(temp>target){
                    right--;
                }else{
                    left++;
                }
            }
        }
        return min+target;
    }
```



