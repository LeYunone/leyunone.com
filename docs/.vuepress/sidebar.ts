import {sidebar} from "vuepress-theme-hope";
import {highQualityTechnicalArticles} from "./sidebar/high-quality-technical-articles";
import {aboutTheAuthor} from "./sidebar/about-the-author";
import {books} from "./sidebar/books";
import {openSourceProject} from "./sidebar/open-source-project";

export const sidebarConfig = sidebar({
    // 应该把更精确的路径放置在前边
    "/open-source-project/": openSourceProject,
    "/books/": books,
    "/about-the-author/": aboutTheAuthor,
    "/high-quality-technical-articles/": highQualityTechnicalArticles,
    "/javaguide/": ["intro", "history", "contribution-guideline", "faq", "todo"],
    "/zhuanlan/": [
        "java-mian-shi-zhi-bei",
        "handwritten-rpc-framework",
        "source-code-reading",
    ],
    // 必须放在最后面
    "/": [
        {
            text: "框架全家桶",
            icon: "interview",
            collapsible: true,
            prefix: "frame/",
            children: [
                {
                    text: "Spring&",
                    prefix: "spring/",
                    icon: "basic",
                    collapsible: true,
                    children: [
                        "spring-boot-error",
                        "spring-cloud-init",
                        "spring-cloud-read"
                    ]
                },
                {
                    text: "mybatis&",
                    prefix: "mybatis/",
                    collapsible: true,
                    icon: "basic",
                    children: [
                        "mybatis-interceptor"
                    ]
                },
                {
                    text: "搜索引擎&",
                    prefix: "search/",
                    collapsible: true,
                    icon: "basic",
                    children: [
                        "lucene-introduce"
                    ]
                },
                {
                    text: "Dubbo",
                    prefix: "dubbo/",
                    icon: "basic",
                    collapsible: true,
                    children: [
                        "dubbo-read"
                    ]
                },
                {
                    text: "Nacos",
                    prefix: "nacos/",
                    icon: "basic",
                    collapsible: true,
                    children: [
                        "nacos-read"
                    ]
                }
            ],
        },
        {
            text: "开发日记",
            icon: "interview",
            collapsible: true,
            prefix: "development-diary/",
            children: [
                {
                    text: "本地方法测试工具",
                    prefix: "wayLocation/",
                    icon: "basic",
                    collapsible: true,
                    children: [
                        "wayLocation-dev-1",
                        "wayLocation-dev-2",
                        "wayLocation-dev-3",
                        "wayLocation-dev-4",
                        "wayLocation-dev-5"
                    ]
                },
                {
                    text: "基于Swing的QQ&",
                    prefix: "swing-qq/",
                    collapsible: true,
                    icon: "basic",
                    children: [
                        "swing-qq-dev-1",
                        "swing-qq-dev-2",
                        "swing-qq-dev-3"
                    ]
                },
                {
                    text: "网盘",
                    prefix: "disk/",
                    collapsible: true,
                    icon: "basic",
                    children: [
                        "disk-dev-1",
                        "disk-dev-2"
                    ]
                },
                {
                    text: "这个网站",
                    prefix: "web/",
                    icon: "basic",
                    collapsible: true,
                    children: [
                        "web-dev-1"
                    ]
                }
            ],
        },
        {
            text: "啥啥啥的业务",
            icon: "tool",
            prefix: "unidentified-business/",
            collapsible: true,
            children: [
                "database-conflict",
                "payment",
                "service-platform"
            ],
        },
        {
            text: "刷题日记",
            prefix: "exercises/",
            icon: "framework",
            collapsible: true,
            children: [
                "LeetCode-2",
                "LeetCode-3",
                "LeetCode-5",
                "LeetCode-6",
                "LeetCode-11",
                "LeetCode-14",
                "LeetCode-15",
                "LeetCode-16",
                "LeetCode-17",
                "LeetCode-19",
                "LeetCode-20",
                "LeetCode-21",
                "LeetCode-26",
                "LeetCode-33",
                "LeetCode-36",
                "LeetCode-39",
                "LeetCode-40",
                "LeetCode-53",
                "LeetCode-55",
                "LeetCode-58",
                "LeetCode-62",
                "LeetCode-64",
                "LeetCode-66",
                "LeetCode-67",
                "LeetCode-69",
                "LeetCode-74",
                "LeetCode-79",
                "LeetCode-83",
                "LeetCode-100",
                "LeetCode-101",
                "LeetCode-104",
                "LeetCode-108",
                "LeetCode-111",
                "LeetCode-112",
                "LeetCode-117",
                "LeetCode-118",
                "LeetCode-121",
                "LeetCode-122",
                "LeetCode-125",
                "LeetCode-136",
                "LeetCode-141",
                "LeetCode-153",
                "LeetCode-160",
                "LeetCode-162",
                "LeetCode-167",
                "LeetCode-198",
                "LeetCode-200",
                "LeetCode-202",
                "LeetCode-219",
                "LeetCode-226",
                "LeetCode-228",
                "LeetCode-235",
                "LeetCode-283",
                "LeetCode-367",
                "LeetCode-647",
                "LeetCode-739",
                "LeetCode-740",
                "LeetCode-918",
                "LeetCode-986",
                "LeetCode-1019",
                "LeetCode-1091",
                "LeetCode-1218",
                "LeetCode-1567",
                "LeetCode-1685",
                "LeetCode-1936"
            ]
        },
        {
            text: "正经笔记",
            icon: "xitongsheji",
            prefix: "normal-notes/",
            collapsible: true,
            children: [
                "2022-04-19-eeg.md",
                "db-eight-part-essay.md",
                "httpServletResponse.md",
                "java-eight-part-essay.md",
                "lambda-serialize.md",
                "redis-eight-part-essay.md",
                "reflex-use-case.md",
                "thread-eight-part-essay.md"
            ]
        },
        {
            text: "杂谈日记",
            icon: "xitongsheji",
            prefix: "rambling-diary/",
            collapsible: true,
            children: [
                "FUCKN3ANDrestructure",
                "What-Happened-MYWORK"
            ]
        },
        {
            text: "开发工具",
            icon: "tool",
            prefix: "development-tool/",
            collapsible: true,
            children: [
                {
                    text: "Git",
                    icon: "xitongsheji",
                    prefix: "git/",
                    collapsible: true,
                    children: [
                        "git-error"
                    ]
                },
                {
                    text: "IDEA",
                    icon: "xitongsheji",
                    prefix: "idea/",
                    collapsible: true,
                    children: [
                        "idea-easycode"
                    ]
                }
            ]
        },
        {
            text: "更新日志",
            icon: "xitongsheji",
            prefix: "update-diary/",
            collapsible: true,
            children: [
                "1.0.0",
                "1.0.1",
                "1.0.2",
                "1.0.3"
            ]
        },
        {
            text: "GitHub工具鉴赏",
            icon: "xitongsheji",
            prefix: "github-project/",
            collapsible: true,
            children: [
                "AlibabaEasyExcel",
                "Diboot"
            ]
        },
        {
            text: "算法",
            icon: "xitongsheji",
            prefix: "algorithm/",
            collapsible: true,
            children: [
                "backtracking-algorithm",
                "dichotomy",
                "dynamic-programming",
                "sorting-algorithm"
            ]
        },
        {
            text: "有趣的业务设计",
            icon: "xitongsheji",
            prefix: "Interesting-design/",
            collapsible: true,
            children: [
                "cas-lock",
                "unique-set",
                "upload-file",
                "vue-simple-upload",
                "Zookeeper-lock",
            ]
        },
        {
            text:"JAVA!!!",
            icon:"xitongsheji",
            prefix:"java/",
            collapsible: true,
            children:[
                "java8-arrayssort",
                "java-agent-1"
            ]
        },
        {
            text:"某些总结",
            icon:"xitongsheji",
            prefix:"summary/",
            collapsible: true,
            children:[
                "about-this-web",
                "beian",
                "interview-question",
                "leyunone-action"
            ]
        }

    ]
});
