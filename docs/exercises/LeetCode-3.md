---
title: LeetCode-3. 无重复字符的最长子串
category: 刷题日记
tag:
  - LeetCode
head:
  - - meta
    - name: keywords
      content: JVM,JDK,JRE,字节码详解,Java 基本数据类型,装箱和拆箱
  - - meta
    - name: description
      content: 全网质量最高的Java基础常见知识点和面试题总结，希望对你有帮助！
---
**示例 1:**
```
输入: s = "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
```
第一眼看到题，？我好像做过，又感觉没有。
但是第一反应还是知道要用滑动窗口解决。

### 滑动窗口

像拉动窗户一样，从一边拉到另一边。

理解起来也很简单，设定一边为left左指针，在遍历判断的同时，关注左指针滑动的位置。

### 题解
````
 public int lengthOfLongestSubstring(String s) {
        if(null==s ||s.length()==0){
            return 0;
        }
        
        Map<Character,Integer> map=new HashMap<>();
        int left=0;  //左指针
        int max=0;
        for(int i=0;i<s.length();i++){
            if(map.containsKey(s.charAt(i))){
                Integer integer = map.get(s.charAt(i));
                left=Math.max(left,integer+1); //判断滑动位置
            }
            map.put(s.charAt(i),i);
            max=Math.max(max,i-left+1);
        }
        return max;
    }
````
