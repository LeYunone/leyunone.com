---
date: 2021-09-29
title: LeetCode-235. 二叉搜索树的最近公共祖先
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
![image.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-29/image.png)

## 思路
二叉树经典问题，寻找最近公共祖先。
首先要知道二叉树的一个特点，对于根节点而言，左孩子中所有树比根节点小，右孩子所有树比根节点大。
运用这条规律，我们可以知道，如果有3,5两个节点，则他们的公共祖先 一定是在3 - 5 之间的数，即为4.
对0，3 而言，他们的公共祖先在0-6中间， 有1、2、3、4、5 可选。
而题目有说，最近的公共祖先，所以我们只要找到一个节点，他的值是在两节点中间，则说明这个数是他们最近的公共祖先节点。

## 代码
```
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        TreeNode temp=root;
        while(true){
            if(temp.val>p.val && temp.val>q.val){
                temp=temp.left;
            }else if(temp.val<p.val && temp.val<q.val){
                temp=temp.right;
            }else{
                return temp;
            }
        }
    }
```
