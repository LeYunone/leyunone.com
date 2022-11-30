---
date: 2021-11-03
title: LeetCode-153. 寻找旋转排序数组中的最小值
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
输入：nums = [3,4,5,1,2]
输出：1
解释：原数组为 [1,2,3,4,5] ，旋转 3 次得到输入数组。
```
## 思路
本题和[LeetCode-33. 搜索旋转排序数组](https://leyuna.xyz/#/blog?blogId=51)如出一辙，后者同样是在旋转数组中操作，搜索目标值。
本题是在旋转数组中，搜索最小的数，那么就没有目标值的条件了。
最简单的是使用暴力循环，也简单，O(N)级就行去拿最小值。
不过题型为：原数组为升序数组。
升序数组旋转后，可以得到两部分，一部分是原数组的升序和另一部分旋转的无序。
那么在搜索最小值的问题中。
我们当然不能再原数组的升序部分查最小值，如果原数组旋转，那么他的最小值一定在旋转部分。
所以解题步骤的第一步为:
1. 将搜索区间锁定到旋转部分。

所以可以用，判断下标left和mid的值，如果left的值大于mid的值则说明，旋转区间和最小值一定在left-mid中。
如果left的值小于mid的值则说明，left-mid为升序数组，旋转区间和最小值一定在mid-right中。

所以第二步为：
1. 移动left和right下标；当left-mid为升序并且left的值大于right的值，则说明left-mid是升序的同时，原数组一定进行了旋转，所以移动left到mid+1
2. 当mid的值大于right的值，说明需要寻找mid后的值，移动left->mid+1
3. 如果不是上述的情况，则说明right的值大于mid的值，基于旋转的原则，最小值一定在left-mid中。

## 代码
```
    public int findMin(int[] nums) {
        int len=nums.length-1;
        if(nums[0]<nums[len]){
            return nums[0];
        }
        int left=0;
        int right=len;
        int result=nums[0];
        while(right>=left){
            int mid=(right-left)/2+left;
            if((nums[left]<nums[mid] && nums[left]>nums[right])||nums[mid]>nums[right]){
                //说明0-mid是升序，
                left=mid+1;
            }else{
                //说明 最小值一定在0-mid的区间中
                right=mid-1;
            }
            if(nums[mid]<result){
                result=nums[mid];
            }
        }
        return result;
    }
```
