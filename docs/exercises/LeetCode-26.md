---
title: LeetCode-26. 删除有序数组中的重复项
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
**示例:**
```
输入：nums = [1,1,2]
输出：2, nums = [1,2]
解释：函数应该返回新的长度 2 ，并且原数组 nums 的前两个元素被修改为 1, 2 。
不需要考虑数组中超出新长度后面的元素。
```
## 思路
题目中粗体描述了要使用O（1）的空间，意味着只能在原数组上操作而不建立新的存储。
所以就要将重复的目标值删除(修改) ，其中删除的意思，由于无法开辟新的存储空间，所以需要将 删除 的目标值移到数组后面。
那么又需要遍历原数组，又需要改变目标值的位置。
我们只需要设置两个指针，前指针为当前指针，指向当前遍历下标。后指针为移动指针，帮助前指针寻找替换位置和判断重复值的作用。
![QQ截图20210923103856.png](https://www.leyuna.xyz/image/2021-09-23/QQ截图20210923103856.png)width="auto" height="auto"}}}

## 代码
```
    public int removeDuplicates(int[] nums) {
        if(nums.length==1){
            return 1;
        }
        int pre=0;
        int next=1;
        while(next<nums.length){
            if(nums[next]==nums[pre]){
                next++;
            }else{
                pre++;
                nums[pre]=nums[next];
            }
        }
        return pre+1;
    }
```
