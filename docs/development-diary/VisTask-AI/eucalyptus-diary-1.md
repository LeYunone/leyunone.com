---
date: 2026-02-14
title: Eucalyptus日记1-设计思路
category:
  - 开发日记
tag:
  - 开发日记
  - AI
  - 数字分身
head:
  - - meta
    - name: keywords
      content: AI,数字分身,提示词工程,时序图,架构设计,乐云一
  - - meta
    - name: description
      content: Eucalyptus数字分身系统的设计思路，围绕链路流转、时序设计、伪代码推演，不涉及代码细节。
---

# Eucalyptus 日记1 — 设计思路与链路推演

## 序

在上一篇里大概聊了下这个项目的初心和设想，这篇就开始聊聊具体的**设计思路**。

说实话，在动手之前，我在脑子里反复推演了整个链路不下十遍。因为这三个系统——vistask-ai、Eucalyptus、Task Processor——它们之间的关系不是简单的调用，而是要形成一个**完整的闭环**。

任何一个环节出了问题，整个链路就断了。

所以这篇日记不聊代码，只聊**思路**、**链路**、**时序**、**伪代码**。先把骨架搭好，再往里面填肉。

## 核心问题

在设计之初，我先问了自己三个问题：

1. **任务从哪来？** — 谁来创建任务，任务的格式是什么
2. **任务谁来做？** — AI怎么接任务，怎么执行任务
3. **任务结果怎么回传？** — 执行完了怎么通知"老板"

这三个问题回答清楚了，整个系统的骨架就出来了。

## 链路设计

### 全局链路

先看全局的流转链路，我把整个系统抽象为三个角色：

```
┌──────────┐     创建任务      ┌──────────────┐     轮询认领      ┌───────────────┐
│          │ ──────────────>  │              │  ──────────────>  │               │
│  人类/   │                  │  vistask-ai  │                   │    process    │
│  外部系统 │ <──────────────  │  (调度中心)    │  <──────────────  │  (执行引擎)    │
│          │     查看结果      │              │     进度上报       │               │
└──────────┘                  └──────────────┘                   └───────┬───────┘
                                                                         │
                                                                         │ 调用
                                                                         ▼
                                                                 ┌───────────────┐
                                                                 │  Eucalyptus   │
                                                                 │  (数字分身)    │
                                                                 └───────────────┘
```

整个链路的流转过程：

1. 人类（或外部系统）在vistask-ai上创建任务
2. Task Processor定时轮询vistask-ai，发现有未处理的任务
3. Task Processor认领任务，调用Eucalyptus执行
4. Eucalyptus根据任务类型选择对应的工作流执行
5. 执行过程中的进度实时流式上报给vistask-ai
6. 执行完成后，结果文件上传到文件服务器
7. vistask-ai更新任务状态为完成
8. 人类打开看板查看结果

### 关键链路：MCP协议桥接

这里面最关键的一个设计决策是：**Task Processor和vistask-ai之间用什么协议通信？**

一开始想过几种方案：

| 方案 | 优点 | 缺点 |
|------|------|------|
| 直接REST API | 简单直接 | 没法让AI主动操作任务状态 |
| 消息队列MQ | 解耦、异步 | 引入额外组件，过重 |
| MCP协议 | AI原生支持、标准化 | 需要Spring AI集成 |

最终选择了**REST API + MCP双通道**：

- Task Processor通过REST API与vistask-ai通信（认领、上报、完成）
- vistask-ai同时暴露MCP Server，让AI Agent能直接操作任务

这样设计的好处是：**Process是"拉"模式主动认领，MCP是"推"模式被动接收**，两条路都能走。

## 时序设计

### 主流程时序

整个系统最核心的时序，就是从任务创建到任务完成的完整生命周期：

```
人类          vistask-ai       Task Processor      Eucalyptus        文件服务器
 │                │                 │                  │                 │
 │──创建任务───>  │                 │                  │                 │
 │                │                 │                  │                 │
 │                │<──轮询任务────  │                  │                 │
 │                │──返回任务列表──>│                  │                 │
 │                │                 │                  │                 │
 │                │<──认领任务────  │                  │                 │
 │                │──确认认领─────>│                  │                 │
 │                │                 │                  │                 │
 │                │                 │──调用执行技能──>  │                 │
 │                │                 │                  │                 │
 │                │                 │    [六阶段流水线]  │                 │
 │                │                 │                  │                 │
 │                │<──流式进度───── │<──TEXT事件──────  │                 │
 │                │<──流式进度───── │<──TOOL_USE事件──  │                 │
 │                │<──流式进度───── │<──RESULT事件────  │                 │
 │                │                 │                  │                 │
 │                │                 │                  │──上传结果文件──> │
 │                │                 │                  │<──返回文件URL── │
 │                │                 │                  │                 │
 │                │<──完成任务───── │                  │                 │
 │                │──确认完成─────>│                  │                 │
 │                │                 │                  │                 │
 │──查看结果───>  │                 │                  │                 │
 │<──展示结果───  │                 │                  │                 │
```

### 任务认领的并发控制

这里有一个很重要的问题：**如果有多个Task Processor实例同时运行，怎么保证一个任务只被一个实例认领？**

这个在时序上需要做加锁处理：

```
Processor_A          vistask-ai           Processor_B
    │                    │                    │
    │──查询待处理任务──>  │                    │
    │<──返回Task_01───  │                    │
    │                    │                    │
    │──认领Task_01────>  │                    │
    │                    │<──查询待处理任务──  │
    │                    │──返回空(已被锁)──>  │
    │<──认领成功───────  │                    │
    │                    │                    │
```

实现上用的是数据库的**悲观锁**：

```sql
-- 认领时加锁
SELECT * FROM task
WHERE status = 'PENDING'
ORDER BY create_time ASC
LIMIT 1
FOR UPDATE;

-- 抢占更新
UPDATE task
SET status = 'IN_PROGRESS',
    claim_time = NOW(),
    processor_id = ?
WHERE id = ? AND status = 'PENDING';
```

先锁住，再更新，保证原子性。简单粗暴但有效。

## Eucalyptus的调度设计

### 四层架构

Eucalyptus的内部调度是整个系统的核心，我设计了四层架构：

```
┌────────────────────────────────────────────────┐
│              Layer 1: 元数字分身                  │
│            CLAUDE.md - 核心规则定义               │
├────────────────────────────────────────────────┤
│              Layer 2: 编排层                      │
│          master-skill - 意图识别 & 路由           │
├────────────────────────────────────────────────┤
│              Layer 3: 工作流引擎层                 │
│   fix-workflow | feature-workflow | refactor...  │
├────────────────────────────────────────────────┤
│              Layer 4: 执行器层                    │
│   backend-dev | frontend-dev | android-dev | ... │
└────────────────────────────────────────────────┘
```

### 意图路由

所有请求先进master-skill，由它判断该走哪个工作流。伪代码如下：

```
function master_skill(request):
    intent = analyze_intent(request)

    switch(intent.type):
        case "BUG_FIX":
            route_to("fix-workflow")
        case "NEW_FEATURE":
            route_to("feature-workflow")
        case "REFACTOR":
            route_to("refactor-workflow")
        case "DEPLOY":
            route_to("deploy-workflow")
        default:
            route_to("general-task-handler")
```

### Bug修复流水线

最复杂的要数fix-workflow，它是一个六阶段的流水线，每个阶段由不同的Agent负责：

```
┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│ 分诊    │──>│ 复现    │──>│ 诊断    │──>│ 修复    │──>│ 交付    │──>│ 验证    │
│ Triage │   │Reproduce│   │Diagnose│   │ Repair │   │Deliver │   │ Verify │
└────────┘   └────────┘   └────────┘   └────────┘   └────────┘   └────────┘
     │             │            │            │            │            │
  分类定级     尝试复现      定位根因      编写修复      提交代码      验证结果
  评估影响     确认现象      分析原因      编写测试      创建PR       回归测试
```

每个阶段的Agent之间通过**上下文文件**传递信息：

```
分诊 Agent 输出:
├── bug_category: "数据库连接池泄漏"
├── severity: "HIGH"
├── affected_modules: ["user-service", "order-service"]
└── reproduce_hints: "高并发场景下触发"

    ↓ 上下文传递

复现 Agent 输出:
├── reproduce_steps: [...]
├── environment: "test-env"
├── error_logs: [...]
└── confirmed: true

    ↓ 上下文传递

诊断 Agent 输出:
├── root_cause: "HikariCP max-pool-size配置过大"
├── related_code: "DataSourceConfig.java:42"
└── fix_suggestion: "调整连接池参数并添加泄漏检测"
```

## Task Processor的设计思路

### 轮询机制

Task Processor的核心就是一个**无限循环的轮询器**：

```
function main_loop():
    authenticate()  // 登录获取Token

    while True:
        task = claim_task()

        if task == null:
            sleep(10)  // 没活儿歇会
            continue

        try:
            result = execute_with_eucalyptus(task)
            complete_task(task, result)
        except Exception as e:
            fail_task(task, e.message)
```

看起来很简单，但里面有很多细节需要处理。

### 流式进度上报

Eucalyptus执行任务时，会通过Claude CLI的`stream-json`模式输出JSON事件流。Task Processor需要**实时解析这些事件并上报进度**：

```
Claude CLI 输出流:
─────────────────────────────────────
{"type":"TEXT","content":"正在分析任务..."}
{"type":"TOOL_USE","tool":"Read","input":{"file":"config.java"}}
{"type":"TOOL_RESULT","output":"文件内容..."}
{"type":"TEXT","content":"定位到问题所在..."}
{"type":"RESULT","content":"修复完成"}
─────────────────────────────────────

        ↓ 实时解析 & 转换

Progress上报:
─────────────────────────────────────
STEP 1/6: 正在分析任务...         [15%]
STEP 2/6: 读取配置文件 config.java [30%]
STEP 3/6: 定位到问题所在           [60%]
STEP 6/6: 修复完成                 [100%]
─────────────────────────────────────
```

### 文件上传

执行完成后，如果有结果文件需要上传，Task Processor需要处理**智能分片**：

```
function upload_file(file):
    size = file.size()

    if size <= 5MB:
        direct_upload(file)        // 小文件直接传
    elif size <= 100MB:
        chunk_upload(file, 10MB)   // 中文件10MB分片
    else:
        chunk_upload(file, 20MB)   // 大文件20MB分片

    verify_md5(file)               // 传完校验完整性
```

## 状态流转总结

把所有组件的状态流转串起来看：

```
任务状态流转:
PENDING ──[Process认领]──> IN_PROGRESS ──[执行成功]──> COMPLETED
                                         ──[执行失败]──> FAILED
                                         ──[被取消]────> CANCELLED

Eucalyptus工作流流转:
接收任务 ──[意图识别]──> 路由工作流 ──[阶段执行]──> 输出结果

Process执行状态流转:
空闲 ──[轮询到任务]──> 认领 ──[调用Eucalyptus]──> 执行中 ──[完成]──> 上报 ──> 空闲
```

## 遇到的设计难题

在设计过程中，有几个让我纠结了很久的问题：

### 难题一：Session复用

如果任务执行失败了需要重试，怎么保证AI能**接着上次的进度继续**？

解决方案是利用Claude的**Session ID**机制。每次执行任务时生成一个Session ID，如果任务需要重试，用同一个Session ID恢复会话：

```
// 首次执行
claude --session-id "task-123-session-1" --skill execute-task

// 失败重试，恢复会话
claude --resume --session-id "task-123-session-1" --skill execute-task
```

### 难题二：任务上下文传递

一个任务可能需要知道项目的完整上下文（架构、技术栈、近期变更），这些信息怎么传给Eucalyptus？

解决方案是在任务中嵌入`contextFile`字段，Eucalyptus在执行时会自动加载对应项目的知识库：

```
任务携带的信息:
{
    "taskId": "TASK-001",
    "prompt": "修复用户登录超时的问题",
    "project": "DMS",
    "contextFile": "share-context.md",
    "claudeSessionId": "xxx",
    "retryMode": "REPLACE"  // 重试时替换还是追加
}
```

### 难题三：Token管理

vistask-ai的认证Token有24小时过期时间，Task Processor需要自动刷新：

```
function authenticate():
    token = login(username, password)
    token_expire_time = now() + 23h  // 提前1小时刷新

function ensure_token_valid():
    if now() > token_expire_time:
        authenticate()  // 重新登录
```

## 小结

这篇日记主要梳理了整个系统的**设计思路**：

1. 三个组件形成一个完整闭环：调度 → 执行 → 反馈
2. 通过REST + MCP双通道实现任务分发
3. Eucalyptus内部通过四层架构实现智能调度
4. Task Processor通过轮询 + 流式解析实现7x24不间断工作
5. 状态流转、上下文传递、Session复用这些关键设计点

骨架搭好了，下一篇就该聊聊**最终的实现思路**了——这些设计是怎么一步步落地的。
