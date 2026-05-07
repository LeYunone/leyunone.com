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
                "spring/spring-boot-error",
                "spring/spring-cloud-init",
                "spring/spring-cloud-read",
                "spring/springboot-18n-error",
                "mybatis/mybatis-interceptor",
                "mybatis/mybatis-plus-bug",
                "search/es-start",
                "search/lucene-introduce",
                "dubbo/dubbo-read",
                "dubbo/dubbo-CustomServiceDisocvery",
                "nacos/nacos-read",
                "messagequeuing/MQTT-about",
                "messagequeuing/MQTT-use",
                "messagequeuing/rabbitmq-delay",
                "netty/netty-oom-1",
                "skywalking/skywalking-fast-init",
                "skywalking/skywalking-reading1",
                "skywalking/skywalking-reading2",
            ],
        },
        {
            text: "赛博炼丹录",
            icon: "android",
            collapsible: true,
            children: [
                "unidentified-business/agent-what-is-it",
                "unidentified-business/no-build-more-agent",
                "unidentified-business/Claude-Code-nonorm",
                "unidentified-business/context-engineer",
                "unidentified-business/Ai-token",
                "Interesting-design/spring-ai-agent-design",
                "Interesting-design/auto-account-builder",
                "normal-notes/ai-mcp",
                "normal-notes/llm-context",
                "normal-notes/AI-coding-fact",
                "normal-notes/prompt-engineering",
                "normal-notes/copilot-thing",
                "normal-notes/maxkb",
                "normal-notes/JAVA-ChatGPT",
            ],
        },
        {
            text: "脑洞开发室",
            icon: "xitongsheji",
            collapsible: true,
            children: [
                "Interesting-design/low-cost-ekl",
                "Interesting-design/value-assemble",
                "Interesting-design/es-auto-spring",
                "Interesting-design/cas-lock",
                "Interesting-design/unique-set",
                "Interesting-design/upload-file",
                "Interesting-design/cache-collect",
                "Interesting-design/vue-simple-upload",
                "Interesting-design/Zookeeper-lock",
                "Interesting-design/function-programming",
                "Interesting-design/db-sync-model",
                "Interesting-design/strategy-factory-together",
                "Interesting-design/condition-command",
                "Interesting-design/templated-application",
                "Interesting-design/mailpush-service",
                "Interesting-design/spi-oss",
                "Interesting-design/export-dev-1",
                "Interesting-design/operation-log",
                "Interesting-design/easyExcel-custom",
                "Interesting-design/message-collectos",
            ],
        },
        {
            text: "业务副本攻略",
            icon: "medical-symbol",
            collapsible: true,
            children: [
                "business-design/asyn-system-design",
                "business-design/asynchronous-message-de",
                "business-design/barrage-system",
                "business-design/data-acquisition-design",
                "business-design/disk-oss",
                "business-design/game-chat",
                "business-design/thumbs-up",
                "unidentified-business/Wechat-Moments",
                "unidentified-business/auto-scenes",
                "unidentified-business/payment",
                "unidentified-business/service-platform",
                "unidentified-business/message-center-design",
                "unidentified-business/summertime",
                "unidentified-business/database-conflict",
            ],
        },
        {
            text: "万物互联副本",
            icon: "cloud",
            collapsible: true,
            children: [
                "unidentified-business/iot-cloud-cloud",
                "unidentified-business/iot-difficulties",
                "unidentified-business/device-center-project",
                "unidentified-business/smart-home-project",
                "unidentified-business/long-Connection",
                "normal-notes/voice-protocol",
                "normal-notes/yingshi-dev",
            ],
        },
        {
            text: "架构内功心法",
            icon: "professional",
            collapsible: true,
            children: [
                "unidentified-business/single-architecture",
                "unidentified-business/project-protect",
                "unidentified-business/manytps-scene",
                "unidentified-business/thread-transactional",
                "unidentified-business/bit-write",
                "unidentified-business/cloud",
                "unidentified-business/system-mill-resole",
            ],
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
                    text: "Jenkins",
                    icon: "jenkins",
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
                {
                    text: "数据库篇",
                    collapsible: true,
                    children: [
                        "Canal",
                        "mysql-exception",
                        "deep-page",
                        "mysql-sync-delayed",
                        "db-eight-part-essay",
                        "redis-eight-part-essay",
                    ]
                },
                {
                    text: "Java进阶篇",
                    collapsible: true,
                    children: [
                        "java-eight-part-essay",
                        "java-swing",
                        "reflex-use-case",
                        "thread-eight-part-essay",
                        "actor",
                        "rpc-reload",
                    ]
                },
                {
                    text: "Web&协议篇",
                    collapsible: true,
                    children: [
                        "io",
                        "httpServletResponse",
                        "oauth2.0",
                        "web-cache",
                        "mq-select",
                        "fastJson-warn",
                    ]
                },
                {
                    text: "工具&排障篇",
                    collapsible: true,
                    children: [
                        "sonarqube",
                        "sonarqube-scan",
                        "sonarqube-dev",
                        "cicd-full-pipeline",
                        "linux-disk-over",
                        "nginx-error",
                        "acme-sh",
                        "xxl-job-code",
                        "xxl-job-error",
                        "upload-1",
                    ]
                },
                {
                    text: "框架笔记篇",
                    collapsible: true,
                    children: [
                        "mybatis-plus",
                        "easyexcel-handle",
                        "springboot-json-web",
                        "google-api-http-code",
                    ]
                },
            ]
        },
        {
            text: "开发日记",
            icon: "heiqiushou",
            collapsible: true,
            prefix: "development-diary/",
            children: [
                {
                    text: "VisTask-AI,AI任务平台,",
                    prefix: "VisTask-AI/",
                    collapsible: true,
                    icon: "yongqihuizhang-taiyi",
                    children: [
                        "eucalyptus-diary-1",
                        "eucalyptus-diary-2",
                        "eucalyptus-plan",
                        "eucalyptus-summary",
                        "eucalyptus-value",
                    ]
                },
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
            text: "多余总结",
            icon: "professional",
            prefix: "summary/",
            collapsible: true,
            children: [
                "about-this-web",
                "beian",
                "code-review-what",
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
