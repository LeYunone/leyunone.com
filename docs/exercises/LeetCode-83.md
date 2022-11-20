---
title: LeetCode-83. 删除排序链表中的重复元素
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
**示例：**
:::align-center
![list2.jpg](https://www.leyuna.xyz/image/2021-09-24/list2.jpg)width="auto" height="auto"}}}
:::
```
输入：head = [1,1,2,3,3]
输出：[1,2,3]
```
## 思路
链表删除重复值，而且这个链表还是升序的，也就是说如果当前节点是重复值的话，那么他的前一个节点的值一定和他相同。
那么我们就只需要从头往后遍历链表，判断当前节点的值是否与下一个节点的值相同，如果相同就将后指针指向下下个节点。
依次操作，若下个节点不是重复值，则将遍历节点移至下一个节点。
不过如果不是升序的删除重复值的话，应该就需要使用到hash表存储出现过的数字。
## 代码
```
    public ListNode deleteDuplicates(ListNode head) {
        if(head==null){
            return null;
        }
        ListNode node=head;
        while(node.next!=null){
            if(node.val==node.next.val){
                node.next=node.next.next;
            }else{
                node=node.next;
            }
        }
        return head;
    }
```
