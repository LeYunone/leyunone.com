---
date: 2024-12-08
title: Elasticsearch快速部署和入门
category: 
  - 搜索
tag:
  - 搜索
head:
  - - meta
    - name: keywords
      content: Java,Elasticsearch,全文检索,搜索引擎
---

# Elasticsearch快速部署和入门

## 介绍

本文非常简单粗暴的将`Elasticsearch` 从0部署到Linux服务后到SpringBoot集成使用`Elasticsearch` ，适合回顾Elasticsearch和正在接入开发Elasticsearch的人员食用；

先一句话介绍带过`Elasticsearch`：

**他是一个集成了Lucene的搜索引擎，其核心功能就是将我们放进去的文档，通过将其设置的关键字分词后，以字典中目录的方式进行倒排序，可搜索我们保存的文档内容**  

此外，性能高效，分布式，社区活跃，生态完善等因素，使得`Elasticsearch` 是目前所有搜索引擎框架使用率最高的开源项目

## 安装与部署

可选择docker容器内部署，或系统应用部署

### docker部署

本文以7.12.1版本为例

#### 拉取

```sh
docker pull elasticsearch:7.12.1
```

#### 部署

需要执行两次部署脚本，第一次为拿到elasticsearch的默认文件信息，copy到本地文件中。第二次为将本地文件映射到容器内配置中。

**创建容器内私有网络集**

```sh
docker network create es
```

**第一次运行部署elasticsearch**

```sh
docker run -d \
  --name elasticsearch \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  -e "discovery.type=single-node" \
  --privileged \
  --network es \
  -p 9200:9200 \
  -p 9300:9300 \
  elasticsearch:7.12.1
```

**将当前运行的elasticsearch配置文件拉取至本地**

```sh
docker cp elasticsearch:/usr/share/elasticsearch/config {你本地存放elasticsearch文件的地方}
docker cp elasticsearch:/usr/share/elasticsearch/data {你本地存放elasticsearch文件的地方}
docker cp elasticsearch:/usr/share/elasticsearch/logs {你本地存放elasticsearch文件的地方}
docker cp elasticsearch:/usr/share/elasticsearch/plugins {你本地存放elasticsearch文件的地方}
```

**停掉当前运行elasticsearch**

```sh
docker stop elasticsearch
docker rm elasticsearch
```

**第二次运行部署elasticsearch**

```sh
docker run -d \
  --name elasticsearch \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  -e "discovery.type=single-node" \   
  -v {你本地存放elasticsearch文件的地方}/data:/usr/share/elasticsearch/data \
  -v {你本地存放elasticsearch文件的地方}/logs:/usr/share/elasticsearch/logs \
  -v {你本地存放elasticsearch文件的地方}/config:/usr/share/elasticsearch/config \
  -v {你本地存放elasticsearch文件的地方}/plugins:/usr/share/elasticsearch/plugins \
  --privileged \
  --network es \
  -p 9200:9200 \
  -p 9300:9300 \
  elasticsearch:7.12.1
```

#### 安装分词器插件

以IK分词器为例，建议离线安装

先下载分词器：**[https://release.infinilabs.com/analysis-ik/stable/elasticsearch-analysis-ik-7.12.1.zip](https://release.infinilabs.com/analysis-ik/stable/elasticsearch-analysis-ik-7.12.1.zip)**

在 [https://release.infinilabs.com/analysis-ik/stable/](https://release.infinilabs.com/analysis-ik/stable/) 中找到自己es版本的下载

将.zip文件放到服务器上，拷贝至docker容器内：

```sh
docker cp {文件路径} elasticsearch:/usr/share/elasticsearch
```

进入到es容器中：

```sh
docker exec -it 容器id /bin/sh
```

安装分词器：

```sh
./bin/elasticsearch-plugin install file:elasticsearch-analysis-ik-7.12.1.zip
```

### 宿主机部署

由于 `elasticsearch` 规定死了不能使用root账号启动，因此先创建一个新的账号或使用非root登录

```sh
sudo useradd es-user
su es-user
```

#### 配置

`elasticsearch`  和 **jdk** 是强依赖的关系，但是绝大多数的LInux系统中安装的JAVA环境都是Jre。

##### jdk

而`elasticsearch`  定位jdk环境的顺序为，见/bin/elasticsearch-env文件：

![image-20241210161139301](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-12-11/image-20241210161139301.png)

1. 环境变量 **ES_JAVA_HOME**
2. 环境变成 **JAVA_HOME**
3. es自带的jdk

此外，`elasticsearch`  从7.17版本之后就不在支持JDK8，仅支持JDK17之后的高版本jdk了，官网版本对应图：[https://www.elastic.co/cn/support/matrix#matrix_jvm](https://www.elastic.co/cn/support/matrix#matrix_jvm)

##### jvm

见/config/jvm.options文件

官方仅推荐一个修改jvm配置的方式，除非你明确知道自己在做什么；

所以我们转到config/jvm.options.d/目录下新建文件当作我们的配置，该目录下的文件加载顺序按文件名字典排序：a>b，后文件相同参数可覆盖前文件参数；

文件格式限制为：

```xml
#仅在jdk版本为8或超过8的时候起效
8-:-Xmx2g
#仅在jdk版本为8到9的时候起效
8-9:-Xmx2g
```

需要以 `版本号:` 进行标注

##### es配置

见/config/elasticsearch.yml文件

文件配置推荐看：[https://blog.csdn.net/gjwgjw1111/article/details/140156042](https://blog.csdn.net/gjwgjw1111/article/details/140156042)

一篇很清晰的好文

#### 启动

./bin/elasticsearch

启动过程中，首次部署基本都会出现大大小小的异常，可以根据提示自行在网上找到解决办法；

因为错误提示都太明显，且网络上有很多重复且有效的解决博客，这里不在赘述 ：），寻找解决问题的过程真的可以学习很多，非常建议大伙自行操作

### Kibana安装

kibana支持`Elasticsearch` 的文档数据可视化操作，部署也非常简单：

**拉取镜像**:

```sh
docker pull kibana:7.12.1
```

**启动**:

```sh
docker run -d \
	--name kibana \
	-e ELASTICSEARCH_HOSTS=http://{你部署es的服务器地址}:9200 \
	--network=es \
	-p 5601:5601 \
	kibana:7.12.1\
```

**使用**

打开 http://{ip}:5601

<img src="https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-12-11/image-20241210194641864.png" alt="image-20241210194641864" style="zoom:67%;" />

![image-20241210194656078](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-12-11/image-20241210194656078.png)

依次点击创建想要可视化操作的文档名

![image-20241211112011393](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-12-11/image-20241211112011393.png)

![image-20241210194741793](https://leyunone-img.oss-cn-hangzhou.aliyuncs.com/image/2024-12-11/image-20241210194741793.png)

选择你想要的可视化界面，完成使用

## 集成SpringBoot快速入门

### 引入依赖

版本号和安装的elasticsearch版本对齐，且缺一不可

```xml
        <dependency>
            <groupId>org.elasticsearch.client</groupId>
            <artifactId>elasticsearch-rest-high-level-client</artifactId>
            <version>7.12.1</version>
        </dependency>
        <dependency>
            <groupId>org.elasticsearch.client</groupId>
            <artifactId>elasticsearch-rest-client</artifactId>
            <version>7.12.1</version>
        </dependency>
        <dependency>
            <groupId>org.elasticsearch</groupId>
            <artifactId>elasticsearch</artifactId>
            <version>7.12.1</version>
        </dependency>
```

### 创建客户端

```java
@Component
@ConfigurationProperties(prefix = "spring.elasticsearch")
public class ElasticSearchProperties {

    /**
     * es地址
     */
    private String host;

    /**
     * es端口
     */
    private int port;
}

	@bean
    public RestHighLevelClient restHighLevelClient(ElasticSearchProperties elasticSearchProperties) {
        return new RestHighLevelClient(RestClient.builder(
                new HttpHost(
                        elasticSearchProperties.getHost(),
                        elasticSearchProperties.getPort(),
                        "http"
                )
        ));
    }
```

### 操作

本文只简单介绍常用的基本CRUD操作，有需要非常建议查看文档：[https://www.elastic.co/guide/en/elasticsearch/client/java-rest/7.17/java-rest-high-document-index.html](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/7.17/java-rest-high-document-index.html)

配合网络上的各种优质博客食用，因为es已经把api操作封装的特别傻瓜式了 [捂脸.jpg]

假设构建对象 **EsConstructBO**:

```java
public class EsConstructBO {
    private Object id;
    private JSONObject doc;
}
```

#### **文档的批量操作**

包括批量增加、批量更新、批量删除、批量更新或插入

**增加**

```java
 private void batchInsert(String indexName, List<EsConstructBO> esConstructs) {
            BulkRequest request = new BulkRequest();
            for (EsConstructBO esConstruct : esConstructs) {
                request.add(new IndexRequest(indexName).id(esConstruct.getId().toString())
                        .opType("create").source(esConstruct.getDoc(), XContentType.JSON));
            }
            restHighLevelClient.bulk(request, RequestOptions.DEFAULT);
    }
```

**更新**

```java
 private void batchUpdate(String indexName, List<EsConstructBO> esConstructs) {
            BulkRequest request = new BulkRequest();
            for (EsConstructBO esConstruct : esConstructs) {
                request.add(new UpdateRequest(indexName, esConstruct.getId().toString()).doc(esConstruct.getDoc(), XContentType.JSON));
            }
            restHighLevelClient.bulk(request, RequestOptions.DEFAULT);
    }
```

**删除**

```java
 private void batchDelete(String indexName, List<EsConstructBO> esConstructs) {
            BulkRequest request = new BulkRequest();
            for (EsConstructBO esConstruct : esConstructs) {
                request.add(new DeleteRequest(indexName, esConstruct.getId().toString()));
            }
            restHighLevelClient.bulk(request, RequestOptions.DEFAULT);
    }
```

**更新或插入**

```java
 private void batchSaveOrUpdate(String indexName, List<EsConstructBO> esConstructs) {
            BulkRequest request = new BulkRequest();
            for (EsConstructBO esConstruct : esConstructs) {
                request.add(new UpdateRequest(indexName, esConstruct.getId().toString()).upsert(XContentType.JSON).doc(esConstruct.getDoc()));
            }
            restHighLevelClient.bulk(request, RequestOptions.DEFAULT);
    }
```

#### 文档查询

围绕构建SearchSourceBuilder进行查询：

```java
SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
```

比方说需要分页，查询第一页的10条数据则：

```java
        sourceBuilder.size(10);
        sourceBuilder.from(0);
```

比方说需要根据某些条件进行查询，构建BoolQueryBuilder对象：

```java
        BoolQueryBuilder queryBuilder = QueryBuilders.boolQuery();
```

某个字段的范围查询，比如时间：

```java
        RangeQueryBuilder rangequerybuilder = QueryBuilders
                  .rangeQuery("createTime");
                  .from(Long.parseLong(String.valueOf(matchMap.get("startTime"))))
                  .to(Long.parseLong(String.valueOf(matchMap.get("endTime"))));
        queryBuilder.must(rangequerybuilder);
```

需要根据某个字段排序搜索：

```java
		 sourceBuilder.sort("createTime");
```

根据某个关键字搜索：

```java
		queryBuilder.must(QueryBuilders.termQuery("name","你好"));
```

根据某几个关键字复合搜索：

```java
		queryBuilder.must(QueryBuilders.multiMatchQuery("关键字",new String[]{"name","age","id"}))
```

文档中的所有字段作为搜索关键字字段：

```java
		queryBuilder.must(QueryBuilders.queryStringQuery(query.getKeyWord()));
```

高亮搜索文本中的关键字字符串：

```java
        HighlightBuilder highlightBuilder = new HighlightBuilder();
        highlightBuilder.field("高亮的字段名");
        highlightBuilder.requireFieldMatch(false);
        highlightBuilder.preTags("<span class='key-text' style='color:red'>");
        highlightBuilder.postTags("</span>");
        sourceBuilder.highlighter(highlightBuilder);
```

构建之后，搜索实际操作：

```java
		//indexName为数组，填多个时说明本次搜索为多文档复合查询
		SearchRequest searchRequest = new SearchRequest(indexName);
        searchRequest.source(sourceBuilder);
		SearchResponse search = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
```

处理响应参：

```java
public class EsSearchResultData {
    private Long total = 0L;
    private List<T> records = new ArrayList<>();
}
   
```

```java
    public static EsSearchResultData EsSearchResultData<T> convertSearchResult(SearchResponse searchResponse, Class<T> response) {
        SearchHits hits = searchResponse.getHits();
        EsSearchResultData<T> esSearchResultData = new EsSearchResultData<>();
        esSearchResultData.setTotal(hits.getTotalHits().value);
        List<T> result = new ArrayList<>();
        esSearchResultData.setRecords(result);

        for (SearchHit hit : hits.getHits()) {
            //json字符串
            T o = JSONObject.parseObject(hit.getSourceAsString(), response);
            Map<String, HighlightField> highlightFields = hit.getHighlightFields();
            if (CollectionUtil.isNotEmpty(highlightFields)) {
                //高亮匹配到的第一个字段
                o.setDisplayText(highlightFields.values().iterator().next().getFragments()[0].string());
            }
            result.add(o);
        }
        return esSearchResultData;
    }
```

