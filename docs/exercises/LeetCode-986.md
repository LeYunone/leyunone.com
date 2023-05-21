---
date: 2021-11-05
title: LeetCode-986. 区间列表的交集
category: 刷题日记
tag:
  - LeetCode
head:
  - - meta
    - name: keywords
      content: LeetCode,乐云一,算法,刷题日记
  - - meta
    - name: description
      content: 乐云一刷题日记！！！
---
![QQ截图20211105111509.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-05/QQ截图20211105111509.png)
## 思路
简单的数学问题，求两个数组的交集，代码中用闭包的二维数组表示其范围。
根据图示可以看出，A集合和B集合中各数组的交集的状态。
根据数学思想可以知道，如果有两集合[1,4][2,5]。
那么画出他的交集状态。
::: align-center
  ![QQ截图20211105111947.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-05/QQ截图20211105111947.png)
:::
集合A中【1,4】和集合B中【2,5】，交集为2,4
取得是两者从其最大值【左区间】和其最小值【右区间】。
单独讨论如此。
那么在有诸多集合的A和B中，
我们则需要使用双指针去控制其范围。
如果集合A当前指针下的范围的最小值大于集合B当前指针下的最大值，则需要移动集合B的指针向更大值。
依照上述伪代码思想，得。
## 代码
```
    public int[][] intervalIntersection(int[][] firstList, int[][] secondList) {
        int firstX=0;
        int secondX=0;
        List<int[]> list=new ArrayList<>();
        while(firstX<firstList.length && secondX<secondList.length){
            int start=Math.max(firstList[firstX][0],secondList[secondX][0]);
            int end=Math.min(firstList[firstX][1],secondList[secondX][1]);
            if(end>=start){
                list.add(new int []{start,end});
            }
            if(firstList[firstX][1]>secondList[secondX][1]){
                secondX++;
            }else{
                firstX++;
            }
        }
        return list.toArray(new int[list.size()][]);
    }
```
