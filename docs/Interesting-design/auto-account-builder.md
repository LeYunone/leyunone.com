---
date: 2026-04-23
title: 全自动起号系统设计
category:
  - 业务设计
tag:
  - 业务设计
  - AI
  - 数字分身
head:
  - - meta
    - name: keywords
      content: 全自动起号,小红书,抖音,知乎,AI,数字分身,MCP,提示词工程,乐云一
  - - meta
    - name: description
      content: 基于Eucalyptus数字分身+vistask-ai任务调度，设计一套全自动起号系统，覆盖小红书、抖音、知乎三大平台的内容生产与自动发布。
---

# 全自动起号系统设计

## 为什么想做这个

起号这件事，说到底就是**内容工厂**。

不管小红书、抖音还是知乎，核心流程都是一样的：选题 → 写内容 → 配图/视频 → 发布 → 等流量。每个平台的风格不同，但流水线是一样的。

问题在于，一个人起号真的很累。

拿小红书来说，一天发3篇笔记，每篇要选题、写文案、做封面图、排版、打标签。光是一个平台，一天就要花2-3个小时。如果同时还要做抖音和知乎，一天的时间根本不够用。

而最让人难受的是，这些工作**重复度极高**。

选题可以靠搜索热词，文案可以靠模仿爆款，图片可以用模板生成，发布就是点几个按钮。每一步都是标准化的流程，偏偏每一步都需要人在操作。

所以很自然的想法：**能不能让AI来干？**

恰好，我的桉树（Eucalyptus）数字分身系统已经搭建完成，vistask-ai任务调度平台和Task Processor执行引擎也已经跑通了7x24不间断工作的链路。那么在这个基础上，加上各大平台的MCP工具，一套全自动起号系统就有了底座。

而各平台的MCP基本都已经被开源的大大们研究出来了，或多或少用了各种游览器工具模拟发布，例如随便在Github上搜索：


## 系统的本质

全自动起号系统的本质是：**一条从选题到发布的内容生产流水线**。

和工厂的生产线一样，原材料（热点话题）进来，经过一道道工序（搜索、写作、配图、排版），最终产出一个成品（文章/视频），然后自动发货（发布到平台）。

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/csss1174956.png)

这条流水线需要解决三个核心问题：

1. **内容从哪来** — 选题和素材采集
2. **内容怎么造** — AI创作和风格适配
3. **内容怎么发** — 多平台自动发布

下面围绕这三个问题展开。

## 架构设计

### 全局架构

整个系统复用Eucalyptus的三层架构，在其之上扩展起号专用的工作流和技能：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/adsad11175039.png)

### 与桉树系统的关系

全自动起号系统不是从零开始搭建的，它是**Eucalyptus的一个业务场景延伸**。

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/zz175121.png)

复用了桉树的调度、执行、轮询三大核心能力，只需要新增起号相关的技能和Agent。

## 功能分析

### 一、选题侦察

起号的第一步是知道**发什么**。

选题侦察Agent（topic-scout）的工作是自动发现各平台的热门话题和流量关键词。通过各平台的MCP工具，自动执行：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/g75205.png)

选题时序：

!()[https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/ggf175302.png]

### 二、内容创作

有了选题，下一步就是**写内容**。但这里有一个关键问题：**每个平台的风格完全不同**。

#### 小红书风格

小红书的爆款笔记有几个鲜明特征：

- **标题党**：数字+感叹号+emoji，比如"7天涨粉1000！！！我的方法竟然这么简单"
- **口语化**：像和朋友聊天一样，大量使用"姐妹们"、"绝了"、"真的会谢"
- **结构化**：问题引入 → 解决方案 → 效果展示 → 行动号召
- **图片驱动**：首图是灵魂，要吸睛、要对比、要有文字标注

所以内容创作Agent在面对小红书任务时，会加载小红书风格知识库：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/fg0511175837.png)

#### 抖音风格

抖音是短视频平台，内容形态完全不同：

- **前3秒定生死**：开头必须有钩子（"你知道吗？" / "别再XXX了"）
- **节奏快**：信息密度高，不废话
- **情绪化**：要有表情、语气、节奏的变化
- **BGM驱动**：音乐是氛围的核心

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/cc20.png)

#### 知乎风格

知乎偏理性、偏深度：

- **长文为主**：3000字起步，有逻辑、有数据、有引用
- **专业感**：术语准确、思路清晰、有代码/图表
- **价值导向**：回答"为什么"比"怎么做"更重要
- **引流能力**：知乎的搜索权重很高，长尾流量可观

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/xx5212.png)

### 三、图片编排

图片是起号的重中之重，尤其小红书。图片编排Agent需要完成：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/zxc185306.png)

图片编排时序：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/xxss510.png)

### 四、自动发布

内容制作完成后，通过各平台MCP工具自动发布：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/asdas260511185558.png)

## 全链路时序

把从任务创建到内容发布的完整链路串起来：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/adadss85636.png)

## 伪代码推演

### 任务创建

人类只需要在vistask-ai上下一个任务单，描述想要起什么号、什么领域：

```
任务定义:
{
    "type": "ACCOUNT_BUILD",
    "platform": "XIAOHONGSHU",       // 目标平台
    "niche": "编程学习",              // 目标领域
    "keywords": ["Python入门", "零基础编程", "转行程序员"],
    "frequency": 3,                  // 每天发3篇
    "style": "干货分享型",            // 内容风格
    "notes": "侧重女性受众，语言活泼"
}
```

### 选题Agent

```
function topic_scout(platform, niche, keywords):
    // Step 1: 多平台搜索
    hot_notes = xhs_mcp.search(niche + keywords)
    hot_videos = douyin_mcp.search(niche + keywords)
    hot_questions = zhihu_mcp.search(niche + keywords)

    // Step 2: 关键词提取
    all_titles = extract_titles(hot_notes + hot_videos + hot_questions)
    keyword_freq = count_keywords(all_titles)
    trending_words = top_n(keyword_freq, 20)

    // Step 3: 竞争度分析
    for word in trending_words:
        competition = count_search_results(word)
        traffic = estimate_traffic(word)
        score = traffic / competition
        topics.append({word, score})

    // Step 4: 排序输出
    return sort_by_score(topics)
```

### 内容创作Agent

```
function content_writer(platform, topic, style):
    // 加载平台风格知识库
    style_guide = load_style(platform)
    // style_guide 包含:
    //   - 标题模板（小红书: 数字+感叹号+emoji）
    //   - 正文结构（开头/中间/结尾模板）
    //   - 标签规范（标签数量、格式）
    //   - 禁忌词列表

    // 生成标题（5个备选）
    titles = generate_titles(topic, style_guide.title_templates, count=5)

    // 撰写正文
    content = draft_content(
        topic = topic,
        structure = style_guide.content_structure,
        tone = style_guide.tone,
        length = style_guide.recommended_length
    )

    // 生成标签
    tags = generate_tags(topic, platform, count=style_guide.tag_count)

    // 规划图片
    image_plan = plan_images(
        content = content,
        style = style_guide.image_style,
        count = style_guide.image_count
    )

    return {titles, content, tags, image_plan}
```

### 图片编排Agent

```
function image_designer(image_plan, platform):
    images = []

    for plan in image_plan:
        switch(plan.type):
            case "COVER":
                // 封面图: 大字标题 + 对比色背景
                bg = generate_background(plan.color_scheme)
                title_overlay = add_text(bg, plan.title, font="bold")
                image = resize(title_overlay, platform.cover_size)

            case "INFOGRAPHIC":
                // 信息图: 流程图/思维导图
                image = generate_infographic(
                    data = plan.data,
                    layout = plan.layout,
                    color_scheme = plan.color_scheme
                )

            case "SCREENSHOT":
                // 代码截图: 代码 + 标注
                image = capture_and_annotate(
                    code = plan.code,
                    highlights = plan.highlights
                )

        images.append(image)

    return images
```

### 自动发布Agent

```
function publisher(platform, content, images, tags):
    // 平台适配
    formatted = format_for_platform(platform, content, images, tags)

    // 调用对应平台的MCP发布
    switch(platform):
        case "XIAOHONGSHU":
            result = xhs_mcp.create_note(
                title = formatted.title,
                content = formatted.content,
                images = formatted.images,
                tags = formatted.tags,
                is_original = true
            )

        case "DOUYIN":
            result = douyin_mcp.create_video(
                title = formatted.title,
                video = formatted.video,
                cover = formatted.cover,
                tags = formatted.tags
            )

        case "ZHIHU":
            result = zhihu_mcp.create_answer(
                question_id = formatted.question_id,
                content = formatted.content,
                images = formatted.images
            )

    // 记录发布结果
    save_publish_record(platform, result)

    return result
```

## 完整工作流编排

把所有Agent串起来，形成完整的起号工作流：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/gggg11185725.png)

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/xxzz260511185808.png)

## 关键设计问题

### 一、多账号管理

起号通常不是起一个号，而是一批号。所以需要支持**多账号并行发布**：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/hh185855.png)

每个账号绑定不同的MCP认证信息，vistask-ai的任务单中指定目标账号，Task Processor在执行时根据target_account加载对应的MCP凭证。

### 二、内容去重和原创性

同一批号在同一领域，不能发重复内容。需要设计**内容指纹机制**：

```
function check_duplicate(new_content, account_history):
    // 计算新内容的指纹
    fingerprint = content_hash(new_content)

    // 与该账号历史内容比对
    for record in account_history:
        similarity = compare(fingerprint, record.fingerprint)
        if similarity > 0.7:    // 相似度超过70%判定为重复
            return DUPLICATE

    // 与同领域其他账号的内容比对
    for other_account in same_niche_accounts:
        for record in other_account.history:
            similarity = compare(fingerprint, record.fingerprint)
            if similarity > 0.5:  // 跨账号相似度阈值更低
                return SIMILAR

    return ORIGINAL
```

### 三、发布节奏控制

起号最忌讳的是**发布频率异常**。一个新号突然一天发10篇，大概率被平台风控。所以需要控制发布节奏：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/yy511190018.png)

vistask-ai在创建任务时，根据账号所处的阶段自动调整任务频率。

### 四、风格知识库持续进化

起号的核心竞争力在于**内容风格的质量**。风格知识库需要持续积累和优化：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/zg90056.png)

这就是桉树**经验积累**能力在起号场景的延伸——AI越用越懂流量。

## 系统设计

### 任务调度设计

在vistask-ai中，起号任务和普通的开发任务共存在同一个调度平台中：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/qq1190137.png)

起号任务和开发任务共享同一套调度逻辑，只是任务类型和工作流不同。

### 执行引擎设计

Task Processor不需要任何修改，它只负责轮询和调用Eucalyptus。起号任务和开发任务的区别只在Eucalyptus内部的工作流路由上：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/yt511185011.png)

### MCP工具层设计

各平台的MCP工具需要暴露以下核心能力：

![](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2026-05-11/xzx184714.png)

## 总结

全自动起号系统，本质上是Eucalyptus数字分身在**内容创作领域**的一个垂直应用。

它复用了桉树的三大核心能力：

| 能力 | 在起号场景中的体现 |
|------|-------------------|
| **7x24不间断** | 每天自动选题、创作、发布，全天候运营 |
| **一人多角** | 一个AI同时运营多个平台、多个账号 |
| **知识积累** | 风格知识库持续进化，越用越懂流量 |

核心差异只在于新增了**起号专用的工作流和Agent**，以及接入了各平台的MCP工具。

说到底，起号这件事和写代码本质上是一样的——都是**流水线式的重复劳动**。既然代码能让AI写，内容为什么不能让AI产？

而且比起写代码，内容创作的标准化程度更高。爆款标题有模板、正文有结构、图片有规范、发布有节奏。这些都是AI最擅长的事情。

当桉树从"帮我写代码"延伸到"帮我起号"，数字分身的价值就不再局限于技术领域了。

**它是一个通用的生产力放大器**——只要你定义好流水线，它就能帮你执行。

这才是Eucalyptus这个名字真正的含义：快速生长、适应一切。
