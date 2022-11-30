---
date: 2021-09-30
title: LeetCode-2. 两数相加
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
![QQ截图20210930171003.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-30/QQ截图20210930171003.png)
## 思路
链表的两数相加，首先根据题意要注意以下几点：
1. 两联表长度不一
2. 数字相加代表不能出现大于9的值
3. 返回的是和的链表，并且按照链表函数的规则，不改变输入进入的链表结构和值

所以可以画出以下三种情况
2->4 | 5->6>4  
5->6>4 | 2 ->4
2->4 ->3 | 5->6->4

可以看出，除了第三种，当遍历完一条链表后，另一链表还有节点的情况下，还会出现10的节点发生。
所以结果链需要创建一条新的，
如果在原本空间链上操作，会发生重复遍历工作。

在遍历的过程中，只需要注意，是否还有位，是否需要进位，即可。
## 代码
```
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode p1=l1;
        ListNode p2=l2;
        ListNode node=new ListNode(-1);
        ListNode temp=node;
        int count=0;
        while(p1!=null || p2!=null || count>0){
            int sum=(p1==null?0:p1.val)+(p2==null?0:p2.val)+count;
            count=sum/10;
            temp.next=new ListNode(sum%10);
            p1=p1==null?null:p1.next;
            p2=p2==null?null:p2.next;
            temp=temp.next;
        }
        return node.next;
    }
```
