---
date: 2021-09-29
title: LeetCode-228. 汇总区间
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
输入：nums = [0,1,2,4,5,7]
输出：["0->2","4->5","7"]
解释：区间范围是：
[0,2] --> "0->2"
[4,5] --> "4->5"
[7,7] --> "7"

```
## 思路
题目的意思就是，连续的子数组是一个区间，用A->B表示。
所以我们只需要遍历一次改数组，从左往后，当发现子数组不连续的时候，将其切割。
首先先排除两种特殊情况，一是数组为空时，直接返回空。 二是数组长度为1时，直接返回数组首位结果。
还需要注意的是，题目没有标明限制负数的存在。
开始遍历：
设下标0为start，下标0为end，从头遍历。
当发现
```
nums[end]+1!=nums[end+1];
```
时，则将 
```
nums[start] +"->" + nums[end]
```
添加至集合中。
最后，需要单独判断数组中最后一位。
## 代码
```
    public List<String> summaryRanges(int[] nums) {
        List<String> result=new ArrayList<>();
        if(nums.length==0){
            return result;
        }
        int start=0;
        int end=0;
        while(end!=nums.length-1){
            if(nums[end]+1!=nums[end+1]){
                if(start==end){
                    result.add(String.valueOf(nums[end]));
                }else{
                    result.add(nums[start]+"->"+nums[end]);
                }
                start=end+1;
            }
            end++;
        }
        if(start==0&& end==0){
            result.add(String.valueOf(nums[0]));
            return result;
        }
        if(nums[end-1]+1==nums[end]){
            result.add(nums[start]+"->"+nums[end]);
        }else{
            result.add(String.valueOf(nums[end]));
        }
        return result;
    }
```
