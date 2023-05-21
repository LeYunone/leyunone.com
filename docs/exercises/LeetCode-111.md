---
date: 2021-09-26
title: LeetCode-111. 二叉树的最小深度
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
![image.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-26/image.png)
## 思路
求最小深度，和求[最大深度](https://leyuna.xyz/#/blog?blogId=25)一样，都是求离根节点最远或最近叶子节点的问题。
因为是深度，所以不推荐使用深度优先遍历，因为不需要把所有节点遍历一次。
广度优先遍历一层层的添加树节点，并且在一层层遍历的过程中，累计添加当前层数。
当发现当层节点中，有节点左孩子和右孩子为空时。则可以断定这个节点就是离根节点最近的最小深度节点。
所以只需要返回当前的节点层数则为最小深度数了。
## 代码
```
 public int minDepth(TreeNode root) {
        if(root==null){
            return 0;
        }
        Queue<TreeNode> queue=new LinkedList<>();
        queue.add(root);
        int min=1;
        while(!queue.isEmpty()){
            int size = queue.size();
            while(size>0){
                TreeNode poll = queue.poll();
                if(poll.right==null &&  poll.left==null){
                    return min;
                }
                if(poll.right!=null){
                    queue.add(poll.right);
                }
                if(poll.left!=null){
                    queue.add(poll.left);
                }
                size--;
            }
            min++;
        }
        return min;
    }
```
