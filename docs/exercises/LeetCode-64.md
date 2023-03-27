---
date: 2021-11-19
title: LeetCode-64. 最小路径和
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
![QQ截图20211119163406.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-19/QQ截图20211119163406.png)
## 思路
本题的解决思路和[LeetCode-62. 不同路径](https://leyuna.xyz/#/blog?blogId=73)
相似。
前者是不同路径，本题是最小的路径和。
相同的都只有向下或向右两种行为。
所以对于任一一坐标，走到该坐标时的路径只可能是，他左边坐标的路径和，或者他上面坐标的路径和。
所以我们只需要动态的变化每一坐标的最小路径和就可。
临界点：
对于最上面一排和最左一排，因为都只能单向操作。
所以需要特殊处理。
其次因为是累加的最小路径，所以只需要判断坐标的左路径和与上路径和的最小值。
动态转移方程：
```
                dp[i][j]=Math.min(dp[i][j-1],dp[i-1][j])+grid[i][j];
```
## 代码
```
    public int minPathSum(int[][] grid) {
        int m=grid.length;
        int n=grid[0].length;
        int [] [] dp=new int [m] [n];
        dp[0][0]=grid[0][0];
        for(int i=1;i<m;i++){
            dp[i][0]=dp[i-1][0]+grid[i][0];
        }
        for(int i=1;i<n;i++){
            dp[0][i]=dp[0][i-1]+grid[0][i];
        }
        for(int i=1;i<m;i++){
            for(int j=1;j<n;j++) {
                dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];
            }
        }
        return dp[grid.length-1][grid[0].length-1];
    }
```
