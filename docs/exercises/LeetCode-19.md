---
title: LeetCode-19. 删除链表的倒数第 N 个结点
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
![image.png](https://www.leyuna.xyz/image/2021-10-11/image.png)width="auto" height="auto"}}}
## 思路
删除指定结点，题目的难度是中等，因为标明倒数第N个结点，以及遍历一次的条件所以比删除第N个结点难上不少。
不过看题目第一反应还是写出了删除第N个结点的代码（看错题了）。
然后想着用删除第N个结点的思路想这题，发现不行，因为倒数第N个结点，在遍历一次的条件下，常规遍历是完全不行的。
不过随即想到了，倒数第N个结点，倒数的性质和栈相似。
所以使用一个栈存储每个遍历的结点，最后在取栈的第N个结点。
因为栈先进后出的特点，栈的第N个结点就是原链表倒数的第N个结点。
**解出来后发现，循环次数以及空间利用都不理想**
因为在最坏的情况下，其实和遍历二次一样，不符合题意。
想到这道题的重点是，**找到倒数第N个结点**。
基于这个，放过来想，如果我从最后一个结点为参照，那么和最后一个节点相差N的节点就是需要删除的节点。
所以设置两个指针，一个指针在头节点，一个指针在和头节点相差N的节点上。
当后节点遍历在链表尾的时候，恰好和头结点指针相差N，而这个节点也正是需要删除的节点。
这样就只遍历了一次
## 代码
### 双指针，遍历一次
```
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode node=new ListNode(0,head);
        ListNode pre=node;
        ListNode next=head;
        for(int i=0;i<n;i++){
            next=next.next;
        }
        while(next!=null){
            next=next.next;
            pre=pre.next;
        }
        pre.next=pre.next.next;
        return node.next;
    }
```
### 栈，遍历两次
```
    public ListNode removeNthFromEnd2(ListNode head, int n) {
        Stack<ListNode> stack=new Stack<>();
        ListNode node=head;
        while(node!=null){
            stack.push(node);
            node=node.next;
        }
        while(n>0){
            stack.pop();
            n--;
        }
        if(stack.isEmpty()){
            //删除表头元素
            head=head.next;
            return head;
        }
        ListNode pop = stack.pop();
        if(pop.next.next!=null){
            pop.next=pop.next.next;
        }else{
            pop.next=null;
        }
        return head;
    }
```
