---
date: 2021-11-08
title: LeetCode-117. 填充每个节点的下一个右侧节点指针 II
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
![QQ截图20211108152816.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-08/QQ截图20211108152816.png)
## 思路
虽然这道题的难度划到了中等，但是对于熟练了二叉树的遍历的人来说，思路清晰简单。
首先根据题意，我们需要把每一个节点和其右侧节点使用next函数连起来。
那么对右侧节点考虑，每个节点的右侧节点一定是在该节点同层且相邻的位置。
所以我们需要对该二叉树进行一层一层的遍历讨论。
二叉树的遍历有两种，深度和广度。
其中广度正好符合题意，属于层级遍历。
所以使用广度遍历的思想遍历二叉树时，只需要使用队列存储节点。
基于队列先进后出的特性， 在加入节点的左右节点后；遍历下一层级时，队列中的节点一定是相邻且前节点在后节点前先进队列。
根据上述伪代码思路，得。
## 代码
```
    public Node connect(Node root) {
        if(root==null){
            return null;
        }
        Queue<Node> queue = new LinkedList<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            int temp = queue.size();
            for (int i = 0; i < temp; i++) {
                Node poll = queue.poll();
                if(i!=temp-1){
                    Node next = queue.peek();
                    poll.next=next;
                }else{
                    poll.next=null;
                }

                if (poll.left != null) {
                    queue.add(poll.left);
                }
                if (poll.right != null) {
                    queue.add(poll.right);
                }
            }
        }
        return root;
    }
```
