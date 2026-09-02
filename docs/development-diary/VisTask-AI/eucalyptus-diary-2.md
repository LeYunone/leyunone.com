---
date: 2026-02-20
title: Eucalyptus日记2-实现思路
category:
  - 开发日记
tag:
  - 开发日记
  - AI
  - 数字分身
head:
  - - meta
    - name: keywords
      content: AI,数字分身,实现思路,提示词工程,时序图,乐云一
  - - meta
    - name: description
      content: Eucalyptus数字分身系统的最终实现思路，围绕时序流转、工作流编排、Agent协作等核心机制的落地。
---

# Eucalyptus 日记2 — 最终实现思路

## 序

上一篇聊了设计思路和链路推演，这篇来聊聊**这些设计是怎么落地的**。

说实话，从设计到实现之间，差了十万八千里。很多在设计阶段觉得"应该没问题"的东西，真正跑起来才发现到处是坑。

这篇依然不聊代码细节，而是聚焦在**实现的核心思路**——时序怎么串的、流程怎么编排的、Agent之间怎么协作的。

## vistask-ai的实现思路

### DDD分层

后端采用的是DDD（领域驱动设计）分层架构。选DDD不是赶时髦，而是因为任务这个领域模型本身就有复杂的业务逻辑——状态流转、并发认领、进度追踪、重试机制——这些逻辑不应该散落在Service层里。

```
┌─────────────────────────────────────────┐
│  interfaces（接口层）                      │
│  ├── TaskController      REST接口        │
│  ├── McpTaskService      MCP工具暴露      │
│  └── TaskFeignClient     远程调用          │
├─────────────────────────────────────────┤
│  application（应用层）                     │
│  └── TaskApplicationService  业务编排      │
├─────────────────────────────────────────┤
│  domain（领域层）                          │
│  ├── Task               聚合根            │
│  ├── TaskRepository     仓储接口          │
│  └── TaskStatus         状态枚举          │
├─────────────────────────────────────────┤
│  infrastructure（基础设施层）              │
│  ├── TaskEntity         JPA实体           │
│  ├── TaskRepositoryImpl 仓储实现          │
│  └── TaskMapper         对象转换          │
└─────────────────────────────────────────┘
```

核心逻辑都内聚在Task这个聚合根里：

```python
class Task:
    # 状态流转——所有状态变更的逻辑都在这里
    def claim(self, processor_id):
        assert self.status == PENDING
        self.status = IN_PROGRESS
        self.claim_time = now()
        self.processor_id = processor_id

    def complete(self, result):
        assert self.status == IN_PROGRESS
        self.status = COMPLETED
        self.result = result

    def fail(self, error_msg):
        assert self.status == IN_PROGRESS
        self.status = FAILED
        self.error_message = error_msg
```

这样做的好处是，不管是从REST API来的请求，还是从MCP工具来的请求，都走同一套业务逻辑，不会出现不一致的情况。

### MCP工具暴露

vistask-ai通过Spring AI MCP Server框架，把任务操作暴露为MCP工具。这样任何支持MCP协议的AI Agent都能直接操作任务：

```
┌──────────────────────────────────────────┐
│          vistask-ai MCP Server            │
│          端点: /mcp                       │
├──────────────────────────────────────────┤
│                                          │
│  @McpTool claimTask()                    │
│    → AI主动认领待处理任务                  │
│    → 自动加锁，防止并发冲突                │
│                                          │
│  @McpTool completeTask(taskId, result)   │
│    → AI标记任务完成                       │
│    → 记录执行结果                         │
│                                          │
│  @McpTool failTask(taskId, errorMsg)     │
│    → AI标记任务失败                       │
│    → 记录错误信息，便于后续分析            │
│                                          │
└──────────────────────────────────────────┘
```

MCP工具的调用时序：

```
AI Agent              MCP Server            领域层             数据库
   │                     │                    │                  │
   │──claimTask()──────>│                    │                  │
   │                     │──task.claim()────>│                  │
   │                     │                    │──SELECT FOR UPD─>│
   │                     │                    │──UPDATE STATUS──>│
   │                     │<──claim result────│                  │
   │<──Task Info────────│                    │                  │
```

### 前端看板

前端用的是Vue3 + Vite，UI风格走的是**赛博朋克工业风**——霓虹色调、深色背景。说实话这个风格挺酷的，看任务状态一目了然。

核心组件就一个TaskList，负责展示所有任务的状态、进度、执行日志。

## Eucalyptus的实现思路

### 技能体系

Eucalyptus的核心能力是通过**技能（Skill）**来组织的。41个技能，每个技能都是一个独立的提示词工程。

技能之间有明确的层级关系：

```
master-skill（总调度）
    │
    ├── fix-workflow（Bug修复工作流）
    │     ├── fix-triage Agent
    │     ├── fix-reproduce Agent
    │     ├── fix-diagnose Agent
    │     ├── fix-repair Agent
    │     ├── fix-deliver Agent
    │     └── fix-verify Agent
    │
    ├── feature-workflow（新需求工作流）
    │     └── 需求分析 → 设计 → 实现 → 测试
    │
    ├── refactor-workflow（重构工作流）
    │     └── 分析 → 规划 → 执行 → 验证
    │
    └── deploy-workflow（部署工作流）
          └── 构建 → 测试 → 部署 → 验证
```

### 项目路由

当任务进来时，第一个关键步骤是**判断任务属于哪个项目**。这通过project-router技能实现：

```
function project_router(task):
    // 从任务上下文中提取项目标识
    project = extract_project_info(task)

    // 加载对应项目的知识库
    knowledge = load_project_context(project.name)
    // knowledge包含:
    //   - context.yaml   项目上下文
    //   - tech-stack.md  技术栈
    //   - architecture.md 架构文档

    // 切换到项目工作目录
    switch_workspace(project.workspace)

    // 将知识库注入到后续执行的上下文中
    inject_context(knowledge)

    return project
```

### Agent协作流水线

以Bug修复为例，六个Agent之间形成一条流水线。每个Agent完成自己的工作后，将结果写入共享上下文文件，下一个Agent从中读取：

```
时序：

fix-triage          fix-reproduce       fix-diagnose        fix-repair
    │                     │                   │                   │
    │ [分析Bug描述]       │                   │                   │
    │ [分类定级]          │                   │                   │
    │ [评估影响范围]      │                   │                   │
    │                     │                   │                   │
    │──写入triage结果──> context.md            │                   │
    │                     │                   │                   │
    │                     │ [读取triage结果]   │                   │
    │                     │ [尝试复现]         │                   │
    │                     │ [收集日志]         │                   │
    │                     │                   │                   │
    │                     │──写入reproduce结果─> context.md          │
    │                     │                   │                   │
    │                     │                   │ [读取reproduce结果]│
    │                     │                   │ [定位根因]         │
    │                     │                   │ [分析代码]         │
    │                     │                   │                   │
    │                     │                   │──写入diagnose结果─> context.md
    │                     │                   │                   │
    │                     │                   │                   │ [读取diagnose结果]
    │                     │                   │                   │ [编写修复代码]
    │                     │                   │                   │ [编写测试]
    │                     │                   │                   │
```

这种设计的好处是每个Agent**职责单一、互不干扰**，而且任何一个阶段失败了，只需要从失败的阶段重新开始，不用从头来过。

### 知识库管理

Eucalyptus的知识库结构：

```
memory/
├── projects/
│   ├── DMS/
│   │   ├── context.yaml       # 项目上下文（仓库地址、分支、环境）
│   │   ├── tech-stack.md      # 技术栈（Java、Spring Boot、Vue、Netty）
│   │   ├── architecture.md    # 架构文档（微服务、多仓库）
│   │   ├── conventions.md     # 代码规范
│   │   ├── recent-tasks.md    # 近期任务记录
│   │   └── known-bugs.md      # 已知Bug记录
│   ├── APM/
│   │   └── ...
│   └── AMS/
│       └── ...
└── templates/
    └── project-template/      # 新项目的知识库模板
```

知识库会在每次任务执行后**自动更新**——新的Bug记录、新的架构变更、新的代码规范都会被自动写入对应的知识库文件。

## Task Processor的实现思路

### 执行引擎

Task Processor的核心执行逻辑，是把vistask-ai的任务转换为Eucalyptus能理解的指令：

```
function execute_task(task):
    // 1. 构建执行参数
    params = {
        "task_id": task.id,
        "prompt": task.prompt,
        "project": task.project,
        "context_file": task.context_file
    }

    // 2. 调用Claude CLI
    process = subprocess.Popen([
        "claude",
        "--print",                    // 非交互模式
        "--output-format", "stream-json",  // JSON流式输出
        "--session-id", task.session_id,    // 会话管理
        "/execute-task",              // 调用Eucalyptus技能
        json.dumps(params)            // 传入任务参数
    ])

    // 3. 实时解析输出流
    for line in process.stdout:
        event = json.loads(line)
        handle_event(event)

    return process.wait()
```

### 事件解析与进度上报

Claude CLI输出的JSON事件有几种类型，每种都需要不同的处理：

```python
def handle_event(event):
    match event["type"]:
        case "TEXT":
            # AI输出的文本信息 → 作为进度描述上报
            report_progress(
                message=event["content"],
                percentage=estimate_progress()
            )

        case "TOOL_USE":
            # AI调用了工具（读文件、执行命令等）→ 记录操作步骤
            report_progress(
                message=f"执行操作: {event['tool']}",
                detail=json.dumps(event["input"])
            )

        case "TOOL_RESULT":
            # 工具返回结果 → 静默处理，不上报
            pass

        case "RESULT":
            # 最终结果 → 任务完成
            report_progress(
                message="任务执行完成",
                percentage=100
            )

        case "SYSTEM":
            # 系统消息 → 日志记录
            log_info(event["content"])
```

进度上报的时序：

```
Claude CLI          Task Processor          vistask-ai
    │                     │                     │
    │──TEXT event───────>│                     │
    │                     │──progress(15%)────>│
    │                     │                     │
    │──TOOL_USE event───>│                     │
    │                     │──progress(30%)────>│
    │                     │                     │
    │──TEXT event───────>│                     │
    │                     │──progress(60%)────>│
    │                     │                     │
    │──RESULT event─────>│                     │
    │                     │──progress(100%)───>│
    │                     │──complete()───────>│
```

### 异常处理

7x24运行最怕的就是挂掉。所以异常处理是重中之重：

```
function main_loop():
    while True:
        try:
            ensure_authenticated()    // 确保Token有效

            task = claim_task()       // 认领任务

            if task is None:
                sleep(IDLE_WAIT)      // 没活儿就等
                continue

            execute(task)             // 执行任务

        except RateLimitError:
            // 429限流 → 指数退避重试
            sleep(backoff_time)
            backoff_time *= 2

        except AuthError:
            // 认证失败 → 重新登录
            reauthenticate()

        except NetworkError:
            // 网络异常 → 等待后重试
            sleep(RETRY_WAIT)

        except TaskExecutionError as e:
            // 任务执行失败 → 上报失败状态
            fail_task(task_id, str(e))

        except Exception as e:
            // 未知异常 → 记录日志，继续循环
            log_error(e)
            sleep(ERROR_WAIT)
```

**关键设计**：不管出什么异常，主循环都不能断。每次异常处理后继续下一轮轮询。这就是7x24的底气。

### 文件上传链路

任务执行完成后，如果有产出文件（比如生成的报告、修复的代码补丁等），需要上传到文件服务器：

```
Task Processor              文件服务器
    │                           │
    │──计算文件MD5─────────────>│ (本地计算)
    │                           │
    │──判断文件大小             │
    │   ├── ≤ 5MB: 直接上传    │
    │   ├── ≤ 100MB: 10MB分片   │
    │   └── > 100MB: 20MB分片   │
    │                           │
    │──HMAC签名认证────────────>│
    │                           │
    │──分片上传(并发)──────────>│
    │   ├── chunk_1 ──────────>│
    │   ├── chunk_2 ──────────>│
    │   └── chunk_3 ──────────>│
    │                           │
    │──校验MD5─────────────────>│
    │<──上传完成───────────────│
```

上传完成后，把文件URL写回任务结果中。

## 全链路串起来

把所有组件的实现串在一起，完整的执行流程是这样的：

```
[阶段1: 任务创建]
人类/系统 → vistask-ai REST API → 创建Task(PENDING)

[阶段2: 任务认领]
Task Processor → 轮询 → SELECT FOR UPDATE → UPDATE IN_PROGRESS

[阶段3: 意图路由]
Task Processor → Claude CLI → Eucalyptus → master-skill → 路由到工作流

[阶段4: 项目切换]
project-router → 加载项目知识库 → 注入上下文

[阶段5: 工作流执行]
以fix-workflow为例:
  fix-triage → 分析 → 写入上下文
  fix-reproduce → 复现 → 写入上下文
  fix-diagnose → 诊断 → 写入上下文
  fix-repair → 修复 → 写入代码
  fix-deliver → 提交 → 创建PR

[阶段6: 进度上报]
每一步 → JSON事件流 → Process解析 → REST API上报

[阶段7: 结果上传]
产出文件 → HMAC认证 → 分片上传 → 文件服务器

[阶段8: 任务完成]
Process → completeTask() → vistask-ai → Task(COMPLETED)

[阶段9: 知识库更新]
Eucalyptus → 更新项目知识库 → 记录本次任务经验
```

## 小结

这篇日记主要梳理了**落地的核心实现思路**：

1. **vistask-ai**用DDD分层，把核心逻辑内聚在领域模型中
2. **Eucalyptus**用技能+Agent的编排实现复杂工作流，通过共享上下文文件实现Agent间协作
3. **Task Processor**用无限轮询+异常兜底实现7x24不间断运行
4. 三个组件通过REST API、Claude CLI、文件上传三条链路串联

设计到实现，最大的感触就是：**简单的东西能跑起来就是好东西**。

不要过度设计，先让链路跑通，再慢慢加功能。这才是工程化的正确打开方式。

下一篇，就该聊聊这个系统到底有多厉害了——数字分身的真正价值。
