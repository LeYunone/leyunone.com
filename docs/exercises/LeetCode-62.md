---
date: 2021-11-19
title: LeetCode-62. 不同路径
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
![QQ截图20211119162824.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2021-11-19/QQ截图20211119162824.png)
## 思路
方块移动问题，一般都逃不过搜索或者动态规划。
本题考查的是动态规划，因为只有向右和向下两种行为。
所以我们到任一一点时，都可以看作是上一个坐标通过向右或者向下跑过来。
所以对于任何一坐标，都存在向右跑到他的路径，和向下跑到他的路径。
所以动态转移公式是
```
                      dp[i][j]=dp[i-1][j]+dp[i][j-1];
```
临界点：
因为没有太多的限制条件，只限制与图表中，所以只需要判断有没有走出表格的坐标即可
## 代码
```
    public int uniquePaths(int m, int n) {
        if(n<=1 || m<=1){
            return 1;
        }
        int [] [] dp=new int [m][n];

        for(int i=1;i<m;i++){
            dp[i][0]=1;
            for(int j=1;j<n;j++){
                dp[0][j]=1;
                dp[i][j]=dp[i-1][j]+dp[i][j-1];
            }
        }
        return dp[m-1][n-1];
    }
```
