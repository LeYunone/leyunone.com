---
date: 2021-09-25
title: LeetCode-104. 二叉树的最大深度
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
**示例：**

```
给定二叉树 [3,9,20,null,null,15,7]，
    3
   / \
  9  20
    /  \
   15   7
返回它的最大深度 3 。
```
## 思路
求二叉树的最大深度，其实就是求二叉树的最大层数。而关于层数遍历问题，这里使用深度遍历的话就会造成很多不必要的逻辑操作。
当这颗树很深的时候，深度优先遍历算法时间度很吃亏。
所以对于遍历层数操作，推荐使用广度优先遍历。
这道题刚好要算出的结果是最大层数，所以在对每一层结点进行遍历的时候，只需要累计当前层数，层层操作就行。
:::align-center
![QQ截图20210925114601.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-25/QQ截图20210925114601.png)
:::
从根节点出发，遍历一层，如果某一节点的左孩子或者右孩子存在，则添加到遍历数组中。一层遍历完，计数最大层数+1
如此翻译，则可得代码
## 代码
```
public int maxDepth(TreeNode root) {
        if(root==null){
            return 0;
        }
        Queue<TreeNode> queue=new LinkedList<>();
        queue.offer(root);
        int sum=0;
        while(!queue.isEmpty()){
            int size=queue.size(); //当前层数的结点数目
            while(size>0){
                TreeNode poll = queue.poll();
                if(poll.left!=null){
                    queue.offer(poll.left);
                }
                if(poll.right!=null){
                    queue.offer(poll.right);
                }
                size--;
            }
            sum++;
        }
        return sum;
    }
```
