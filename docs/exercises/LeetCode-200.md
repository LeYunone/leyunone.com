---
date: 2021-11-10
title: LeetCode-200. 岛屿数量
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
**示例**：
```
输入：grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
输出：1
```
## 思路
岛屿数量问题是一道非常非常经典的搜索问题。
摆到明面上的有两种办法，一是广度优先搜索，二是深度优先搜索。
也正好借着道题复习一下两种方法的运用。
### 深度优先搜索
能用深度的问题都能用广度，因为深度优先搜索相当于将广度的循环使用迭代的方式代替，走的更深，但是走过的路段也更加重复。
将题中的数字图看成无向图，每个数字之间都可以连接通向。
所以我们从随机一点出发，判断该点是否是大陆1，如果是，则从该点开始向四周搜索，并且将搜索到的点全部转换为海洋0。
然后我们只需要计数在数次判断点时，开始深度搜索的次数，就是图中大陆的数目了。

#### 代码
```
    public int numIslands(char[][] grid) {
        int xLen=grid[0].length;
        int yLen=grid.length;
        int result=0;
        for(int i=0;i<yLen;i++){
            for(int j=0;j<xLen;j++){
                if(grid[i][j]=='1'){
                    backOrder(grid,j,i);
                    result++;
                }
            }
        }
        return result;
    }

    public void backOrder(char [] [] grid ,int x,int y ){
        if(x<0 || x>=grid[0].length || y<0 || y>=grid.length || grid[y][x]!='1'){
            return;
        }
        grid[y][x]='0';
        backOrder(grid,x+1,y);
        backOrder(grid,x-1,y);
        backOrder(grid,x,y+1);
        backOrder(grid,x,y-1);
    }
```

### 广度优先搜索
在题目上，解决的方案和深度应该是一样的。我们都随机访问一个点，如果这个点是大陆，则以该点进行广度搜索，并且将搜索过的点转换为海洋，结果也是进行广度搜索的次数。
#### 代码
```
    public int numIslands(char[][] grid) {
        int count = 0;
        for(int i = 0; i < grid.length; i++) {
            for(int j = 0; j < grid[0].length; j++) {
                if(grid[i][j] == '1'){
                    bfs(grid, i, j);
                    count++;
                }
            }
        }
        return count;
    }
    private void bfs(char[][] grid, int i, int j){
        Queue<int[]> list = new LinkedList<>();
        list.add(new int[] { i, j });
        while(!list.isEmpty()){
            int[] cur = list.remove();
            i = cur[0]; j = cur[1];
            if(0 <= i && i < grid.length && 0 <= j && j < grid[0].length && grid[i][j] == '1') {
                grid[i][j] = '0';
                list.add(new int[] { i + 1, j });
                list.add(new int[] { i - 1, j });
                list.add(new int[] { i, j + 1 });
                list.add(new int[] { i, j - 1 });
            }
        }
    }
```
