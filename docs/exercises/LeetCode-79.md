---
date: 2021-11-12 10:52:22
title: LeetCode-79. 单词搜索
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
![企业微信截图_20211112104543.png](https://www.leyuna.xyz/image/2021-11-12/企业微信截图_20211112104543.png)
## 思路
单词搜索，重要的是题意中的二维数组。
由于是在二维数组中操作，所以需要想到二维数组中的遍历方式。
一是看成无向图使用深度或广度搜索的方式。
二是可以使用回溯算法的模式。
本题是需要搜索到目标单词，所以后者使用回溯的方式更适合本题。
理由：
回溯可便于条件的判断和控制，再者本题还应注意不能重复访问元素，所以使用回溯的定式操作更加符合题意。
那么涉及到回溯就需要拉扯出本题的递归和终止条件了。
1. 二维数组的边界，终止
2. 当遍历到的字符不等于搜索单词对应的字符，终止
3. 当前元素已被访问过，终止

根据上述条件，
我们通过循环，随机去访问二维数组中任何一点，从该点出发进行二维数组的上下左右访问。
并且使用一个对应的boolean[][]控制当前回溯循环中元素的访问控制。

由以上伪代码思路，得：
## 代码
```
    public static boolean exist(char[][] board, String word) {
        boolean [] [] visted=new boolean [board.length][board[0].length];
        for(int i=0;i<board.length;i++){
            for(int j=0;j<board[0].length;j++){
                boolean is=order(board, visted, word, i, j, 0);
                if(is){
                    return is;
                }
            }
        }
        return false;
    }

    public static boolean order(char [] [] borad ,boolean [] [] visted,String word,int i,int j,int index){
        if(borad[i][j]!=word.charAt(index)){
            return false;
        }
        if(index==word.length()-1){
            return true;
        }
        visted[i][j]=true;
        int [] [] moves=new int [] [] {{0,-1},{0,1},{-1,0},{1,0}};
        for(int [] move:moves){
            int x=move[1]+j; int y=move[0]+i;
            if(x<0 || x>=borad[0].length || y<0 || y>=borad.length){
                continue;
            }else{
                if(!visted[y][x]){
                    //如果这次遍历里这个元素没被访问过
                    boolean order = order(borad, visted, word, y, x, index + 1);
                    if(order){
                        return true;
                    }
                }
            }
        }
        //回溯操作
        visted[i][j]=false;
        return false;
    }
```
