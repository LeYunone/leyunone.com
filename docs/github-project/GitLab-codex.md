---
date: 2023-03-14
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

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-03/8faaf17b-0190-4bd7-9408-0541f7c8e41d.png)

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-03/d8cb2c6e-ed32-4962-9cec-19128ee0c6e0.png)

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-14/77013ae9-89d3-4c92-8c2e-8ff0b8afd03b.png)

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

### 1\拿到所有可见的项目

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-14/61d5596d-5a4a-476c-b917-32ac9acaf118.png)

### 2\拿到项目下的所有分支

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-14/a98f0086-1dd9-46d9-a663-f0500a0ffe54.png)

### 3\拿到所有分支下的提交记录

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-14/42848433-6242-45d1-a941-963ef3c8d5e1.png" style="zoom: 85%;" />

### 4\对所有提交记录进行内容解析

 提交者，时间，提交者与提交项目关联，本次提交量，提交者累计提交量...

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2023-03-14/33905a99-fe93-43fa-ae01-319bc1562348.png" style="zoom:85%;" />

### 5\将所有表的数据清空

因为代码统计属于每天进行一次全量同步的方式

所以重新同步时，最好将前一次的同步信息清空

### 6\将收集到的数据进行批量插入或更新

使用 **ON DUPLICATE key update**

```sql
    INSERT INTO x_commit
    (id,commit_date,committer_email,committer_name,title,project_id,message,additions,deletions,total,storage_url)
        VALUES
        <foreach collection="commits" item="item" separator=",">
            (#{item.id},#{item.commitDate},#{item.committerEmail},#{item.committerName},#{item.title},#{item.projectId},#{item.message}
            ,#{item.additions},#{item.deletions},#{item.total},#{item.storageUrl})
        </foreach>
        ON DUPLICATE key update
        id = values(id),
        commit_date = values(commit_date),
        committer_email = values(committer_email),
        committer_name = values(committer_name),
        title = values(title),
        project_id = values(project_id),
        message = values (message),
        additions = values(additions),
        deletions = values(deletions),
        total = values(total),
        storage_url = values(storage_url)
```

## 定时操作

**定时原因**： 每天进行一个全量同步

### 推荐

定时的方式很多，可使用Spring-task、Quartz、线程...等等

方法很多，但是我推荐使用**XXL-JOB**

[XXL—Job任务调度中心](https://www.leyunone.com/github-project/XXL-Job.html)

**原因**：

因为会出现多个GitLab仓库需要进行统一的统计的原因；

所以需要通过自定义的去给GitLabApi对象进行不同的

**url、privateToken** 入参；

所以外置的定时调度中心做这件事刚刚好

```java
    @XxlJob(value = "git_summary")
    @Override
    public void execute() {
        String jobParam = XxlJobHelper.getJobParam();
        String[] split = jobParam.split("#");
        String token = null;
        String url = null;
        if(split.length>1){
            //自定义时间场景
            url = split[0];
            token = split[1];
        }
 codexSummaryService.summaryCodeX(url,token);
    }
```

```java
    public void summaryCodeX(String url, String token) {
        GitLabAPIService gitLabAPIService = GitLabAPIService.buildGitApiService(new GitLabApi(url, token));
        ......
```

```java
    public static GitLabAPIService buildGitApiService(GitLabApi gitLabApi){
        return new GitLabAPIService(gitLabApi);
    }
```




