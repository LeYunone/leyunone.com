---
date: 2021-11-29
title: LeetCode-36. 有效的数独
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
![企业微信截图_20211129103012.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-29/企业微信截图_20211129103012.png)
## 思路
题目给的难度是中等，但是用中等难度的路线想就很绕了。
其实本题很简单，就是遍历所有格的字符，判断当前这个字符的位置，是否符合题意中的三规则。

1. 数字 1-9 在每一行只能出现一次。
2. 数字 1-9 在每一列只能出现一次。
3. 数字 1-9 在每一个以粗实线分隔的 3x3 宫内只能出现一次。（请参考示例图）

所以针对三规则，我们一一考虑。
第一条：每行出现一次。我们创建一个数组，存储每个数组对应的行的位置值，如果存储中发现这个位置已经有值，则说明这行出现过一次。
第二条：每列出现一次。同理第一条；
第三条：每个3*3的宫内，划分的原则是当前格子的坐标各除3，所以我们创建一个[3][3][9]的数组用来存储每个宫内元素的值。

根据以上分类讨论，题意解决就很简单了。

## 代码
```
    public boolean isValidSudoku(char[][] board) {
        int [] [] row=new int [9] [9];
        int [] [] columns=new int [9] [9];
        int [] [] [] range=new int [3] [3] [9];
        for(int i=0;i<9;i++){
            for(int j=0;j<9;j++){
                if(board[i][j]=='.'){
                    continue;
                }
                int index= board[i][j]-'0'-1;
                row[i][index]++;
                columns[j][index]++;
                range[i/3][j/3][index]++;
                if(row[i][index]!=1 || columns[j][index]!=1 || range[i/3][j/3][index]!=1){
                    return false;
                }
            }
        }
        return true;
    }
```
