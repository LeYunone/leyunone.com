---
title: LeetCode-226. 翻转二叉树
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
**示例**
![image.png](https://www.leyuna.xyz/image/2021-09-29/image.png)width="auto" height="auto"}}}

## 思路
题目是非常非常简单的难度，但是记录这道题的解题过程，纯粹就是因为业界的某个故事。
**如何看待 Max Howell 被 Google 拒绝？**
![QQ截图20210929101641.png](https://www.leyuna.xyz/image/2021-09-29/QQ截图20210929101641.png)width="auto" height="auto"}}}
总而言之就是，一个很厉害的大佬在面试的时候没有写出这道题。
转而变成： 大佬写不出=我写不出 -> 大佬没解出来所以没进谷歌<我解出来了谷歌什么时候来找我
解题方法就是很简单的，从上往下递归遍历，将各节点的左右孩子进行交换。

## 代码
```
    public TreeNode invertTree(TreeNode root) {
        resole(root);
        return root;
    }

    public void resole(TreeNode root){
        if(root==null){
            return ;
        }
        TreeNode temp=root.right;
        root.right=root.left;
        root.left=temp;
        resole(root.right);
        resole(root.left);
    }
```
