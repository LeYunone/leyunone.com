---
date: 2021-11-02
title: LeetCode-33. 搜索旋转排序数组
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
输入：nums = [4,5,6,7,0,1,2], target = 0
输出：4
```
## 思路
将一组有序递增的数组进行旋转后，可以直观的看出。
原数组分为两部分，一是4,5,6 的有序数组；二是7,0,1,2的无序数组。
那么如果寻找的目标值为5时，
我们只需要在数组一的有序数组中进行二分查找即可。
寻找的目标值为0时，则需要在数组二中，进行判断讨论。

所以解题步骤有：
1. 原数组进行二分查找，判断0-mid是否为有序数组。
2. 如果0-mid为有序数组，则判断下标0的值是否小于目标值，并且下标mid的值是否大于目标值。如果确定，则将目标值下标的区间规定在了0-mid中。
3. 对0-mid进行二分搜索。
4. 如果0-mid为无序数组，则判断下标mid的值是否小于目标值，并且下标为len-1的值是否大于目标值。如果确定，则证明在目标值的区间在mid-len中。
5. 重复以上操作，知道下标mid的值等于目标值时，则说明原数组中有。

除了解题步骤，更关心的是二分搜索时的细节。
比如在确定区间时，要注意等于目标值的情况。
![QQ截图20211102112628.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-02/QQ截图20211102112628.png)

## 代码
```
    public int search(int[] nums, int target) {
        int left=0;
        int right=nums.length-1;
        while(right>=left){
            int mid=(right-left)/2+left;
            if(nums[mid]==target){
                return mid;
            }
            if(nums[0]<=nums[mid]){
                //如果0-mid是升序数组有序的
                if(nums[0]<=target && nums[mid]>=target){
                    //判断目标值是否在 0-mid区间
                    right=mid-1;
                }else{
                    left=mid+1;
                }
            }else{
                if(nums[mid]<=target && nums[nums.length-1]>=target){
                    left=mid+1;
                }else{
                    right=mid-1;
                }
            }
        }
        return -1;
    }
```
