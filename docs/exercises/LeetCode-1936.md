---
date: 2021-12-15
title: LeetCode-1936. 新增的最少台阶数
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
**示例1：**
```
输入：rungs = [1,3,5,10], dist = 2
输出：2
解释：
现在无法到达最后一阶。
在高度为 7 和 8 的位置增设新的台阶，以爬上梯子。 
梯子在高度为 [1,3,5,7,8,10] 的位置上有台阶。
```
## 思路
爬楼梯问题，和很多跳跃问题一样。
开始我们先从头想，如果我从位置0开始跳，直到最后一阶：
0 - 1 - 3 - 5 - 7 - 8 - 10
其中根据题意， 7和8 是在 5 - 10时添加。
那么当我们在第五阶时，如果想跳到10，则有 5 - 6 - 8 - 10 和 5 - 7 - 8 -10两种情况。
所以我们只需要考虑5-10位置，配合dist，可以最少的添加位置的数目。
即count= ((10 -5 )-1)/dist
得到计算count的公式。
还需要判断什么时候需要计算count，
很简单。
当我们的位置now+dist无法达到下一个位置h时，则需要计算 now-h之间的count。

第二种思路一样，我们从最高阶往下走，原理和往上走一样。

## 代码
```
    public int addRungs(int[] rungs, int dist) {
        int now=0;
        int count=0;
        for(int h:rungs){
            if(now+dist<h){
                int temp=h-now-1;
                count+=temp/dist;
            }
            now=h;
        }
        return count;
    }
```
