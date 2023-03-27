---
date: 2021-09-24
title: LeetCode-100. 相同的树
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
:::align-center
![2021-9-24-leetcode100.jpg](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-24/2021-9-24-leetcode100.jpg)
:::
```
输入：p = [1,2,3], q = [1,2,3]
输出：true
```
## 思路
相同的树，有两点。一是结构相同，左右子树位置一一对应，二是节点值相同。
那么可以有两种遍历方案，
一是深度优先遍历，从根节点出发，各个节点依次往下遍历。
二是广度优先遍历，从根节点出发，用队列存储各层节点，一层层判断遍历。

推荐使用深度优先遍历，虽然效率上没有广度好，但是结构清晰，比广度优先遍历少上很多逻辑，便于理解。
## 代码
```
 public boolean isSameTree(TreeNode p, TreeNode q) {
        return isTrue(p,q);
    }

    public boolean isTrue(TreeNode p,TreeNode q){
        if(p==q){
            return true;
        }
        if(p==null || q==null){
            return false;
        }
        return p.val==q.val && isTrue(p.left,q.left) && isTrue(p.right,q.right);
    }
```
在遍历节点相等的时候，因为还要兼并判断结构是否相等，所以可以断言如果有一方为null，但是双方不相等的话，一定不相等。
## 扩展
本题简单，考察的就是树的遍历，进行值和结构判断。
和本题类型相同的有很多，但都离不开广度或深度优先遍历。
比如本题还可以问，**两颗树是否有相同的子树**，或者**相同的子树有多少颗**。
但是只要理解了，两种遍历方式的其中一种，然后根据图形结合，这种题型都比较容易拿下。
