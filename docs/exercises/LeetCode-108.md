---
title: LeetCode-108. 将有序数组转换为二叉搜索树
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
![2021-9-25-108leetcode.png](https://www.leyuna.xyz/image/2021-09-25/2021-9-25-108leetcode.png)width="auto" height="auto"}}}

## 思路
将有序【升序】数组转换为平衡二叉树。
何为平衡二叉树，最简单的一种就是从根节点出发，两边的结点数目相同。
由于题目不需要列出所有的平衡二叉树，所以不需要以数组中各个元素为根节点依次遍历。
要使两边的结点数目相同，则可以以升序数组的中间数为根据点，中间数左边的数为左孩子，右边数为右孩子。
恰好也符合，左小右大。
所以若有【-10,-3,0,5,9】数组。
则先以0位根节点，将-10和-3作为左孩子预备，5和9作为右孩子预备。
然后再依次遍历左孩子预备和右孩子预备。
遍历规则和开始一样，选取-10和-3的中间数，中间数左边为左孩子预备，右边数为右孩子预备。
....
按照这样的逻辑翻译，可以得出代码
## 代码
```
    public TreeNode sortedArrayToBST(int[] nums) {
        return orderArray(nums,0,nums.length-1);
    }

    public TreeNode orderArray(int [] nums,int left,int right){
        if(left>right) {
            return null;
        }
        int mid=(left+right)/2;
        TreeNode root=new TreeNode(nums[mid]);
        root.left=orderArray(nums,left,mid-1);
        root.right=orderArray(nums,mid+1,right);
        return root;
    }
```
