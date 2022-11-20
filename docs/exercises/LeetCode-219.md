---
title: LeetCode-219. 存在重复元素 II
category: 刷题日记
tag:
  - LeetCode
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,字节码详解,Java 基本数据类型,装箱和拆箱
  - - meta
    - name: description
      content: 全网质量最高的Java基础常见知识点和面试题总结，希望对你有帮助！
---
**示例：**
```
输入: nums = [1,2,3,1], k = 3
输出: true
```
## 思路
又是找重复元素的题目，最快应该想到的是map表，但在可行的情况下，尽量不开阔新的内存空间。
但是本题在一个数组的情况下，使用map效率更好。
借用滑动的思想，在K的范围内，在nums中划分子数组。然后判断该子数组中是否存在重复元素。
那么在滑动的过程中，map表的容量一定是保证<=K的，所以当超出K的容积出现时，则需要将map表中最老的元素消除。
## 代码
```
    public boolean containsNearbyDuplicate(int[] nums, int k) {
        Set<Integer> set=new HashSet<>();
        for(int i=0;i<nums.length;i++){
            if(set.contains(nums[i])){
                return true;
            }
            set.add(nums[i]);
            if(set.size()>k){
                set.remove(nums[i-k]);
            }
        }
        return false;
    }
```
