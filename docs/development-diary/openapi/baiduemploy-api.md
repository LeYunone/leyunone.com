---
date: 2023-04-11
title: 百度站长API收录-JAVA封装
category: 
  - OpenApi
tag:
  - 开发日记
  - OpenApi
---
# 百度站长API收录-JAVA封装

>  百度收录URL的提交方式有三种，API、sitemap解析、手动提交；但是由于百度站长的安全验证、提交等等问题，导致URL无法提上去。

然，API接口则没有报错的问题，所以对于每一个站长来说，封装一个优于百度站长收录体验的Open-api是非常有必要的；

**项目地址：** [https://github.com/LeYunone/leyunone-open-api](https://github.com/LeYunone/leyunone-open-api)

## 两个方法

1. 单个URL提交
2. sitemap地址，解析其中URL后，批量提交

依赖工具包：[Hutool-HttpRequest](https://hutool.cn/docs/#/http/Http%E8%AF%B7%E6%B1%82-HttpRequest)

```xml
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>5.8.0.M3</version>
        </dependency>
```

### 1\单URL

```java
        String url = "http://data.zz.baidu.com/urls?site=站点&token=xxxx";
        Map<String, String> head = new HashMap<>();
        head.put("Host", "data.zz.baidu.com");
        head.put("User-Agent", "curl/7.12.1");
        head.put("Content-Length", "83");
        head.put("Content-Type", "text/plain");
		String employUrl = "需收录地址";
```

```java
{
        HttpRequest httpr = HttpRequest
            .post(post.getUrl()).body(employUrl);
        for (String key : head.keySet()) {
            httpr.header(key, head.get(key));
        }
}
```

### 2\sitemap解析

```java
        String url = "http://data.zz.baidu.com/urls?site=站点&token=xxxx";
        Map<String, String> head = new HashMap<>();
        head.put("Host", "data.zz.baidu.com");
        head.put("User-Agent", "curl/7.12.1");
        head.put("Content-Length", "83");
        head.put("Content-Type", "text/plain");
		String siteMapUrl = "sitemap地址";
```

```java
    public static List<String> siteMapUrl2Str(String siteMapUrl) throws Exception{
        List<String> urls = new ArrayList<>();
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance(); 
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document document = db.parse(siteMapUrl);
            NodeList urlList = document.getElementsByTagName("url");
            int urlCnt = urlList.getLength();
            logger.info("=====sitemapurl:{},======urlcount:{}", siteMapUrl, urlCnt);
            for (int i = 0; i < urlCnt; i++) {
                Node url = urlList.item(i);
                NodeList childNodes = url.getChildNodes();
                for (int k = 0; k < childNodes.getLength(); k++) {
                    String nodeName = childNodes.item(k).getTextContent().trim();
                    if ("loc".equals(childNodes.item(k).getNodeName()) && nodeName.endsWith("html")) {
                        String resUrl = nodeName;
                        if (nodeName.startsWith("http://") && !nodeName.contains("www")) {
                            nodeName = nodeName.substring(7);
                            resUrl = "http://www.";
                            resUrl = resUrl.concat(nodeName);
                        }
                        urls.add(resUrl);
                    }
                }
            }
        return urls;
    }
```

```java
{
    String employUrls = StringUtils.join(urls,'\n');
}
```

```java
{
        HttpRequest httpr = HttpRequest
            .post(post.getUrl()).body(employUrl);
        for (String key : head.keySet()) {
            httpr.header(key, head.get(key));
        }
}
```
