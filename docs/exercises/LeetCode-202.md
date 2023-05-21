---
date: 2021-09-27
title: LeetCode-202.快乐数
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
输入：19
输出：true
解释：
12 + 92 = 82
82 + 22 = 68
62 + 82 = 100
12 + 02 + 02 = 1
```
## 思路
快乐数，指的是有结局的数。
对于非快乐数，都会陷入 **4→16→37→58→89→145→42→20→4** 的死循环中。
所以如果这个数是快乐数，按照规律计算最终一定会快乐变成1.
所以对于一个数，倘若这个数在快乐数循环中赛跑，如果跑到死循环中，则是非快乐数。
那么我们设这个数一定是非快乐数的前提下，是不是可以模拟一个未来的他和现在的他。
未来的他跑的快，先进入循环。 
但因为死循环的原因，所以未来的他一定会和现在的他相遇。
逻辑上，可以称之为快慢指针。
结果：若快指针和慢指针相遇，则说明他们是非快乐数，反之为快乐数。

## 代码
```
    public  boolean isHappy(int n) {
        int pre=n;
        int next=nextHappy(n);
        while(pre!=1 && pre!=next){
            pre=nextHappy(pre);
            next=nextHappy(nextHappy(next));
        }
        return pre==1;
    }

    public int nextHappy(int n){
        int sum=0;
        while(n!=0){
            int temp=n%10;
            sum+=temp*temp;
            n=n/10;
        }
        return sum;
    }
```
