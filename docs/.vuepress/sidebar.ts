import {sidebar} from "vuepress-theme-hope";
import {writeabout} from "./sidebar/writeabout";
import {talkabout} from "./sidebar/talkabout";

export const sidebarConfig = sidebar({
    // 应该把更精确的路径放置在前边
    "/leyunone/": ["intro"],
    '/talkabout/': talkabout,
    '/writeabout/': writeabout,
    // 必须放在最后面
    "/": [
        {
            text: "道具全家桶",
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
                        "spring-cloud-read",
                        "springboot-18n-error"
                    ]
                },
                {
                    text: "mybatis&",
                    prefix: "mybatis/",
                    collapsible: true,
                    icon: "shujuku",
                    children: [
                        "mybatis-interceptor",
                        "mybatis-plus-bug"
                    ]
                },
                {
                    text: "搜索引擎&",
                    prefix: "search/",
                    collapsible: true,
                    icon: "sousuo",
                    children: [
                        "es-start",
                        "lucene-introduce"
                    ]
                },
                {
                    text: "Dubbo&",
                    prefix: "dubbo/",
                    icon: "dubbo",
                    collapsible: true,
                    children: [
                        "dubbo-read",
                        "dubbo-CustomServiceDisocvery"
                    ]
                },
                {
                    text: "Nacos&",
                    prefix: "nacos/",
                    icon: "nacos",
                    collapsible: true,
                    children: [
                        "nacos-read"
                    ]
                },
                {
                    text:"消息队列&",
                    prefix:"messagequeuing/",
                    icon:"tap-plumbing",
                    collapsible: true,
                    children: [
                        "MQTT-about",
                        "MQTT-use",
                        "rabbitmq-delay"
                    ]
                },
                {
                    text:"Netty&",
                    prefix:"netty/",
                    icon:"fusion",
                    collapsible: true,
                    children: [
                        "netty-oom-1",
                    ]
                },
                {
                    text:"Skywalking&",
                    prefix:"skywalking/",
                    icon:"SkyWalking",
                    collapsible: true,
                    children: [
                        "skywalking-fast-init",
                        "skywalking-reading1",
                        "skywalking-reading2"
                    ]
                }
            ],
        },
        {
            text:"业务场景设计篇",
            icon: "medical-symbol",
            prefix: "business-design/",
            collapsible: true,
            children: [
                "asyn-system-design",
                "thumbs-up",
                "barrage-system",
                "data-acquisition-design",
                "game-chat",
                "disk-oss",
            ]
        },
        {
            text: "有趣的功能开发",
            icon: "xitongsheji",
            prefix: "Interesting-design/",
            collapsible: true,
            children: [
                "low-cost-ekl",
                "value-assemble",
                "es-auto-spring",
                "cas-lock",
                "unique-set",
                "upload-file",
                "cache-collect",
                "vue-simple-upload",
                "Zookeeper-lock",
                "function-programming",
                "db-sync-model",
                "strategy-factory-together",
                "condition-command",
                "templated-application",
                "mailpush-service",
                "spi-oss",
                "export-dev-1",
                "operation-log",
                "easyExcel-custom"
            ]
        },
        {
            text: "GitHub工具鉴赏",
            icon: "heart",
            prefix: "github-project/",
            collapsible: true,
            children: [
                "AlibabaEasyExcel",
                "Diboot",
                "XXL-Job",
                "GitLab-codex",
                "voice-cloud-cloud",
                "voice-cloud-cloud-config",
                "dbshop",
                "sa-token"
            ]
        },
        {
            text: "JAVA!!!",
            icon: "java",
            prefix: "java/",
            collapsible: true,
            children: [
                "thread-local",
                "easy-rule",
                "java-virtual-thread",
                "JDK-version",
                "java-unsafe",
                "java8-arrayssort",
                "java-agent-1",
                "buddy-1",
                "jdk-compile-runcode",
                "java-release",
                "DatabaseMetaData",
                "Java-agent-2",
                "test-unit-mockfactory",
                "thread-wait",
                "lambda-serialize",
                "about-code-explanatory",
                "custom-annotation",
                "java-spi",
                "string-hashcode",
                "list-iteration"
            ]
        },
        {
            text: "杂项思考碎碎恋",
            icon: "badashou",
            prefix: "unidentified-business/",
            collapsible: true,
            children: [
                "single-architecture",
                "Wechat-Moments",
                "project-protect",
                'manytps-scene',
                "thread-transactional",
                "iot-cloud-cloud",
                "device-center-project",
                "smart-home-project",
                "bit-write",
                "cloud",
                "database-conflict",
                "payment",
                "service-platform",
                "auto-scenes",
                "message-center-design",
                "summertime",
                "iot-difficulties",
                "system-mill-resole",
                "long-Connection"
            ],
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
                        "git-protect-rejected",
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
                },
                {
                    text:"Jenkins",
                    icon:"jenkins",
                    prefix: "jenkins/",
                    collapsible: true,
                    children: [
                        "jenkins-init",
                        "jenkins-error"
                    ]
                }
            ]
        },
        {
            text: "正经笔记",
            icon: "oven",
            prefix: "normal-notes/",
            collapsible: true,
            children: [
                "acme-sh",
                "google-api-http-code",
                "ai-mcp",
                "sonarqube",
                "xxl-job-code",
                "actor",
                "rpc-reload",
                "mysql-exception",
                "voice-protocol",
                "easyexcel-handle",
                "springboot-json-web",
                "mq-select",
                "oauth2.0",
                "linux-disk-over",
                "deep-page",
                "mysql-sync-delayed",
                "xxl-job-error",
                "web-cache",
                "2022-04-19-eeg",
                "JAVA-ChatGPT",
                "io",
                "fastJson-warn",
                "db-eight-part-essay",
                "httpServletResponse",
                "java-eight-part-essay",
                "redis-eight-part-essay",
                "reflex-use-case",
                "thread-eight-part-essay",
                "nginx-error",
                "yingshi-dev",
                "java-swing",
                "upload-1",
                "test"
            ]
        },
        {
            text: "开发日记",
            icon: "heiqiushou",
            collapsible: true,
            prefix: "development-diary/",
            children: [
                {
                    text: "全平台云云接入",
                    prefix: "cloud-cloud/",
                    collapsible: true,
                    icon: "yongqihuizhang-taiyi",
                    children: [
                        "cloud-cloud-1"
                    ]
                },
                {
                    text: "God-Search",
                    prefix: "god-search/",
                    collapsible: true,
                    icon: "yongqihuizhang-taiyi",
                    children: [
                        "god-search"
                    ]
                },
                {
                    text: "leyunone-open-api",
                    prefix: "openapi/",
                    collapsible: true,
                    icon: "yongqihuizhang-taiyi",
                    children: [
                        "baiduemploy-api"
                    ]
                },
                {
                    text: "DBShop",
                    prefix: "dbshop/",
                    collapsible: true,
                    icon: "yongqihuizhang-taiyi",
                    children: [
                        "dbshop-1",
                        "dbshop-2",
                        "dbshop-3"
                    ]
                },
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
                        "disk-dev-2",
                        "disk-dev-3"
                    ]
                },
                {
                    text: "这个网站",
                    prefix: "web/",
                    icon: "yongqihuizhang-taiyi",
                    collapsible: true,
                    children: [
                        "web-dev-1",
                        "web-dev-2"
                    ]
                }
            ],
        },
        {
            text: "多于总结",
            icon: "professional",
            prefix: "summary/",
            collapsible: true,
            children: [
                "about-this-web",
                "beian",
                "interview-question",
                "db-comapre",
                "Warn！Warn！"
            ]
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
                "abouot-algorithm1",
                "backtracking-algorithm",
                "dichotomy",
                "dynamic-programming",
                "sorting-algorithm"
            ]
        }
    ]
});
