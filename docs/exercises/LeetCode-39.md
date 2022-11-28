---
date: 2021-11-11 10:25:43
title: LeetCode-39. 组合总和
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
输入: candidates = [2,3,6,7], target = 7
输出: [[7],[2,2,3]]
```
## 思路
组合或者排序问题，都可以用回溯算法的思路解决。
首先题意和全排列问题相似，不过本题条件有:
1. 元素可重复
2. 组合唯一
3. 子数组元素和等于目标值

所以在全排列的基础上，还需要对条件进行过滤调整。
首先以下标0=2，为起点进行递归添加。
当2+2+2+2 =8 > target时，
条件不满足，所以终止当前递归，进行回溯操作。
2+2+2+3 ----- 2+2+2+6 ----- 2+2+2+7
按照以上遍历思路，将原数组构造成一个回溯算法的定式函数。就是本题代码的核心了。
## 代码
```
    public  List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> res=new ArrayList<>();
        backOrder(res,new ArrayList<>(),candidates,target,0);
        return res;
    }

    public  void backOrder(List<List<Integer>> result,List<Integer> list,int []candidates, int target,int index){
        if(arraySum(list)>target){
            return;
        }
        if(arraySum(list)==target){
            result.add(new ArrayList<>(list));
            return;
        }

        for(int i=index;i<candidates.length;i++){
            list.add(candidates[i]);
            backOrder(result,list,candidates,target,i);
            list.remove(list.size()-1);
        }

    }

    public  int arraySum(List<Integer> ar){
        int sum=0;
        for(int i:ar){
            sum+=i;
        }
        return sum;
    }
```
