---
date: 2021-10-09 14:37:28
title: LeetCode-6. Z 字形变换
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
**示例**
```
输入：s = "PAYPALISHIRING", numRows = 4
输出："PINALSIGYAHRPI"
解释：
P     I    N
A   L S  I G
Y A   H R
P     I
```
## 思路
按照上面解释中排列好的图形可以看出，字符串从左往右被从上到下的交互遍历。
最终将处于同一行的字符，一列列的从上往下的输出。
![QQ截图20211009143243.png](https://www.leyuna.xyz/image/2021-10-09/QQ截图20211009143243.png)
所以可以知道，需要使用4个字符串进行存储未知的字符。
假设图中从上往下，没一列是一个字符串数组。
字符P  放在array[0]中，
字符A 放在array[1]中，
字符Y放在array[2]中，
字符P放在array[3]中。
字符A放在array[2]中
.........
可以发现，当遍历列到底顶端或是低端的时候，需要发生一次倒装。
按照以上思路，可以翻译代码
## 代码
```
    public String convert(String s, int numRows) {
        List<StringBuffer> list=new ArrayList<>();
        for(int i=0;i<Math.max(s.length(),numRows);i++){
            list.add(new StringBuffer());
        }

        boolean is=false;
        int temp=0;
        for(char c:s.toCharArray()){
            list.get(temp).append(c);
            if(temp==0 || temp==numRows-1){
                is=!is;
            }
            temp+=is?1:-1;
        }
        StringBuffer result=new StringBuffer();
        for(StringBuffer sb:list){
            result.append(sb.toString());
        }
        return result.toString();
    }
```
