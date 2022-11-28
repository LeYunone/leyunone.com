---
date: 2021-11-11 13:53:47
title: LeetCode-40. 组合总和 II
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
输入: candidates = [10,1,2,7,6,1,5], target = 8,
输出:
[
[1,1,6],
[1,2,5],
[1,7],
[2,6]
]
```
## 思路
根据题意属于排列组合的问题，所以优先想到的应该是回溯算法的定式。
首先筛选出迭代以及回溯的条件：
1. 数组和为目标值
2. 不含重复的子数组
3. 所有数字只能用一次。

所以以下标为10时进行伪代码操作。
步骤：
1. 从下标0开始迭代添加至结果集里，并且动态的更新目标值 target-nums[0]。
2. 当target==0时，将当前结果集添加到最终结果集里，终止当前迭代
3. 当target<0时，终止当前迭代
4. 进行回溯操作，将结果集里的元素重置至上一次循环，并进行下一次循环

完成上述伪代码，虽然可以获得所有的元素和等于目标值的数组，但是无法进行排重操作。
所以我们还需要将原数组进行排序，如果当前元素和上一个元素值相同，则跳过本次元素。
就这样，所有的数组都以不同的元素开头，就没有重复的子数组结果集了。
## 代码
```

    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        List<List<Integer>> res=new ArrayList<>();
        Arrays.sort(candidates);
        order(res,candidates,new ArrayList<>(),target,0);
        return res;
    }

    public void order(List<List<Integer>> res,int [] nums,List<Integer> list,int target,int index){
        if(target<0){
            return;
        }
        if(target==0){
            res.add(new ArrayList<>(list));
            return;
        }
        for(int i=index;i<nums.length;i++){
            if(i>index && nums[i]==nums[i-1]){
                continue;
            }
            list.add(nums[i]);
            order(res,nums,list,target-nums[i],i+1);
            list.remove(list.size()-1);
        }
    }
```
