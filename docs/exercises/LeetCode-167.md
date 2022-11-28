---
date: 2021-09-26 20:01:16
title: LeetCode-167. 两数之和 II - 输入有序数组
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
输入：numbers = [2,7,11,15], target = 9
输出：[1,2]
解释：2 与 7 之和等于目标数 9 。因此 index1 = 1, index2 = 2 。
```
## 思路
求两数之和，在两数之和I 中，输入的数组是无序的，所以使用哈希表或是使用其他方式对算法的时间复杂度都没有太大的优化。
但是本题中，明确说了输入的数组是有序递增的数组。
那么解题的思路就变了很多：
1. 依然使用哈希表，暴力破解
2. 遍历固定一个值，然后target-index=value，使用这个value在有序的数组中通过二分查找的方式找到其下标。
3. 使用双指针，头和尾。

在最差的情况下，使用双指针的方法是最优的解题思路，其时间复杂度只有O(N)，而第二种二分查找的方式随着数组长度的增加，几数倍的增加，O(nlogn)。

**双指针**：
有了target这个目标数，在固定头和尾指针数后，和target进行比较可以发现。
当left+right>target 时，需要减小当前和，则将右指针左移；
当left+right<target 时，需要增加当前和，则将左指针右移；

## 代码
```
  public int[] twoSum(int[] numbers, int target) {
       int []  result=new int[2];
        int left=0;
        int right=numbers.length-1;
        while(true){
            int temp=numbers[left]+numbers[right];
            if(temp>target){
                right--;
            }
            if(temp<target){
                left++;
            }
            if(temp==target){
                result[0]=left+1;
                result[1]=right+1;
                return result;
            }
        }
    }
```
