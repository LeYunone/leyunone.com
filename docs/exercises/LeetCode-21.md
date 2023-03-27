---
date: 2021-09-23
title: LeetCode-21. 合并两个有序链表
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
**示例**

![QQ截图20210923102315.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-23/QQ截图20210923102315.png)

```
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```
## 思路
根据图所示理解起来比较简单：遍历两条链表，然后逐一判断大小，将节点加至新链表中。
## 代码
```
 public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode result=new ListNode(-1);
        ListNode temp=result;
        while(l1!=null&&l2!=null){
            if(l1.val>l2.val){
                temp.next=l2;
                l2=l2.next;
            }else {
                temp.next=l1;
                l1=l1.next;
            }
            temp=temp.next;
        }
        temp.next= l1==null? l2: l1;
        return result.next;
    }
```
