---
date: 2022-05-12
title: LeetCode-1019. 链表中的下一个更大节点
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
**示例**

![image.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-12/image.png)



## 思路

链表题目，一般都围绕遍历问题展开。

看本题，首先我们假设在本题中，我们不使用单链表。

那么判断当前节点的最近的大节点，是否只需要和冒泡排序一样，定位一个元素，然后将它与后续每一个节点进行比较，直到找到大于当前节点的节点值。

所以就有了第一个思路，暴力破解。

### 暴力破解双循环

思路和冒泡一样，但是由于本题背景是单链表。

所以我们需要注意在不动原头链表的前提下，还可以去遍历它的后续每一个节点。

那么就需要两个循环：

循环一：遍历原节点的每一个节点

循环二：将当前节点与后续每一个节点进行比较。

可以直观的写出代码

```
    public int[] nextLargerNodes(ListNode head) {
        ListNode node = head;
        List<Integer> list = new ArrayList();
        while(node!=null){
            //循环一，遍历原链表中的每一个节点
            list.add(order(node));
            node = node.next;
        }
        return list.stream().mapToInt(Integer::valueOf).toArray();
    }

    public int order(ListNode node){
        int temp = node.val;
        while(node.next!=null){
            //循环二，遍历指定节点，比较后续值大小
            int v = node.next.val;
            if(v>temp){
                return v;
            }else{
                node = node.next;
            }
        }
        return 0;
    }
```

![image.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-13/DDDD.png)

### 单调栈

在上述双循环中，可以发现，如果我们可以维持一个 基本有序的数组，那么是否可以从后往前遍历。

从后往前遍历，当当前数大于前一个数时，则说明当前数就是前一个数的下一个大节点。

所以我们可以把从后往前遍历的“大节点”存储到一个单调栈中，我们只需要动态的维持 0-index的最最近单调栈集合即可。

#### 代码

```
    public static int[] nextLargerNodes(ListNode head) {
        ListNode node = head;
        Stack<Integer> stack = new Stack<>();
        while(node!=null){
            stack.push(node.val);
            node = node.next;
        }
        int [] arr = new int[stack.size()];
        int index = arr.length-1;
        Stack<Integer> ddStack = new Stack<>();
        while(!stack.isEmpty()){
            int v = stack.pop();
            while(!ddStack.isEmpty() && v>=ddStack.peek()){
                ddStack.pop();
            }
            arr[index--] = ddStack.isEmpty()? 0:ddStack.peek();
            ddStack.push(v);
        }
        return arr;
    }
```
![EEEE.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2022-05-13/EEEE.png)
