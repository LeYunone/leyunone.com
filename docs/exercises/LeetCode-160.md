---
date: 2021-09-26 17:35:28
title: LeetCode-160. 相交链表
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
![QQ截图20210926172556.png](https://www.leyuna.xyz/image/2021-09-26/QQ截图20210926172556.png)
## 思路
考察公共链表的公共交点，最简单粗暴的是可用设置一张map表，将A遍历到的所有元素添加进去。
然后遍历链表B时，如果某一节点在map表中存在，则说明改节点是相交节点。

但是这样操作的话，无论是时间复杂度还是空间复制度都会根据两张表的表长逐渐增加。
所以求公共交点最好的方式是使用双指针的形式。
在A表和B表的表头各设立一个指针，
设A表表头指针 PA ,则PA遍历完表A的路程是 Len(A)。
设B表表头指针 PB, 则PB遍历完表B的路程是 len(B)。
若A表和B表有公共交点，则在这个交点前，A表的路径是len(A-M),B表的路径是len(B-M).
这个交点后，A表路径为len(M-AA),B表路径为（M-BB）。
所以可以得
- len(PA)=len(A-M)+len(M-AA)=len(A).
- len(PB)=len(B-M)+len(M-BB)=len(B).

那么当PA走完len（A）后，将他移至B表表头。PB走完len（B）后，将他移至A表表头。
再次遍历就可以得到
- len（PA）=len（B）+len(A)=len(A-M)+len(M-AA)+len(B-M)+len(M-BB)
- len（PB）=len（B）+len(A)=len(A-M)+len(M-AA)+len(B-M)+len(M-BB)

按照这样的逻辑就可以翻译代码得出最终的结果交点。
## 代码
```
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        if(headA==null || headB==null){
            return null;
        }
        ListNode top=headA;
        ListNode bottom=headB;
        while(top!=bottom){
            top=top==null?headB:top.next;
            bottom=bottom==null?headA:bottom.next;
        }
        return top;
    }
```
