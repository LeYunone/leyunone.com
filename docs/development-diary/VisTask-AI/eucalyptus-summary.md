---
date: 2026-04-22
title: Eucalyptus-项目总结
category:
  - 开发日记
tag:
  - 开发日记
  - AI
  - 数字分身
head:
  - - meta
    - name: keywords
      content: AI,数字分身,项目总结,Eucalyptus,提示词工程,全程AI开发,乐云一
  - - meta
    - name: description
      content: Eucalyptus 7x24 AI数字分身系统的项目总结——展示效果、伪代码+时序图回顾，以及这个项目全程由AI完成的记录。
---

# Eucalyptus — 项目总结

## 序

从最初的一个想法，到现在三个系统能完整跑起来，整个过程说实话挺魔幻的。

因为**这个项目全程是AI完成的**。

对，你没看错。这个"让AI替我打工"的系统，本身也是AI帮我搭建的。这就像一个人发明了 cloning 技术，然后用这项技术克隆了自己一样——有点套娃的意思。

这篇总结就来回顾一下整个项目的效果展示、核心链路，以及"AI开发AI"这件事本身。

## 项目总览

### 系统架构一览

```
┌─────────────────────────────────────────────────────────────────┐
│                      Eucalyptus 系统架构                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    vistask-ai（调度中心）                   │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │    │
│  │  │ 任务创建  │  │ 任务认领  │  │ 进度追踪  │  │ MCP工具  │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │    │
│  │  Spring Boot + Vue3 + MySQL + Redis                       │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │ REST API                            │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Task Processor（执行引擎）                  │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │    │
│  │  │ 轮询认领  │  │ 流式解析  │  │ 进度上报  │  │ 文件上传  │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │    │
│  │  Python + subprocess + HMAC                               │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │ Claude CLI                           │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Eucalyptus（数字分身）                    │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │  41 Skills  │  22 Agents  │  项目知识库           │   │    │
│  │  └──────────────────────────────────────────────────┘   │    │
│  │  Claude Code + 提示词工程                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 技术栈总览

| 组件 | 技术栈 | 代码量 |
|------|--------|--------|
| vistask-ai 后端 | Spring Boot + Spring AI MCP + JPA + MySQL + Redis | ~50+ Java文件 |
| vistask-ai 前端 | Vue3 + Vite + Element Plus | ~10+ Vue组件 |
| Eucalyptus | Claude Code + 41 Skills + 22 Agents | ~60+ Prompt文件 |
| Task Processor | Python + subprocess + HMAC | 1 Python主文件 |

## 效果展示

### 场景一：自动Bug修复

**输入**：在vistask-ai创建Bug修复任务

```
任务信息:
├── 标题: 修复DMS用户登录偶发超时问题
├── 描述: 高并发场景下，用户登录接口偶发超时，错误码504
├── 项目: DMS
├── 优先级: HIGH
└── 提示词: "分析DMS项目登录模块的并发问题，定位超时根因并修复"
```

**自动执行链路**：

```
[00:00] Task Processor 轮询到任务，自动认领
[00:01] 调用 Eucalyptus → master-skill → 意图识别: BUG_FIX
[00:01] 路由到 fix-workflow → project-router 加载DMS知识库
[00:02] fix-triage Agent: 分类=并发问题, 严重级别=HIGH
[00:04] fix-reproduce Agent: 复现条件=并发>500时触发
[00:07] fix-diagnose Agent: 根因=Redis连接池耗尽
[00:10] fix-repair Agent: 修复连接池配置, 添加超时兜底
[00:12] fix-deliver Agent: 提交代码, 创建PR
[00:12] Task Processor 上报完成, 上传结果文件
```

**输出**：12分钟完成一个Bug的完整修复流程，全程无人干预。

### 场景二：并行多任务

**输入**：同时创建3个不同类型的任务

```
┌─ 任务1: DMS后端新需求（用户权限模块）     ── 后端工程师分身
├─ 任务2: APM前端Bug修复（图表显示异常）     ── 前端工程师分身
└─ 任务3: AMS代码重构（数据库访问层优化）   ── 重构工程师分身
```

**并行执行**：

```
时间轴:
──────────────────────────────────────────────────────────
T+00:00  分身1: 认领任务1 → feature-workflow → 后端开发
         分身2: 认领任务2 → fix-workflow → 前端Bug修复
         分身3: 认领任务3 → refactor-workflow → 代码重构

T+05:00  分身1: [需求分析中...]
         分身2: [Bug复现完成，正在诊断...]
         分身3: [代码扫描中，分析重构范围...]

T+10:00  分身1: [接口设计完成，开始编码...]
         分身2: [根因定位完成，开始修复...]
         分身3: [重构方案制定，开始执行...]

T+20:00  分身1: ✓ 编码完成，创建PR
         分身2: ✓ 修复完成，创建PR
         分身3: ✓ 重构完成，创建PR

──────────────────────────────────────────────────────────
总耗时: ~20分钟（并行）
如果串行执行: ~60分钟
效率提升: 3倍
```

### 场景三：7x24自动值守

```
某天的任务执行时间线:

凌晨 02:15  →  自动修复线上告警Bug（完成）
凌晨 04:30  →  自动优化APM项目慢查询（完成）
上午 08:00  →  我起床，查看任务看板
上午 09:00  →  我创建新需求任务（3个）
上午 09:01  →  AI开始并行执行
上午 12:00  →  全部完成，我Review并合并
下午 14:00  →  AI自动清理DMS项目的技术债（空闲任务）
下午 18:00  →  我下班
晚上 20:00  →  AI继续执行待办任务列表
晚上 23:00  →  我睡觉
...AI继续工作...
```

**一天24小时，AI从未停止。**

## 核心链路回顾

### 全链路伪代码

```
// ==================== 主循环 ====================
function main():
    // Phase 1: 初始化
    api = VistaskAPI(config.endpoint)
    api.login(config.username, config.password)

    // Phase 2: 无限轮询
    while True:
        ensure_token_valid()           // Token保活

        task = api.claim_task()        // 认领任务
        if task is None:
            sleep(10)
            continue

        // Phase 3: 执行任务
        try:
            result = execute_task(task)
            api.complete_task(task.id, result)
        except:
            api.fail_task(task.id, error_message)


// ==================== 任务执行 ====================
function execute_task(task):
    // Step 1: 构建执行参数
    params = build_params(task)

    // Step 2: 调用Eucalyptus
    session_id = task.session_id or generate_uuid()
    process = ClaudeCLI.launch(
        skill = "/execute-task",
        session_id = session_id,
        params = params,
        output_format = "stream-json"
    )

    // Step 3: 流式处理
    for event in process.stream():
        progress = parse_event(event)
        api.update_progress(task.id, progress)

    // Step 4: 上传结果
    if has_result_files():
        upload_result_files()

    return collect_results()


// ==================== Eucalyptus内部调度 ====================
function eucalyptus_execute(params):
    // Step 1: 意图识别
    intent = master_skill.analyze(params.prompt)

    // Step 2: 项目路由
    project_ctx = project_router.load(params.project)

    // Step 3: 工作流分发
    workflow = select_workflow(intent.type)
    //   BUG_FIX → fix-workflow
    //   NEW_FEATURE → feature-workflow
    //   REFACTOR → refactor-workflow
    //   DEPLOY → deploy-workflow

    // Step 4: 工作流执行
    context = init_context(params)
    for stage in workflow.stages:
        context = stage.agent.execute(context)
        update_shared_context(context)

    // Step 5: 知识库更新
    knowledge_base.update(project_ctx, context)

    return context.result


// ==================== Bug修复流水线 ====================
function fix_workflow(context):
    // 阶段1: 分诊
    triage_result = fix_triage_agent.execute(
        bug_description = context.prompt,
        project_knowledge = context.project_kb
    )
    context.triage = triage_result

    // 阶段2: 复现
    reproduce_result = fix_reproduce_agent.execute(
        triage = triage_result,
        environment = context.project_env
    )
    context.reproduce = reproduce_result

    // 阶段3: 诊断
    diagnose_result = fix_diagnose_agent.execute(
        reproduce = reproduce_result,
        codebase = context.project_code
    )
    context.diagnosis = diagnose_result

    // 阶段4: 修复
    repair_result = fix_repair_agent.execute(
        diagnosis = diagnose_result,
        codebase = context.project_code
    )
    context.repair = repair_result

    // 阶段5: 交付
    deliver_result = fix_deliver_agent.execute(
        repair = repair_result,
        git_config = context.project_git
    )
    context.deliver = deliver_result

    return context
```

### 全链路时序图

```
人类          vistask-ai       TaskProcessor     Eucalyptus       知识库       Git
 │               │                 │                │               │          │
 │[创建任务]     │                 │                │               │          │
 │──────────────>│                 │                │               │          │
 │               │                 │                │               │          │
 │               │<──[轮询]────────│                │               │          │
 │               │──[返回Task]────>│                │               │          │
 │               │                 │                │               │          │
 │               │<──[认领]────────│                │               │          │
 │               │──[确认]────────>│                │               │          │
 │               │                 │                │               │          │
 │               │                 │[调用技能]       │               │          │
 │               │                 │───────────────>│               │          │
 │               │                 │                │               │          │
 │               │                 │                │[加载知识库]     │          │
 │               │                 │                │──────────────>│          │
 │               │                 │                │<──────────────│          │
 │               │                 │                │               │          │
 │               │                 │                │[六阶段流水线]   │          │
 │               │                 │                │               │          │
 │               │                 │<──[TEXT]───────│               │          │
 │               │<──[进度15%]─────│                │               │          │
 │               │                 │<──[TOOL_USE]───│               │          │
 │               │<──[进度30%]─────│                │               │          │
 │               │                 │<──[TEXT]───────│               │          │
 │               │<──[进度60%]─────│                │               │          │
 │               │                 │<──[RESULT]─────│               │          │
 │               │<──[进度100%]────│                │               │          │
 │               │                 │                │               │          │
 │               │                 │                │[提交代码]─────>│          │
 │               │                 │                │               │    [PR]  │
 │               │                 │                │               │          │
 │               │                 │                │[更新知识库]────>│          │
 │               │                 │                │               │          │
 │               │<──[完成]────────│                │               │          │
 │               │──[确认]────────>│                │               │          │
 │               │                 │                │               │          │
 │[查看结果]     │                 │                │               │          │
 │──────────────>│                 │                │               │          │
 │<──[任务报告]──│                 │                │               │          │
```

## 全程AI完成

### 这个项目是怎么做出来的

说实话，这个项目本身就是提示词工程能力的最好证明。因为**从头到尾，都是AI写的**。

**vistask-ai**：用Claude Code从零搭建，包括：
- Spring Boot项目初始化和DDD分层结构
- 数据库表设计和JPA实体
- REST API接口和MCP工具定义
- Vue3前端页面（赛博朋克风格）
- 认证、权限、国际化等功能

**Eucalyptus**：整套提示词体系由Claude Code设计，包括：
- CLAUDE.md元规则
- 41个Skill的定义和Prompt
- 22个Agent的分工和协作规则
- 项目知识库模板和规范
- 工作流编排逻辑

**Task Processor**：用Claude Code编写，包括：
- Python主程序和轮询逻辑
- Claude CLI的调用和流式解析
- 文件上传和HMAC认证
- 异常处理和自动重试

### 开发过程

```
开发过程（简化版）:

Day 1: "帮我搭建一个Spring Boot + DDD结构的任务管理系统"
       → AI生成了vistask-ai后端的骨架代码

Day 2: "给任务系统加上MCP协议支持，让AI Agent能操作任务"
       → AI实现了McpTaskService和三个核心工具

Day 3: "帮我设计一套数字分身的技能体系，要能修Bug、做需求、重构代码"
       → AI设计了41个Skill和22个Agent的完整体系

Day 4: "写一个Python程序，轮询任务API并用Claude CLI执行"
       → AI生成了Task Processor的完整代码

Day 5: "把三个系统串起来，跑通完整链路"
       → AI帮我调试、修Bug、优化，直到全链路跑通
```

五天时间，一个人，一个AI，三个系统，完整闭环。

### AI开发的优势

用AI来开发这个项目，有几个特别明显的优势：

**1. 跨技术栈无缝切换**

这个项目涉及Java、Vue3、Python、提示词工程四种技术栈。如果纯人工做，切换成本很高。但对AI来说，切语言就像切输入法一样自然。

**2. 设计和实现同步**

传统开发是先设计文档，再写代码，两个阶段分离。用AI开发，设计思路确认后可以直接生成代码，设计和实现几乎同步完成。

**3. 一致性保证**

因为都是同一个AI写的，代码风格、命名规范、架构思路高度一致。不会出现多人协作时的风格不统一问题。

**4. 文档自然产出**

AI在写代码的同时就能生成文档——知识库文件、架构文档、API说明。不需要额外花时间写文档。

### AI开发的局限

当然，也要说实话。AI开发不是万能的：

1. **需要人来做架构决策**：AI能写代码，但"为什么要这样设计"还是需要人来判断
2. **复杂调试需要人介入**：有些跨系统的Bug，AI定位起来还是比较费劲
3. **创意和灵感来自人**：AI很擅长执行，但"做什么"和"为什么做"还是人决定的

所以准确的说法是：**AI是执行者，人是决策者。**

这个项目就是最好的证明——我决定做什么、怎么设计，AI负责实现。

## 数据说话

最后用一些数字来总结这个项目：

| 指标 | 数值 |
|------|------|
| 系统组件 | 3个 |
| 技能总数 | 41个 |
| Agent总数 | 22个 |
| 编程语言 | Java + Vue3 + Python + Prompt |
| 框架 | Spring Boot + Claude Code |
| 协议 | REST API + MCP + Claude CLI |
| 工作模式 | 7x24不间断轮询 |
| 并行能力 | 多任务同时执行 |
| 知识覆盖 | 3个项目（DMS/APM/AMS） |
| 人类参与时间 | < 10%（决策 + Review） |
| AI参与时间 | > 90%（实现 + 执行 + 维护） |

## 最后的最后

回顾这个项目，最大的感触是：

**提示词工程的尽头，不是写一段好Prompt，而是构建一个能自己干活的系统。**

一个Prompt只是一次性的工具，一个技能是可复用的工具，一个工作流是系统化的工具链，而**一个数字分身是持续进化的生产力**。

Eucalyptus不是终点，而是一个起点。未来这个系统还能进化出更多的能力：
- 更智能的任务调度
- 更强的跨项目协作
- 更丰富的知识库
- 更完善的自我学习

但在这一切之前，最重要的是——**先跑起来**。

而现在，它已经在跑了。7x24，从不间断。

这就是Eucalyptus。
