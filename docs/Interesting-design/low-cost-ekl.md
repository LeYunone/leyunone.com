---
date: 2025-02-26
title: 低成本ELK日志分析思路
category: 设计
tag:
  - 设计
head:
  - - meta
    - name: keywords
      content: 日志，ELK,乐云一
  - - meta
    - name: description
      content: 低成本ELK日志分析思路
---
# 低成本ELK日志分析思路

近来手上有一个服务器上的项目，因为苦于无法接上已搭建好的`skywalking` （网络不通） ，异常排查起来很累。

想在本服务器中搭建ELK体系又显得臃肿，并且`Elasticsearch` +`Logstash`+ `Kibana` 也需要占具服务器不小性能，要拉高服务器配置呢又要走着走那的流程，麻烦的一....

综合考虑，全方面否决了使用线上环境ELK体系的思路，如此只有项目日志的我应该如何最低成本的实现一个ELK呢？

请看这章：借尸还魂

## 借尸还魂

在测试环境中，由于需要有提前搭建`Elasticsearch` 和 `Kibana` ，那么如果我再加上`Logstash` ，使他指向线上的服务器的日志不就可以完成借尸还魂的思路了？为了达到这个目的我必须实现如下几步：

- 将线上环境的日志同步到测试服务器上
- 通过`Logstash`将日志信息解析到`Elasticsearch`里

然后还需要切合一个开发人员的需要尽可能方便自己查看获取日志，所以还要：

- 自动创建项目的索引
- 将索引搜索链接通过企业微信机器人发布到群里

再仔细思考一下，为了不出现测试环境影响线上环境这一壮举的事情出现，还需要减小日志同步的影响范围，因此还要加上：

- 日志仅增量同步
- 可选择查看哪个项目日志时才进行同步

综合上述所有的诉求（同事们的）和实现考量，于是一个低成本的ELK日志分析思路经过如下设计得以实现。

## 准备工作

一个测试服务器，并部署好任意版本的`Elasticsearch` +`Logstash`+ `Kibana` + `Nginx`

目标服务器，拥有查看项目日志文件夹权限的账号

## 运行流程

因为需要可选择查看哪个项目日志，那么我们必须实现主动触发脚本的链路。

我选择的是http请求，转发Nginx，Nginx将请求参数转发给shell脚本的方式，所以运行流程为：

1. 我们在某个页面上请求http请求
2. nginx捕捉并将其转发给shell脚本
3. shell脚本运行： 
   1. 增量同步获取线上环境日志
   2. `Logstash`将日志信息解析到`Elasticsearch`
   3. 自动创建kibana视图索引
   4. 企业微信发布该索引视图的URL

### nginx

因此Nginx的配置如下：

```nginx
http {
    
    server {
    listen 80;
    server_name 127.0.0.1;
    	location /log {
        set $dir $arg_dir;
        set $type $arg_type;
        root /tmp;
        fastcgi_pass unix:/var/run/fcgiwrap.socket;
        fastcgi_index bot.sh;
        fastcgi_param SCRIPT_FILENAME /opt/logshell/bot.sh;
        fastcgi_param DIR $dir;
        fastcgi_param TYPE $type;
        include fastcgi_params;
    }
}
```

nginx使用了`fcgiwrap` 建立与`bot.sh`脚本的通讯，`fcgiwrap` 是一个用于运行 CGI 脚本的 FastCGI 包装器，需要安装并启动它：

```bash
sudo yum install -y fcgiwrap
sudo systemctl start fcgiwrap
sudo systemctl enable fcgiwrap
```

### 脚本bot.sh

脚本如下（直接食用）文件名`bot.sh`

```bash
#!/bin/bash

LOG_FILE="/opt/logshell/log.log"

# 第一步：同步日志文件的函数
sync_logs() {
    local dir="$1"
    local type="$2"

    # 根据type参数动态设置远程主机、用户和密码
    REMOTE_USER="root";
    PASSWORD="root";
    case $type in
        "1")
	    REMOTE_HOST="127.0.0.1"
        "*")
            REMOTE_HOST="127.0.0.1"
            ;;
    esac

    REMOTE_LOG_DIR="/logs/$dir"  # 正式环境日志目录，根据dir参数动态设置
    LOCAL_LOG_DIR="/opt/prod/developer/app/logs/$dir"  # 测试环境存储目录

    echo "尝试创建目录: $LOCAL_LOG_DIR" >> "$LOG_FILE"
    mkdir -p "$LOCAL_LOG_DIR"
    if [ -d "$LOCAL_LOG_DIR" ]; then
        echo "目录创建成功: $LOCAL_LOG_DIR" >> "$LOG_FILE"
    else
        echo "目录创建失败: $LOCAL_LOG_DIR" >> "$LOG_FILE"
        return 1
    fi

    # 使用rsync增量同步（避免重复拉取）
    sshpass -p "$PASSWORD" rsync -avz --partial --progress  --include='*.log' --exclude='*' --rsh="ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no -o StrictHostKeyChecking=no" $REMOTE_USER@$REMOTE_HOST:$REMOTE_LOG_DIR/ $LOCAL_LOG_DIR/


    # 清理历史日志（按需启用）
    find $LOCAL_LOG_DIR -type f -mtime +7 -delete
}


# 第二步：创建 Kibana 索引模式的函数
create_kibana_index_pattern() {
    local dir="$1"
    # Elasticsearch 和 Kibana 的地址
    ES_HOST="http://localhost:9200"
    KIBANA_HOST="http://192.168.151.232:5601"

    # 获取当前日期，格式为 YYYY.MM.dd
    local current_date=$(date +%Y.%m.%d)
    # 定义索引名称，替换日期模式
    local INDEX_NAME="prod-logs-$dir-$current_date"

    # 检查索引模式是否已存在
    local CHECK_URL="$KIBANA_HOST/api/saved_objects/_find?type=index-pattern&search_fields=title&search=prod-logs"
    local CHECK_RESPONSE=$(curl -s -X GET "$CHECK_URL" -H "Content-Type: application/json" -H "kbn-xsrf: true")
    local INDEX_NAMES=$(echo "$CHECK_RESPONSE" | jq -r '.saved_objects[].attributes.title')
    local INDEX_EXISTS=false

    while read -r name; do
        if [ "$name" = "$INDEX_NAME" ]; then
            INDEX_EXISTS=true
            break
        fi
    done <<< "$INDEX_NAMES"

    if $INDEX_EXISTS; then
        echo "索引模式 $INDEX_NAME 已存在，跳过创建。" >> "$LOG_FILE"
        local INDEX_PATTERN_ID=$(echo "$CHECK_RESPONSE" | jq -r ".saved_objects[] | select(.attributes.title == \"$INDEX_NAME\") | .id")
        echo "$INDEX_PATTERN_ID"
        return
    fi

    # 构建 Kibana 索引模式的 JSON 数据
    local REQUEST_BODY='{"attributes": {"title": "'"$INDEX_NAME"'", "timeFieldName": "@timestamp"}}'

    echo "尝试创建 Kibana 索引模式，索引名: $INDEX_NAME" >> "$LOG_FILE"
    
    local RESPONSE=$(curl -X POST "$KIBANA_HOST/api/saved_objects/index-pattern" -H "Content-Type: application/json" -H "kbn-xsrf: true" -d "$REQUEST_BODY")
    if echo "$RESPONSE" | grep -q '"statusCode":400'; then
        echo "创建 Kibana 索引模式失败: $INDEX_NAME, 响应: $RESPONSE" >> "$LOG_FILE"
        return 1
    else
        echo "成功创建 Kibana 索引模式: $INDEX_NAME" >> "$LOG_FILE"
        # 提取索引模式 ID
	RESPONSE=$(echo "$RESPONSE" | tr -d '\n' | tr -d ' ')
        echo "Response: $RESPONSE" >> "$LOG_FILE" 
        local INDEX_PATTERN_ID=$(echo "$RESPONSE" | jq -r '.id')
        echo "$INDEX_PATTERN_ID" 
    fi 

}

# 第三步：发送 Kibana 索引视图查询页面链接到企业微信群
send_kibana_link_to_wechat() {
    local dir="$1"
    local index_pattern_id="$2"
    # Kibana 地址
    KIBANA_HOST="http://192.168.151.232:5601"
    # 构造 Kibana 索引视图查询页面链接，这里需要根据实际 Kibana 页面规则调整
    KIBANA_LINK="$KIBANA_HOST/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(),filters:!(),index:'$index_pattern_id',interval:auto,query:(language:kuery,query:''),sort:!())"
    # 企业微信机器人 Webhook 地址，需要替换为实际的地址
    WECHAT_ROBOT_WEBHOOK="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=XXXXXXXXXXXXXXX"

    # 构建企业微信消息 JSON 数据
    JSON_DATA=$(cat <<EOF
{
    "msgtype": "markdown",
    "markdown": {
        "content": "($dir) 日志查询页面链接：[点击查看]($KIBANA_LINK)"
    }
}
EOF
)

    echo "尝试发送 Kibana 链接到企业微信群，链接: $KIBANA_LINK" >> "$LOG_FILE"
    # 发送消息到企业微信群
    RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" "$WECHAT_ROBOT_WEBHOOK" -d "$JSON_DATA")

    # 检查是否发送成功
    if echo "$RESPONSE" | grep -q '"errcode":0'; then
        echo "成功发送 Kibana 链接到企业微信群" >> "$LOG_FILE"
    else
        echo "发送 Kibana 链接到企业微信群失败，响应: $RESPONSE" >> "$LOG_FILE"
    fi
}

# 主函数
main() {
    local dir="$1"
    local type="$2"

   echo "开始脚本: $dir , $type"  >> "$LOG_FILE"

    # 第一步：同步日志
    if ! sync_logs "$dir" "$type"; then
        echo "日志同步失败，终止后续操作" >> "$LOG_FILE"
        return 1
    fi

    # 第二步：创建 Kibana 索引模式
    INDEX_PATTERN_ID=$(create_kibana_index_pattern "$dir")
    if [ -z "$INDEX_PATTERN_ID" ]; then
        echo "获取索引模式 ID 失败，终止后续操作" >> "$LOG_FILE"
        return 1
    fi
   #./index-create.sh 

    # 第三步：发送 Kibana 索引视图查询页面链接到企业微信群
    send_kibana_link_to_wechat "$dir" "$INDEX_PATTERN_ID"
}

# 调用主函数
main "$DIR" "$TYPE"
sshpass rsync -avz
```

安装`sudo yum install sshpass`

`-avz` 中`z`指将日志进行压缩后再传输，减少线上服务器流量消耗

### Logstash与日志

**logstash**

```bash
input {
  file {
	# 测试服务器放线上服务器日志的地方
    path => "/opt/prod/developer/app/logs/**/*.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
    codec => multiline {
      pattern => "^%{TIMESTAMP_ISO8601}"
      negate => true
      what => "previous"
    }
  }
}
filter {
  grok {
	# 自由发挥
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} \[%{DATA:thread}\] %{LOGLEVEL:level} %{JAVACLASS:logger} - %{GREEDYDATA:log_message}" }
  }
  date {
   # 自由发挥
    match => [ "timestamp", "yyyy-MM-dd HH:mm:ss:SSS" ]
    target => "@timestamp"
  }
  ruby {
    code => '
      path = event.get("path")
      if path
        path_array = path.split("/")
        log_index = path_array.index("logs")
        if log_index && log_index < path_array.length - 1
          event.set("dir_name", path_array[log_index + 1])
        end
      end
    '
  }
}

output {
  elasticsearch {
    hosts => ["http://127.0.0.1:9200"]
    # 使用提取的目录名生成索引名
    index => "prod-logs-%{dir_name}-%{+YYYY.MM.dd}"
  }
}
```

log4j的日志配置和Logstash的解析则各取所好，一般的配置是一个链路id`traceId`和线程id作为抬头标识搜索

## 后言

为什么叫低成本，因为从成本上来看除了用shh获取线上服务器的日志那点流量外，没有消耗线上服务器的一点资源；

不过日志的同步时效性当然基本没有，但是也因为是主动触发这一特性，这样搭建出来的日志体系本身就只是服务于当天问题当天解决的异常（当天bug当天修）

所以大伙可以根据需要看看自己的项目是否也可以像这样借尸还魂般实现线上项目的ELK日志分析