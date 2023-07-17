---
date: 2021-09-26
title: LeetCode-112. 路径总和
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
**示例**：
![QQ截图20210924100703.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-26/QQ截图20210924100703.png)
## 思路
二叉树的经典简单问题之一，求路径之和。
和遍历树的方式息息相关，深度优先遍历或广度优先遍历。
使用深度优先遍历，则以根节点5出发，往下遍历，计算到各个节点时和目标值的差，直到遇到等于目标值差的叶子节点出现。
不过使用深度优先遍历时，要注意本题中没有限定目标值和节点值的正负数。所以能出现负数的节点和整数的节点交互出现，所以不能通过 
> 当前节点大于目标值  root.val>target

来剪断子树，断言返回结果。

使用广度优先遍历，则需要两个队列，一是记录当前节点TreeNode，二是记录到当前节点的路径和。
广度优先遍历从上往下层层遍历，在本题中，没有深度优先遍历灵活，因为同样是不能中途剪断子树，所以需要一直往下遍历。
但是操作两个队列的过程中，需要计算额外的内存支出。所以推荐使用广度优先遍历。

## 代码
```
    public boolean hasPathSum(TreeNode root, int targetSum) {
        return isTrue(root,targetSum);
    }

    public boolean isTrue(TreeNode root,int tar){
        if(root==null ){
            return false;
        }
        if(root.val==tar && root.left==null && root.right==null){
            return true;
        }
        return isTrue(root.left,tar-root.val) || isTrue(root.right,tar-root.val);
    }
```
