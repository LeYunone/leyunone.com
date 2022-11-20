---
title: LeetCode-15. 三数之和
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
**示例**
```
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
```
## 思路
前面有做过[两数之和](https://leyuna.xyz/#/blog?blogId=35)，其也是固定一个指针，然后找到目标值。
本题是三数之和，a+b+c=0。
意味着若不考虑时间复杂度的前提下，暴力破解是需要进行三次内套循环的。
所以参考之前题目的思路，使用双指针，但因为需要三个数，所以无论如何都需要从头遍历固定a值。

既然需要从头遍历，就不能使用原无序数组了，因为题目中，需要过滤掉重复数组，而且在计算a+b+c=0时，有一定的数学规律，就有了以下的解题步骤：
1. 原数组排序
2. 从头遍历数组，且当下标a>0时，如果nums[a]=nums[a-1]，则需要跳过本次循环，过滤重复
3. 在有序数组中，找到a+b+c=0，的前提是，a作为最小值<0。且 c>b>a,因为有序的存在，一定在c>b>=a 的范围内才存在结果集。
4. b+c=-a,由于是有序的升序数组，所以当c的下标==b的下标时，则说明c之后的升序数都无法满足b+c=-a。即不需要在往后遍历b以及c。
## 代码
```
    public List<List<Integer>> threeSum(int[] nums) {
        if(nums.length<2){
            return new ArrayList<>();
        }
        List<List<Integer>> result=new ArrayList<>();
        Arrays.sort(nums);  //排序原数组
        for(int i=0;i<nums.length;i++){
            if(nums[i]>0){
                break;
            }
            if(i>0 && nums[i]==nums[i-1]){ //过滤掉a下标的重复数组 
                continue;
            }
            int right=nums.length-1;
            int tar=-nums[i];
            for(int j=i+1;j<nums.length;j++){
                if(j>i+1 && nums[j] ==nums[j-1]){ //过滤掉b下标的重复数组
                    continue;
                }
                while(j<right && nums[j]+nums[right]>tar){
                  //只有当b+c不大于-a时，才存在结果集，移动下标c的值向左，递减。
                    right--;
                }
                if(j==right){ 
                   //当b和c下标重合时，说明本次以b下标的结果集不存在，因为其c的最小值已经判断或是被过滤
                    break;
                }
                if(nums[j]+nums[right]==tar){
                    List<Integer> list=new ArrayList<>();
                    list.add(nums[i]);
                    list.add(nums[j]);
                    list.add(nums[right]);
                    result.add(list);
                }
            }
        }
        return result;
    }
```
