---
title: LeetCode-739. 每日温度
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
**示例1:**
```
输入: temperatures = [73,74,75,71,69,72,76,73]
输出: [1,1,4,2,1,1,0,0]
```

**示例2:**
```
输入: temperatures = [30,40,50,60]
输出: [1,1,1,0]
```
## 思路：
题目里给的是一组单调数组。
首先他没有规律，递增/递减，其次没有数据关联。
所以方向从数组数学问题转到数学逻辑问题上。
当然了，暴力破解的双循环，很容易一眼看出。
虽然意义不明显，但是还是可以从双循环中得出结论。
- 当遍历到温度比当前下标温度大时，结束循环
- 内层循环的过程中其实可以算出非本次循环下标的数组结果。

以此为头，当我们遍历下标2[75]的时候，会发现虽然要遍历到下标6[76]但是，当遍历到下标5[72]的时候，下标3[71]和下标4[69]的结果值也能看出来是2和1。

假设我们将遍历出来的下标各值不移除，而是堆积在一个盒子里，那么当遍历到72的时候，发现69和71比他小，且下标在他前面。
可以得出结果中下标71对应 result[3]= 5-3 =2  ;result[4]= 5-4 =1。

就这样，**堆积**和**不移除遍历**的特性，思路就转变为栈的数据堆积与判断了。
不多说，上代码
### 代码:
```
  Stack<Integer> stack=new Stack(); //温度文档
        int [] result=new int [temperatures.length];
        for(int i=0;i<temperatures.length;i++){
                //如果遍历到了大于栈底元素的值，就将栈顶小于他的值清空弹出
            while(!stack.empty() && temperatures[stack.peek()]<temperatures[i]){
                Integer pop = stack.pop();
                result[pop]=i-pop;
            }
            stack.push(i);
        }
        return  result;
```
其中虽然栈中还有元素，但这些元素对应的下标代表着的就是没有在递增的温度。
因为数组初始化的时候默认为0，所以省下再去遍历栈的空间。
![QQ截图20210913153241.png](https://www.leyuna.xyz/image/2021-09-13/QQ截图20210913153241.png)width="auto" height="auto"}}}
