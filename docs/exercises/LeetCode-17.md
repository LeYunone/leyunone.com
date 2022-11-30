---
date: 2021-10-13
title: LeetCode-17. 电话号码的字母组合
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
**示例：**
![image.png](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2021-10-13/image.png)
```
输入：digits = "23"
输出：["ad","ae","af","bd","be","bf","cd","ce","cf"]
```
## 思路
排列组合的问题，首先需要列出一张和数字一一对应的map表
2-abc
3-def
4-ghi
5-jkl
6-mno
7-pqrs
8-tuv
9-wxyz
对组合模式进行分析，遍历digits字符串，当为2时，有abc ，选择a，其和数字3组合有ad,ae,af。
那么就可以找到逻辑，只需要维护一个已经固定好了头字符a的字符串，然后将他与数字3对应的字符串一一组合，并将他放入结果集中，那么和2中a相关的组合就可以全部列出。
遍历完a之后，将维护逻辑移至b
....
根据这样的思路，有解题步骤：
1. 创建一个字符串StringBuild，用以动态维护组合样式
2. 遍历原字符串“23”，从头取‘2’，获得2对应的‘abc’
3. 将‘abc’遍历，从头取‘a’，将其放入StringBuild，开始排列组合。
4. 重复2步骤，下标+1，取‘3’，获取3对应的‘def’
5. 将‘def’遍历，从头取‘d’，将其放入StringBuild，判断是否已经完成组合。
6. StringBuild.length==disits.length ，代表样式完成，将其中维护的一个组合加入结果集。
7. 删除StringBuild当前组合样式，即是步骤5中的‘d’，并且继续进行步骤5中‘def’的遍历，取‘e’
8. 重复5->6->7->3

## 代码
```
    public List<String> letterCombinations(String digits) {
        if(digits.length()==0){
            return new ArrayList();
        }
        String [] map=new String[]
              {"","","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"};
        List<String> result=new ArrayList<>();
        backOrder(result,map,digits,0,new StringBuilder());
        return result;
    }

    public void backOrder(List<String> result,String [] map,String digits,int index,StringBuilder sb){
        if(sb.length()==digits.length()){
            result.add(sb.toString());
        }else{
            char c = digits.charAt(index);
            String temp=map[c-48];  //ASCII码 '2'-'0' ==2;  '0'== 48
            for(int i=0;i<temp.length();i++){
                sb.append(temp.charAt(i));
                backOrder(result,map,digits,index+1,sb);
                sb.deleteCharAt(index);
            }
        }
    }
```
