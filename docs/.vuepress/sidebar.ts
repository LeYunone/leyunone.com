import {sidebar} from "vuepress-theme-hope";
import {aboutTheAuthor} from "./sidebar/about-the-author";
import { webabout } from "./sidebar/webabout";

export const sidebarConfig = sidebar({
    // 应该把更精确的路径放置在前边
    "/leyunone/": ["intro"],
    '/webabout/':webabout,
    // 必须放在最后面
    "/": [
        {
            text: "框架全家桶",
            icon: "xueqiushou",
            collapsible: true,
            prefix: "frame/",
            children: [
                {
                    text: "Spring&",
                    prefix: "spring/",
                    icon: "bxl-spring-boot",
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
                    icon: "shujuku",
                    children: [
                        "mybatis-interceptor"
                    ]
                },
                {
                    text: "搜索引擎&",
                    prefix: "search/",
                    collapsible: true,
                    icon: "sousuo",
                    children: [
                        "lucene-introduce"
                    ]
                },
                {
                    text: "Dubbo",
                    prefix: "dubbo/",
                    icon: "electric-car",
                    collapsible: true,
                    children: [
                        "dubbo-read"
                    ]
                },
                {
                    text: "Nacos",
                    prefix: "nacos/",
                    icon: "fusion",
                    collapsible: true,
                    children: [
                        "nacos-read"
                    ]
                }
            ],
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
                "function-programming"
            ]
        },
        {
            text: "GitHub工具鉴赏",
            icon: "heart",
            prefix: "github-project/",
            collapsible: true,
            children: [
                "AlibabaEasyExcel",
                "Diboot"
            ]
        },
        {
            text:"JAVA!!!",
            icon:"java",
            prefix:"java/",
            collapsible: true,
            children:[
                "java8-arrayssort",
                "java-agent-1"
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
                    icon: "github",
                    prefix: "git/",
                    collapsible: true,
                    children: [
                        "git-error"
                    ]
                },
                {
                    text: "IDEA",
                    icon: "intellijidea",
                    prefix: "idea/",
                    collapsible: true,
                    children: [
                        "idea-easycode"
                    ]
                }
            ]
        },
        {
            text: "啥啥啥的业务",
            icon: "badashou",
            prefix: "unidentified-business/",
            collapsible: true,
            children: [
                "database-conflict",
                "payment",
                "service-platform"
            ],
        },
        {
            text: "正经笔记",
            icon: "oven",
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
            icon: "bigaoshou",
            prefix: "rambling-diary/",
            collapsible: true,
            children: [
                "FUCKN3ANDrestructure",
                "What-Happened-MYWORK"
            ]
        },
        {
            text: "开发日记",
            icon: "heiqiushou",
            collapsible: true,
            prefix: "development-diary/",
            children: [
                {
                    text: "本地方法测试工具",
                    prefix: "wayLocation/",
                    icon: "yongqihuizhang-taiyi",
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
                    icon: "yongqihuizhang-taiyi",
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
                    icon: "yongqihuizhang-taiyi",
                    children: [
                        "disk-dev-1",
                        "disk-dev-2"
                    ]
                },
                {
                    text: "这个网站",
                    prefix: "web/",
                    icon: "yongqihuizhang-taiyi",
                    collapsible: true,
                    children: [
                        "web-dev-1"
                    ]
                }
            ],
        },
        {
            text: "刷题日记",
            prefix: "exercises/",
            icon: "trash",
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
            text: "算法",
            icon: "compass",
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
            text:"某些总结",
            icon:"professional",
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
