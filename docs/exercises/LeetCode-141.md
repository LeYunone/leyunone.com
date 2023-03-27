---
date: 2021-09-26
title: LeetCode-141. 环形链表
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
![QQ截图20210926162706.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-26/QQ截图20210926162706.png)
## 思路
又是一道链表的经典问题，求环形链表，不过本题比较简单只需要判断是否是环形链表。
那么我们有很多种方式解决：
1. 使用哈希表存储各结点，在遍历结点的过程中，去hash表中判断有无当前节点，如果有，则说明遍历的过程中又回来了，形成了回路结构，所以是环形链表。
2. 由于本题有限制[只有100000个节点]
![QQ截图20210926162947.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-26/QQ截图20210926162947.png)所以可以偷偷的直接循环100000次，如果node.next==null，则说明最后一个节点的下指针是null，不是环形链表。

3. 最后就是推荐思路，快慢指针。

设置一个快指针，每次遍历2个单位，一个慢指针，每次遍历1个单位。
则当快指针遍历过程中，和满指针相遇，则说明快指针跑回来了，属于环形链表。
反之，若快指针为null或是下一个为null，则说明不是环形链表

```
    public boolean hasCycle(ListNode head) {
        if(head==null || head.next==null){
            return false;
        }
        ListNode pre=head;
        ListNode next=head.next;
        while(next!=pre){
            if(next==null || next.next==null){
                return false;
            }
            pre=pre.next;
            next=next.next.next;
        }
        return true;
    }
```
