---
date: 2021-09-26
title: LeetCode-118. 杨辉三角
category: 刷题日记
tag:
  - LeetCode
head:
  - - meta
    - name: keywords
      content: LeetCode,算法,刷题日记,乐云一
  - - meta
    - name: description
      content: 乐云一刷题日记！！！
---
**示例：**
![image.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-26/image.png)
## 思路
杨辉三角，数学问题。
已知规律是，某一数字为头上左右数相加， 第n行数有n+1个。
如果题目需要返回的是int[][]二维数组，则需要提前创建长度n+1的数组进行存储改行数据。
如果题目需要返回的是list，则可以直接循环操作。
循环逻辑：
1. 取上一个list的数组，当前下标为1的元素的值为上一个list 下标0和下标1的和。
2. 往后遍历，依次取上一个list数组中index和index-1用以计算当前数组的元素。
3. 填充首位和末尾的1.

## 代码
```
    public List<List<Integer>> generate(int numRows) {
        List<List<Integer>> result=new ArrayList<>();
        List<Integer> one=new ArrayList<>();
        one.add(1);
        result.add(one);
        for(int i=1;i<numRows;i++){
            List<Integer> list=new ArrayList<>();
            list.add(1);
            List<Integer> integers = result.get(i - 1);
            for(int j=1;j<integers.size();j++) {
                list.add(integers.get(j)+integers.get(j-1));
            }
            list.add(1);
            result.add(list);
        }
        return result;
    }
```
