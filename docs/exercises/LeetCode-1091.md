---
date: 2021-11-19 16:26:44
title: LeetCode-1091. 二进制矩阵中的最短路径
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
![QQ截图20211119162613.png](https://www.leyuna.xyz/image/2021-11-19/QQ截图20211119162613.png)
## 思路
很经典的搜索问题，这种方块路径的问题[因为有八个方位]如果开始想着用深度优先的路子走的话一定超时。
老规矩列先出八个方位的移动。
然后就是对特殊情况的判断
grid[0][0]!=0
grid[y][x]!=0
然后就是对搜索方式的设计
显示关于路径，我们需要一个数组用来实时的存储搜索到每一步时的路径。
然后也需要一个数组用来保存所有当前可走的下一步坐标。
最后配合广度搜索的队列定式，来完成解题。


## 代码
```
    public  int shortestPathBinaryMatrix(int[][] grid) {
        int [] [] moves=new int [] [] {{0,1},{0,-1},{1,0},{-1,0},{1,1},{1,-1},{-1,1},{-1,-1}};
        int yLen=grid.length;
        int xLen=grid[0].length;
        Queue<int []> queue=new LinkedList();
        if(grid[0][0]!=0 || grid[yLen-1][xLen-1]!=0){
            return -1;
        }
        queue.add(new int [] {0,0,1});
        while(!queue.isEmpty()){
            int[] poll = queue.poll();
            int y=poll[0];
            int x=poll[1];
            //当前坐标的路径
            int dis=poll[2];
            for(int [] move:moves){
                int newY=y+move[0];
                int newX=x+move[1];
                if(newY<yLen && newY>=0 && newX>=0 && newX<xLen && grid[newY][newX]==0){
                    queue.add(new int [] {newY,newX,dis+1});
                    //标明当前坐标已被访问过，如果还有坐标过来，那也说明这条路有人走过了，你不可能是最短路径了，可以直接排除掉.
                    grid[newY][newX]=1;
                }else{
                    continue;
                }
                // 最快到达目的地的，一定就是最短路径
                if(newY==yLen-1 && newX==xLen-1){
                    return dis+1;
                }
            }
        }
        //当只有一个元素且为0时，原地跳跃
        return xLen==1&&yLen==1?1:-1;
    }
```
