---
title: LeetCode-101.对称二叉树
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
```
    1
   / \
  2   2
 / \ / \
3  4 4  3
```
## 思路
对称二叉树，又是一道二叉树遍历问题。
和[LeetCode-100.相同的树](https://leyuna.xyz/#/blog?blogId=23)思路类型，但是由于镜像的原因。
遍历树的过程需要反向插入节点。
结构的判断也不能判断节点相同或是不同了，需要考虑一个为空和另一个为空的情况。
不过原理还是那样，使用深度优先遍历，从左节点和右节点出发。因为是镜像，所以根节点一定相同。
然后遍历左节点的右孩子与右节点的左孩子，以此达到镜像遍历的效果
## 代码
```
    public boolean isSymmetric(TreeNode root) {
        return isTrue(root.left,root.right);
    }

    public boolean isTrue(TreeNode left,TreeNode right){
        if(left==null && right==null){
            return true;
        }
        if(left==null || right==null){
            return false;
        }
        return left.val==right.val && isTrue(left.left,right.right) && isTrue(left.right,right.left);
    }
```
