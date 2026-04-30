---
date: 2026-04-23
title: 从0搭建CI/CD全链路——Jenkins到GitLab的血泪史
category:
  - 开发工具
tag:
  - 开发工具
  - CI/CD
  - Jenkins
  - GitLab
head:
  - - meta
    - name: keywords
      content: CI/CD,Jenkins,GitLab,自动化部署,持续集成,乐云一
  - - meta
    - name: description
      content: 从代码提交到自动部署的完整CI/CD链路搭建——踩过的坑、走过的弯路、最终的方案。
---

# 从0搭建CI/CD全链路——Jenkins到GitLab的血泪史

## 序

CI/CD这个东西，说简单也简单——不就是代码提交了自动构建、自动部署嘛。

说难也真难——当你在凌晨三点被叫起来排查"为什么自动部署了但页面没更新"的时候，你就会明白这玩意远没有看起来那么简单。

我搭CI/CD的过程，大概经历了三个阶段：

1. **啥也不会**：手动打包 → 手动上传 → 手动重启
2. **会了一点**：Jenkins自动打包 → 手动部署
3. **终于通了**：代码提交 → 自动构建 → 自动测试 → 自动部署

每个阶段都踩了一堆坑。本篇就把这些坑全写出来，权当给后来人铺路。

## 先搞清楚：CI/CD到底在干什么

很多人把CI和CD混在一起说，但它们其实是两件事：

```
CI（Continuous Integration，持续集成）:
  代码提交 → 自动构建 → 自动测试 → 反馈结果
  核心目的: 尽早发现问题

CD（Continuous Deployment/Delivery，持续部署/交付）:
  构建通过 → 自动部署到目标环境
  核心目的: 减少人工操作
```

完整的链路长这样：

```
开发者 → git push → Git仓库
                         │
                         ▼
                    CI 触发
                         │
                    ┌────┴────┐
                    │ 拉取代码  │
                    │ 安装依赖  │
                    │ 编译构建  │
                    │ 运行测试  │
                    └────┬────┘
                         │
                    ┌────┴────┐
                    │ 构建产物  │
                    │ Docker镜像│
                    │ /Jar包   │
                    └────┬────┘
                         │
                    CD 触发
                         │
                    ┌────┴────┐
                    │ 传输产物  │
                    │ 停止旧服务 │
                    │ 启动新服务 │
                    │ 健康检查  │
                    └────┬────┘
                         │
                    部署完成
                    通知开发者
```

看起来挺清晰的。但实际搭的时候，每一个箭头后面都藏着坑。

## 阶段一：Jenkins——老牌选手的倔强

### 为什么选Jenkins

说实话，选Jenkins没什么特别的原因——**公司已经有了**。

大部分Java公司的情况都差不多：Jenkins是前辈装的，Pipeline是前辈写的，你接手的时候只需要知道"点这个按钮就能部署"就行了。

但当你需要**从零搭建一条新的Pipeline**的时候，Jenkins的体验就开始一言难尽了。

### Jenkins搭建

Jenkins本身的安装倒是挺简单的：

```
# Docker方式安装，最省事
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

安装完之后就是那个经典的初始化向导——输入初始密码、安装插件、创建管理员。

**关键插件一定要装：**

| 插件 | 作用 |
|------|------|
| Git Plugin | 拉取代码 |
| Maven Integration | Java项目构建 |
| Pipeline | 流水线编排 |
| Publish Over SSH | 远程部署 |
| Docker Pipeline | Docker集成 |

### Pipeline编写

Jenkins用Groovy语法写Pipeline。一个标准的Java后端项目Pipeline大概长这样：

```
pipeline {
    agent any

    tools {
        maven 'Maven 3.9'
        jdk 'JDK 21'
    }

    stages {
        stage('拉取代码') {
            steps {
                git branch: 'master',
                    url: 'git@172.20.6.21:group/project.git',
                    credentialsId: 'git-ssh-key'
            }
        }

        stage('编译构建') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('运行测试') {
            steps {
                sh 'mvn test'
            }
        }

        stage('部署到测试环境') {
            steps {
                sshPublisher {
                    publishConfig {
                        publishers {
                            sshPublisherDesc {
                                transfers {
                                    sshTransfer {
                                        sourceFiles: 'target/*.jar'
                                        remoteDirectory: '/opt/apps/project'
                                        execCommand: '''
                                            cd /opt/apps/project
                                            ./deploy.sh restart
                                        '''
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        success { /* 通知：部署成功 */ }
        failure { /* 通知：部署失败 */ }
    }
}
```

### Jenkins的坑

**坑一：Pipeline语法反人类**

Groovy的语法本身不难，但Jenkins的Pipeline DSL——特别是`sshPublisher`那一段——简直是天书。

我记得第一次写远程部署那一段，对着Jenkins官方文档研究了两个小时才写对。而且文档示例不全，很多配置项要靠百度才能找到。

**坑二：插件版本冲突**

Jenkins的插件生态很强大，但版本管理是个噩梦。装了A插件需要B插件的3.x版本，装了C插件又需要B插件的2.x版本。解冲突能折腾一整天。

**坑三：Jenkinsfile和分支管理的矛盾**

Jenkinsfile放在项目根目录的话，不同分支的部署配置怎么管理？开发分支部署到测试环境，主分支部署到生产环境，需要用`when`条件判断：

```
stage('部署到生产') {
    when {
        branch 'master'
    }
    steps {
        // 只有master分支才会执行这个阶段
    }
}
```

看起来很简单，但当你的项目有多环境（dev/test/staging/prod）、多分支（feature/hotfix/release）的时候，Pipeline会变得非常复杂。

**坑四：构建环境不一致**

"在我本地是好的"——这句话在CI/CD领域有一个更经典的版本："在Jenkins上是好的"。

本地用JDK 21，Jenkins上装的是JDK 17；本地Maven仓库有缓存，Jenkins每次从零下载依赖。环境不一致导致的问题，排查起来特别痛苦。

## 阶段二：GitLab CI——用着用着就真香了

### 为什么换到GitLab CI

换的原因只有一个：**Jenkins太重了**。

Jenkins是一个独立的服务，需要单独维护、单独配置、单独管理权限。而GitLab CI直接集成在Git仓库里——`.gitlab-ci.yml`文件放在项目根目录，提交代码就自动触发。

**不需要额外的服务，不需要额外的配置，不需要额外的权限管理。**

### GitLab CI搭建

GitLab CI的核心概念很简单：

```
stages:        # 定义阶段
  - build
  - test
  - deploy

jobs:          # 每个阶段的具体任务
  build-job:
    stage: build
    script: mvn clean package

  test-job:
    stage: test
    script: mvn test

  deploy-job:
    stage: deploy
    script: ./deploy.sh
```

一个`.gitlab-ci.yml`文件搞定所有事。

### Runner配置

GitLab CI需要一个Runner来执行任务。Runner可以装在任何机器上：

```
# 安装GitLab Runner
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-ci-multi-runner/script.rpm.sh | sudo bash
sudo yum install gitlab-ci-multi-runner

# 注册Runner
sudo gitlab-runner register
# 输入GitLab地址、Token、描述、标签、执行器
```

这里有个关键选择：**用什么执行器？**

| 执行器 | 适用场景 | 隔离性 |
|--------|---------|--------|
| shell | 简单项目 | 无（直接在宿主机执行） |
| docker | 标准项目 | 强（每次构建一个新容器） |
| kubernetes | 大规模项目 | 最强（每个Job一个Pod） |

推荐**docker执行器**——构建环境完全隔离，不会出现"在我本地是好的"的问题。

### 完整的.gitlab-ci.yml

以一个Spring Boot项目为例：

```
# 阶段定义
stages:
  - build
  - test
  - package
  - deploy

# 全局变量
variables:
  MAVEN_CLI_OPTS: "-s .m2/settings.xml --batch-mode"
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"

# 缓存Maven依赖，加速构建
cache:
  paths:
    - .m2/repository/

# 构建
build:
  stage: build
  image: maven:3.9-eclipse-temurin-21
  script:
    - mvn $MAVEN_CLI_OPTS compile
  only:
    - merge_requests
    - master
    - develop

# 测试
test:
  stage: test
  image: maven:3.9-eclipse-temurin-21
  script:
    - mvn $MAVEN_CLI_OPTS test
  only:
    - merge_requests
    - master
    - develop

# 打包
package:
  stage: package
  image: maven:3.9-eclipse-temurin-21
  script:
    - mvn $MAVEN_CLI_OPTS package -DskipTests
    - mv target/*.jar app.jar
  artifacts:
    paths:
      - app.jar
    expire_in: 1 day
  only:
    - master
    - develop

# 部署到测试环境
deploy-test:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
  script:
    - scp -o StrictHostKeyChecking=no app.jar user@test-server:/opt/apps/
    - ssh -o StrictHostKeyChecking=no user@test-server "cd /opt/apps && ./deploy.sh restart"
  only:
    - develop
  when: manual   # 手动触发

# 部署到生产环境
deploy-prod:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
  script:
    - scp -o StrictHostKeyChecking=no app.jar user@prod-server:/opt/apps/
    - ssh -o StrictHostKeyChecking=no user@prod-server "cd /opt/apps && ./deploy.sh restart"
  only:
    - master
  when: manual   # 生产环境必须手动触发
  environment:
    name: production
```

### GitLab CI的坑

**坑一：SSH密钥配置**

通过SSH部署到远程服务器，需要在GitLab的CI/CD变量中配置`SSH_PRIVATE_KEY`。但这个Key的格式很讲究——必须是PEM格式、不能有密码保护、不能有多余的换行符。

我第一次配的时候折腾了一个下午，最后发现是Key格式不对。解决方法是在GitLab的Settings → CI/CD → Variables中，把Key的类型设为"File"而不是"Variable"。

**坑二：Docker镜像的选择**

Maven构建需要JDK，但不同的基础镜像差异很大。`maven:3.9`默认用的是JDK 8，如果你的项目用的是JDK 21，必须指定`maven:3.9-eclipse-temurin-21`。

这个问题在Jenkins里也存在，但Docker执行器的好处是——换镜像就行了，不用折腾Jenkins的全局工具配置。

**坑三：构建缓存**

Maven每次构建都要下载依赖，如果仓库大的话非常慢。需要配置缓存：

```
cache:
  paths:
    - .m2/repository/
```

但缓存不是万能的。如果不同分支的依赖版本不同，缓存反而可能导致构建失败。所以需要在稳定性和速度之间做取舍。

## 部署脚本的设计

不管用Jenkins还是GitLab CI，最终部署到服务器上都需要一个部署脚本。这个脚本设计得好不好，直接影响部署的稳定性。

一个靠谱的`deploy.sh`：

```
#!/bin/bash
APP_NAME="project"
APP_JAR="app.jar"
APP_PORT=8080
LOG_FILE="/opt/apps/${APP_NAME}.log"

# 停止旧服务
function stop() {
    PID=$(ps -ef | grep ${APP_JAR} | grep -v grep | awk '{print $2}')
    if [ -n "$PID" ]; then
        echo "停止旧服务: PID=$PID"
        kill -15 $PID
        # 等待最多30秒
        for i in $(seq 1 30); do
            if ! ps -p $PID > /dev/null 2>&1; then
                echo "旧服务已停止"
                break
            fi
            sleep 1
        done
        # 如果还没停，强制杀
        if ps -p $PID > /dev/null 2>&1; then
            echo "强制停止"
            kill -9 $PID
        fi
    else
        echo "没有运行中的服务"
    fi
}

# 启动新服务
function start() {
    echo "启动新服务..."
    nohup java -jar ${APP_JAR} \
        --spring.profiles.active=prod \
        > ${LOG_FILE} 2>&1 &

    # 健康检查，最多等60秒
    for i in $(seq 1 60); do
        if curl -s http://localhost:${APP_PORT}/actuator/health > /dev/null; then
            echo "服务启动成功！"
            return 0
        fi
        sleep 1
    done
    echo "服务启动超时！"
    return 1
}

# 重启
case "$1" in
    start)   start ;;
    stop)    stop ;;
    restart) stop && start ;;
    *)       echo "Usage: $0 {start|stop|restart}" ;;
esac
```

这个脚本的几个设计要点：

1. **优雅停机**：先用`kill -15`发SIGTERM信号，等30秒；等不到再用`kill -9`强杀。直接强杀可能导致数据丢失。
2. **健康检查**：启动后轮询健康检查端点，确认服务真正可用。不是"进程启动了就算成功"。
3. **日志输出**：标准输出和错误输出都写到日志文件，出问题可以排查。

## 通知机制

部署完了得有人知道结果。不管是成功还是失败，都应该通知到相关负责人。

**邮件通知：** 最传统，但有时候会被忽略

**钉钉/飞书Webhook：** 实时性好，看消息的时候顺便就看到了

```
# GitLab CI中的钉钉通知
after_script:
  - |
    if [ $CI_JOB_STATUS == "success" ]; then
      STATUS="✅ 部署成功"
    else
      STATUS="❌ 部署失败"
    fi
    curl -s -X POST "https://oapi.dingtalk.com/robot/send?access_token=xxx" \
      -H 'Content-Type: application/json' \
      -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"${STATUS}\n项目: ${CI_PROJECT_NAME}\n分支: ${CI_COMMIT_BRANCH}\n提交: ${CI_COMMIT_MESSAGE}\"}}"
```

## 对比总结

用了一张对比表来收尾：

| 维度 | Jenkins | GitLab CI |
|------|---------|-----------|
| 安装 | 需要单独部署服务 | 集成在GitLab中 |
| 配置 | Jenkinsfile（Groovy） | .gitlab-ci.yml（YAML） |
| 学习曲线 | 陡（DSL语法 + 插件体系） | 平（YAML + Shell） |
| 插件生态 | 极其丰富 | 够用 |
| 权限管理 | 单独管理 | 跟随GitLab项目权限 |
| 构建环境 | 需要手动配置 | Docker隔离 |
| 维护成本 | 高（插件升级、环境维护） | 低（几乎零维护） |
| 适合场景 | 复杂的、多系统的CI/CD | 单一GitLab生态的项目 |

**我的建议：** 如果你们公司用GitLab管理代码，直接用GitLab CI，别折腾Jenkins了。省下来的时间多写两行代码不好吗。

## 最后

CI/CD这个东西，搭通一次之后就很爽——代码一推，自动构建，自动部署。

但**搭通之前是真的痛苦**。SSH密钥配不通、Docker镜像不对、构建缓存丢失、部署脚本不靠谱……每一个问题都能让你在半夜对着屏幕发呆。

不过话说回来，这种"基础设施"类的工作，痛一次就够了。搭好了之后，后面的每次代码提交都会感谢当时花时间搭链路的自己。

就像修路一样——修的时候满身泥，修好了之后所有人都走这条路。
