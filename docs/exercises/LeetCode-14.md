---
date: 2021-09-23
title: LeetCode-14. 最长公共前缀
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
**示例：**
```
输入：strs = ["flower","flow","flight"]
输出："fl"
```
## 思路
根据题意求公共前缀，那么可以得到两个信息
1. 前缀，即从下标为0开始的子字符串
2. 公共，意思是各字符串中的前缀为包含关系

所以就可以随意循环一个字符串，并且逐步取其前缀子串判断是否在其他字符串中为包含关系。

## 代码
```
 public static String longestCommonPrefix(String[] strs) {
        int pre=0;
        String max="";
        String temp=strs[0];
        boolean is=true;
        for(int i=0;i<temp.length();i++){ //循环第一个数组
            String index=temp.substring(pre,i+1);
            for(int j=0;j<strs.length;j++){
                String str=strs[j];
                if(!str.contains(index) || str.indexOf(index)!=0){
                    is=false;
                    break;
                }
            }
            if(is){
                max=max.length()<index.length()?index:max;
            }else{
                pre++;
            }
        }
        return max;
    }
```
和LeetCode官网的代码很不同，虽然结果不好，但是感觉也是一种思路

![QQ截图20210923102110.png](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2021-09-23/QQ截图20210923102110.png)
