---
date: 2023-03-03
title: GitLab-codex 代码统计
category: 
  - GitHub
tag:
  - GitHub
head:
  - - meta
    - name: keywords
      content: GitLab,Java,GitHub,Vue,前后端
  - - meta
    - name: description
      content: 使用GitLab api进行解析统计分析的前后端一体项目
---
# GitLab API

通过GitLab提供的各API，解析获得一份GitLab中，从项目维度、时间维度、人员维度、分组维度出发的，各个报表、图表等等；

# 成品

## 项目地址

[GitLab-codex](https://github.com/LeYunone/codex)

可直接享用的GitLab代码统计项目，前端包括页面已经完成;

## 成品图

![](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-03/8faaf17b-0190-4bd7-9408-0541f7c8e41d.png)

![](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-03/d8cb2c6e-ed32-4962-9cec-19128ee0c6e0.png)

![](https://leyuna-blog-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-14/77013ae9-89d3-4c92-8c2e-8ff0b8afd03b.png)

等等...

## 功能：

- 所有成员的所有项目代码量总和统计。
- 成员与项目绑定关系。
- 项目 - 成员，组成查询时间范围内的提交历史，包含：提交信息，新增代码量，删除代码量，代码总和。
- 成员Git账号与真实姓名的绑定设置
- 成员根据真实部门的自由分组

## 图表

- 人员随时间的代码提交情况
- 人员在指定项目中随时间的代码提交情况
- 小组部门随时间的代码提交情况
- 人员时间范围内总代码量排名
- 小组部门时间范围内总代码量排名

# 实现思路

## GitLab解析





